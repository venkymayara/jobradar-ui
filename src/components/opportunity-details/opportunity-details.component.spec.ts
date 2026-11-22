import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { Opportunity } from '../../models/opportunity.model';
import { OpportunityDetailsComponent } from './opportunity-details.component';

const opportunity: Opportunity = {
  opportunityId: 1,
  title: 'Developer walk-in',
  companyName: 'Example company',
  companyLogo: null,
  location: 'Hyderabad',
  workMode: 'ON_SITE',
  employmentType: 'FULL_TIME',
  minExperience: 0,
  maxExperience: 2,
  minSalary: null,
  maxSalary: null,
  currencyCode: 'INR',
  opportunityType: 'WALK_IN',
  description: 'Meet the hiring team.',
  applicationUrl: null,
  publishedAt: null,
  applicationDeadline: null,
  skills: [],
  roles: [],
  status: 'PENDING',
  verified: false,
  statusHistory: [],
  companyId: 1,
  locationId: 1,
  sourceUrl: null,
  driveDate: '2027-01-20',
  driveStartTime: '09:00',
  driveEndTime: '10:00',
  venue: 'Example office',
  venueAddress: null,
};

describe('Opportunity review UI', () => {
  const api = environment.apiBaseUrl;
  let http: HttpTestingController;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'opportunities/:id', component: OpportunityDetailsComponent },
          {
            path: 'dashboard/admin/review/:id',
            component: OpportunityDetailsComponent,
            data: { adminReview: true },
          },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { restoreSession: () => of(undefined) } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => http.verify());

  it('sends the administrator decision and displays the new state', async () => {
    const component = await harness.navigateByUrl(
      '/dashboard/admin/review/1',
      OpportunityDetailsComponent,
    );
    http.expectOne(api + '/admin/opportunities/1').flush({
      data: { opportunity, submittedBy: 'Submitter', submittedAt: '2026-11-22T12:00:00Z' },
    });
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('Review submission');
    component.decision.set('REQUEST_DETAILS');
    component.note.setValue('Please confirm registration.');
    harness.routeNativeElement
      ?.querySelector('form')
      ?.dispatchEvent(new Event('submit', { cancelable: true }));

    const request = http.expectOne(api + '/admin/opportunities/1/review');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      decision: 'REQUEST_DETAILS',
      note: 'Please confirm registration.',
    });
    request.flush({ data: { ...opportunity, status: 'NEEDS_DETAILS' } });
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('More details requested');
    expect(harness.routeNativeElement?.textContent).toContain('Review recorded.');
    expect(harness.routeNativeElement?.querySelector('form')).toBeNull();
  });

  it('lets the owner send additional details back to the queue', async () => {
    const component = await harness.navigateByUrl('/opportunities/1', OpportunityDetailsComponent);
    http.expectOne(api + '/opportunities/1').flush({
      data: { ...opportunity, status: 'NEEDS_DETAILS', canRespond: true },
    });
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('Provide more details');
    component.note.setValue('Registration is online.');
    harness.routeNativeElement
      ?.querySelector('form')
      ?.dispatchEvent(new Event('submit', { cancelable: true }));

    const request = http.expectOne(api + '/opportunities/1/review-response');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ message: 'Registration is online.' });
    request.flush({ data: opportunity });
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain(
      'Your details were sent for another review.',
    );
    expect(harness.routeNativeElement?.querySelector('form')).toBeNull();
  });
});
