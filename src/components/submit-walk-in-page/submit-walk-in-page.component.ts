import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CatalogService } from '../../services/catalog.service';
import { OpportunityService } from '../../services/opportunity.service';
import { Company } from '../../models/company.model';
import { Location } from '../../models/location.model';
import { JobRole } from '../../models/role.model';
import { Skill } from '../../models/skill.model';
import { getApiErrorMessage } from '../../services/api-error.util';

const DRIVE_TIME_ZONE = 'Asia/Kolkata';
const driveCalendar = new Intl.DateTimeFormat('sv-SE', {
  timeZone: DRIVE_TIME_ZONE,
  dateStyle: 'short',
});

@Component({
  selector: 'app-submit-walk-in-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './submit-walk-in-page.component.html',
  styleUrl: './submit-walk-in-page.component.scss',
})
export class SubmitWalkInPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly catalog = inject(CatalogService);
  private readonly opportunities = inject(OpportunityService);
  private readonly destroyRef = inject(DestroyRef);
  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    companyId: [0],
    companyName: ['', Validators.maxLength(160)],
    locationId: [0, Validators.min(1)],
    description: ['', [Validators.required, Validators.maxLength(10000)]],
    sourceUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/i)]],
    driveDate: ['', Validators.required],
    driveStartTime: ['', Validators.required],
    driveEndTime: ['', Validators.required],
    venue: ['', [Validators.required, Validators.maxLength(180)]],
    venueAddress: ['', Validators.maxLength(500)],
    minExperience: [
      0,
      [Validators.required, Validators.min(0), Validators.max(60), Validators.pattern(/^\d+$/)],
    ],
    maxExperience: [
      0,
      [Validators.required, Validators.min(0), Validators.max(60), Validators.pattern(/^\d+$/)],
    ],
    contactEmail: ['', [Validators.email, Validators.maxLength(254)]],
    contactPhone: ['', Validators.pattern(/^[+()0-9 .-]{7,32}$/)],
    instructions: ['', Validators.maxLength(2000)],
    roleId: [0, Validators.min(1)],
    skillIds: [[] as number[]],
    declaration: [false, Validators.requiredTrue],
  });
  readonly companiesList = signal<Company[]>([]);
  readonly locationsList = signal<Location[]>([]);
  readonly rolesList = signal<JobRole[]>([]);
  readonly skillsList = signal<Skill[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly optionsError = signal('');
  readonly minDate = driveCalendar.format(new Date());
  ngOnInit(): void {
    this.form.controls.companyId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => {
        const name = this.form.controls.companyName;
        if (id > 0) name.disable();
        else name.enable();
      });
    this.loadOptions();
  }
  loadOptions(): void {
    this.loading.set(true);
    this.optionsError.set('');
    this.catalog
      .walkInOptions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.companiesList.set(data.companies);
          this.locationsList.set(data.locations);
          this.rolesList.set(data.roles);
          this.skillsList.set(data.skills);
          this.loading.set(false);
        },
        error: (err) => {
          this.optionsError.set(getApiErrorMessage(err));
          this.loading.set(false);
        },
      });
  }
  isInvalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && (control.touched || control.dirty);
  }
  selectSkill(skillId: number, selected: boolean): void {
    const control = this.form.controls.skillIds;
    control.setValue(
      selected ? [...control.value, skillId] : control.value.filter((id) => id !== skillId),
    );
  }
  submit(): void {
    if (this.loading() || this.optionsError() || this.saving() || this.success()) return;
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Review the highlighted fields before submitting.');
      return;
    }
    const value = this.form.getRawValue();
    if (value.companyId < 1 && !value.companyName.trim()) {
      this.error.set('Select an approved company or enter the company name.');
      return;
    }
    if (!value.contactEmail && !value.contactPhone) {
      this.error.set('Provide a contact email or phone number.');
      return;
    }
    if (value.maxExperience < value.minExperience) {
      this.error.set('Maximum experience must be at least the minimum experience.');
      return;
    }
    if (value.driveEndTime <= value.driveStartTime) {
      this.error.set('End time must be after start time on the same date.');
      return;
    }
    if (Date.parse(`${value.driveDate}T${value.driveEndTime}+05:30`) <= Date.now()) {
      this.error.set('Choose a walk-in that has yet to end in India Standard Time.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.success.set('');
    this.opportunities
      .create({
        title: value.title,
        companyId: value.companyId > 0 ? value.companyId : null,
        companyName: value.companyId > 0 ? null : value.companyName.trim(),
        locationId: value.locationId,
        workMode: 'ON_SITE',
        employmentType: 'FULL_TIME',
        minExperience: value.minExperience,
        maxExperience: value.maxExperience,
        minSalary: null,
        maxSalary: null,
        currencyCode: 'INR',
        opportunityType: 'WALK_IN',
        description: value.description,
        applicationUrl: null,
        sourceUrl: value.sourceUrl.trim(),
        driveDate: value.driveDate,
        driveStartTime: value.driveStartTime,
        driveEndTime: value.driveEndTime,
        venue: value.venue,
        venueAddress: value.venueAddress || null,
        timeZoneId: DRIVE_TIME_ZONE,
        contactName: null,
        contactPhone: value.contactPhone || null,
        contactEmail: value.contactEmail || null,
        instructions: value.instructions || null,
        roleIds: [value.roleId],
        skillIds: value.skillIds,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.success.set('Walk-in drive submitted for moderation.');
          this.saving.set(false);
        },
        error: (err) => {
          this.error.set(getApiErrorMessage(err));
          this.saving.set(false);
        },
      });
  }
}
