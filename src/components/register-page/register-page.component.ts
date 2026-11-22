import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { getApiErrorMessage } from '../../services/api-error.util';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly form = this.fb.nonNullable.group({
    displayName: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[\x21-\x7E]{12,72}$/,
        ),
      ],
    ],
    confirmPassword: ['', Validators.required],
  });
  readonly loading = signal(false);
  readonly error = signal('');
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    if (value.password !== value.confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth
      .register({ displayName: value.displayName, email: value.email, password: value.password })
      .subscribe({
        next: () => void this.router.navigate(['/login'], { queryParams: { registered: '1' } }),
        error: (error) => {
          this.error.set(getApiErrorMessage(error));
          this.loading.set(false);
        },
      });
  }
}
