import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../environments/environment';
import { WalkInDrive } from '../../models/walk-in.model';
import { WalkInPageComponent } from './walk-in-page.component';

const drive: WalkInDrive = {
  opportunityId: 1,
  title: 'Approved developer walk-in',
  companyName: 'Example Company',
  location: 'Hyderabad',
  driveDate: '2026-11-24',
  startTime: '09:30',
  endTime: '20:00',
  timeZoneId: 'Asia/Kolkata',
  driveStartAtUtc: '2026-11-24T04:00:00Z',
  driveEndAtUtc: '2026-11-24T14:30:00Z',
  venue: 'Example Office',
  venueAddress: null,
  minExperience: 0,
  maxExperience: 2,
  skills: [],
  instructions: null,
  status: 'ACTIVE',
};

describe('Walk-in drives', () => {
  let fixture: ComponentFixture<WalkInPageComponent>;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(WalkInPageComponent);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  function request(date: string | null = null) {
    return http.expectOne(
      (request) =>
        request.url === environment.apiBaseUrl + '/walk-ins' &&
        request.params.get('location') === 'Hyderabad' &&
        request.params.get('date') === date,
    );
  }

  it('renders approved rows when the initial HTTP response arrives', async () => {
    expect(fixture.nativeElement.textContent).toContain('Loading walk-in drives');
    request().flush({ data: { content: [drive] } });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-walk-in-card')?.textContent).toContain(
      drive.title,
    );
    expect(fixture.nativeElement.querySelector('app-walk-in-calendar')?.textContent).toContain(
      drive.companyName,
    );
    expect(fixture.nativeElement.textContent).not.toContain('Loading walk-in drives');
  });

  it('applies the date filter and settles on the empty state', async () => {
    request().flush({ data: { content: [drive] } });
    await fixture.whenStable();

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select[name="date"]');
    select.value = 'THIS_WEEK';
    select.dispatchEvent(new Event('change'));
    fixture.nativeElement.querySelector('app-walk-in-filter button').click();

    request('THIS_WEEK').flush({ data: { content: [] } });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('No walk-in drives match these filters');
    expect(fixture.nativeElement.querySelector('app-walk-in-card')).toBeNull();
  });

  it('shows an error after an unsuccessful request', async () => {
    request().flush({}, { status: 500, statusText: 'Server error' });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('trouble');
    expect(fixture.nativeElement.textContent).not.toContain('Loading walk-in drives');
  });
});
