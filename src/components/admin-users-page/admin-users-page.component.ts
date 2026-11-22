import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize, switchMap } from 'rxjs';
import { PaginationComponent } from '../pagination/pagination.component';
import { ApiResponse } from '../../models/api-response.model';
import { PageResponse } from '../../models/pagination.model';
import { ApiService } from '../../services/api.service';
import { getApiErrorMessage } from '../../services/api-error.util';
import { AuthService } from '../../services/auth.service';

interface AdminUser {
  userId: number;
  displayName: string;
  username: string;
  administrator: boolean;
  moderator: boolean;
  superAdministrator: boolean;
}

@Component({
  selector: 'app-admin-users-page',
  imports: [
    PaginationComponent,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSnackBarModule,
  ],
  templateUrl: './admin-users-page.component.html',
  styleUrl: './admin-users-page.component.scss',
})
export class AdminUsersPageComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly confirmation = viewChild.required<TemplateRef<unknown>>('roleConfirmation');
  readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private search = '';
  private page = 0;
  readonly query = new FormControl('', { nonNullable: true });
  readonly result = signal<PageResponse<AdminUser> | null>(null);
  readonly rows = computed(() => this.result()?.content ?? []);
  readonly columns = computed(() => {
    const columns = ['name', 'signIn', 'access'];
    if (this.auth.isSuperAdmin()) columns.push('actions');
    return columns;
  });
  readonly loading = signal(true);
  readonly error = signal('');
  readonly updating = signal(false);
  readonly actionError = signal('');
  private confirmationRef?: MatDialogRef<unknown>;

  constructor() {
    this.destroyRef.onDestroy(() => this.confirmationRef?.close());
  }

  ngOnInit(): void {
    this.load();
  }

  findUsers(): void {
    this.search = this.query.value.trim();
    this.page = 0;
    this.load();
  }

  changePage(page: number): void {
    this.page = page - 1;
    this.load();
  }

  select(user: AdminUser): void {
    this.actionError.set('');
    this.confirmationRef = this.dialog.open(this.confirmation(), {
      data: user,
      width: '27rem',
      ariaLabelledBy: 'confirm-admin-access',
    });
  }

  confirm(user: AdminUser, confirmation: MatDialogRef<unknown>): void {
    if (this.updating()) return;
    const enabled = !user.administrator;
    this.updating.set(true);
    confirmation.disableClose = true;
    this.actionError.set('');
    this.auth
      .ensureCsrf()
      .pipe(
        switchMap(() =>
          this.api.put<ApiResponse<null>, { enabled: boolean }>(
            `/admin/users/${user.userId}/admin-permission`,
            { enabled },
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.updating.set(false);
          confirmation.disableClose = false;
        }),
      )
      .subscribe({
        next: () => {
          this.result.update(
            (page) =>
              page && {
                ...page,
                content: page.content.map((row) =>
                  row.userId === user.userId ? { ...row, administrator: enabled } : row,
                ),
              },
          );
          confirmation.close();
          this.snackBar.open(
            `Admin access ${enabled ? 'granted to' : 'revoked for'} ${user.displayName}.`,
            'Dismiss',
            { duration: 5000 },
          );
        },
        error: (error) => {
          this.actionError.set(getApiErrorMessage(error));
        },
      });
  }

  load(): void {
    this.actionError.set('');
    this.loading.set(true);
    this.error.set('');
    this.api
      .get<ApiResponse<PageResponse<AdminUser>>>('/admin/users', {
        search: this.search,
        page: this.page,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ data }) => {
          this.result.set(data);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(getApiErrorMessage(error));
          this.loading.set(false);
        },
      });
  }
}
