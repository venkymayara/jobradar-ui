import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PreferencesService } from '../../services/preferences.service';

@Component({
  selector: 'app-preferences-page',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatSlideToggleModule],
  templateUrl: './preferences-page.component.html',
  styleUrl: './preferences-page.component.scss',
})
export class PreferencesPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly preferences = inject(PreferencesService);
  private readonly destroyRef = inject(DestroyRef);
  readonly form = this.fb.nonNullable.group({
    emailNotificationsEnabled: true,
    jobAlertsEnabled: true,
  });
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  readonly loadError = signal('');
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.loadError.set('');
    this.preferences
      .get()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (value) => {
          this.form.reset(value);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set('Preferences could not be loaded.');
          this.loading.set(false);
        },
      });
  }
  save(): void {
    if (this.loading() || this.loadError() || this.saving() || this.form.pristine) return;
    this.saving.set(true);
    this.message.set('');
    this.error.set('');
    this.preferences
      .update(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (value) => {
          this.form.reset(value);
          this.message.set('Preferences saved.');
          this.saving.set(false);
        },
        error: () => {
          this.error.set('Preferences could not be saved.');
          this.saving.set(false);
        },
      });
  }
}
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
