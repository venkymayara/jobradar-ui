import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UserService } from '../../services/user.service';

type ProfileFieldName = keyof ProfilePageComponent['form']['controls'];

interface ProfileField {
  name: ProfileFieldName;
  label: string;
  type?: 'tel' | 'number' | 'url';
  autocomplete?: string;
  placeholder?: string;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly users = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);
  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    phoneNumber: ['', Validators.maxLength(30)],
    location: ['', Validators.maxLength(160)],
    professionalHeadline: ['', Validators.maxLength(180)],
    skills: ['', Validators.maxLength(1000)],
    experienceYears: [
      null as number | null,
      [Validators.min(0), Validators.max(60), Validators.pattern(/^\d+$/)],
    ],
    linkedinUrl: ['', Validators.pattern(/^$|https?:\/\/.+/)],
    githubUrl: ['', Validators.pattern(/^$|https?:\/\/.+/)],
  });
  readonly groups: readonly {
    heading: string;
    showSignInEmail?: boolean;
    fields: readonly ProfileField[];
  }[] = [
    {
      heading: 'Account details',
      showSignInEmail: true,
      fields: [{ name: 'fullName', label: 'Full name', autocomplete: 'name' }],
    },
    {
      heading: 'Contact details',
      fields: [
        { name: 'phoneNumber', label: 'Phone number', type: 'tel', autocomplete: 'tel' },
        { name: 'location', label: 'Location', autocomplete: 'address-level2' },
      ],
    },
    {
      heading: 'Professional details',
      fields: [
        {
          name: 'professionalHeadline',
          label: 'Professional headline',
          placeholder: 'e.g. Software Engineer',
        },
        { name: 'experienceYears', label: 'Years of experience', type: 'number' },
        { name: 'skills', label: 'Skills', placeholder: 'e.g. Java, Angular, SQL' },
      ],
    },
    {
      heading: 'Professional links',
      fields: [
        { name: 'linkedinUrl', label: 'LinkedIn URL', type: 'url' },
        { name: 'githubUrl', label: 'GitHub URL', type: 'url' },
      ],
    },
  ];
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly saving = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  readonly signInEmail = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set('');
    this.users
      .getMe()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.signInEmail.set(user.email);
          this.form.patchValue({
            fullName: user.displayName,
            phoneNumber: user.phoneNumber ?? '',
            location: user.location ?? '',
            professionalHeadline: user.professionalHeadline ?? '',
            skills: user.skills ?? '',
            experienceYears: user.experienceYears ?? null,
            linkedinUrl: user.linkedinUrl ?? '',
            githubUrl: user.githubUrl ?? '',
          });
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set('Profile could not be loaded.');
          this.loading.set(false);
        },
      });
  }

  fieldError(name: ProfileFieldName): string {
    const errors = this.form.controls[name].errors;
    if (errors?.['required']) return 'Enter your full name.';
    if (errors?.['maxlength'])
      return `Use at most ${errors['maxlength'].requiredLength} characters.`;
    if (!errors) return '';
    return name === 'experienceYears'
      ? 'Enter a whole number between 0 and 60.'
      : 'Enter a link starting with https:// or http://.';
  }

  save(): void {
    if (this.saving() || this.loading() || this.loadError()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.message.set('');
    this.error.set('');
    this.users
      .updateProfile(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.message.set('Profile updated successfully.');
          this.saving.set(false);
        },
        error: () => {
          this.error.set('Profile could not be updated.');
          this.saving.set(false);
        },
      });
  }
}
