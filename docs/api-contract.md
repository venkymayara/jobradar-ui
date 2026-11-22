# JobRadar API contract (planned)

These are frontend DTO expectations for the Spring Boot API. The API base is `/api/v1` and is configured per Angular environment.

## Conventions

- JSON request and response bodies use `camelCase` DTO properties.
- List endpoints use `PageResponse<T>`: `{ "content": [], "page": 0, "size": 10, "totalElements": 0, "totalPages": 0, "first": true, "last": true }`.
- Dates use ISO 8601 strings. Monetary values include `currencyCode`.
- Authenticated requests use a short lived `Authorization: Bearer <access-token>` header. Refresh tokens are set by the server in an `HttpOnly; Secure; SameSite` cookie; the frontend never writes tokens to local storage.
- Responses use `{ "success": true, "message": "...", "data": {}, "timestamp": "..." }`; failures use the same shape with `success: false`. Validation failures put field messages in `data`. The UI maps HTTP status to a safe message and never displays stack traces.
- The Angular client fetches `/auth/csrf` before login, refresh, and logout. Its XSRF cookie is readable by the client and sent in the `X-XSRF-TOKEN` header; the refresh cookie remains HttpOnly.

## DTO response shapes

`Opportunity` contains company/location IDs and display values, `title`, `workMode`, `employmentType`, experience and salary ranges, `currencyCode`, `opportunityType`, `description`, source/application URLs, optional deadline and walk-in drive details, `publishedAt`, `skills`, `roles`, `status`, `verified`, and status history.

`WalkInDrive` contains opportunity and company identity, title, location, required roles and skills, experience and salary ranges, local `driveDate`/`startTime`/`endTime`, the drive's IANA `timeZoneId`, derived UTC `driveStartAtUtc`/`driveEndAtUtc`, venue/address, contact details, instructions, source URL, status, and verification state. Date filters use the local calendar of each physical drive.

`ExternalJob` contains an external provider ID, title, company, permitted summary, location, employment type, work mode, original job/application URL, provider, and fetch timestamps. It is always marked as external and is not treated as a community opportunity.

`Category` contains `categoryId`, `categoryName`, `parentCategoryId`, `slug`, and `opportunityCount`. Optional presentation fields `description` and `icon` may be omitted.

`JobRole` contains `jobRoleId`, `roleName`, `slug`, `categoryId`, and `opportunityCount`. `Skill` contains `skillId`, `skillName`, and `opportunityCount`. Location, Company, User, and pagination DTOs are modeled in `src/models/`.

## Endpoints

| Method and endpoint | Query / request | Response | Authentication |
|---|---|---|---|
| `GET /home` | None | `{ categories: Category[], latestOpportunities: Opportunity[], upcomingWalkIns: WalkInDrive[], popularSkills: Skill[] }`; limits of 8, 10, 6, and 10 respectively. Counts and previews use active, unexpired listings. Upcoming walk-ins require a future start. Contact and instruction fields in previews are null. | Public |
| `GET /opportunities` | `keyword`, `role`, repeated `skills`, `company`, `location`, `minExperience`, `maxExperience`, `workMode`, `employmentType`, `opportunityType`, `minSalary`, `maxSalary`, `postedWithin` (`24h`, `7d`, ISO duration), `page`, `size`, `sort` (`field,direction`) | `ApiResponse<PageResponse<Opportunity>>` | Public |
| `GET /opportunities/latest` | None | `ApiResponse<Opportunity[]>` | Public |
| `GET /external-jobs` | Optional `keyword`, `company`, `location`, `workMode`, `page`, `size` | `ApiResponse<PageResponse<ExternalJob>>` | Public |
| `GET /external-jobs/{externalId}` | Provider listing ID | `ApiResponse<ExternalJob>` | Public |
| `GET /external-jobs/providers` | None | `ApiResponse<string[]>` | Public |
| `GET /opportunities/{id}` | Path ID | `ApiResponse<Opportunity>` | Public; owner/moderator can view review states |
| `POST /opportunities` | `OpportunityRequest` | `ApiResponse<Opportunity>` in `PENDING` | Required |
| `PUT /opportunities/{id}` | `OpportunityRequest` | `ApiResponse<Opportunity>` | Owner or moderator/admin |
| `PATCH /opportunities/{id}/status` | `{ "status": "..." }` | `ApiResponse<Opportunity>` | Owner or moderator/admin |
| `DELETE /opportunities/{id}` | Path ID | `ApiResponse<null>` (soft removal) | Owner or moderator/admin |
| `PATCH /opportunities/{id}/verification` | `{ "verified": boolean }` | `ApiResponse<Opportunity>` | Moderator/admin |
| `GET /moderation/opportunities` | Pagination and sort | Pending review queue | Moderator/admin |
| `GET /admin/opportunities` | Pagination and sort | Non-removed opportunities | Admin |
| `GET /admin/opportunities/review-queue` | `status=PENDING` or `status=NEEDS_DETAILS`, pagination and sort | `ApiResponse<PageResponse<Opportunity>>` | Admin |
| `GET /admin/opportunities/{id}` | Path ID | `ApiResponse<{ opportunity, submittedBy, submittedAt }>` including private review history | Admin |
| `PATCH /admin/opportunities/{id}/review` | `decision` is `APPROVE`, `REJECT`, or `REQUEST_DETAILS`. The `note` is required for rejection and requests for details. | `ApiResponse<Opportunity>` with the new status | Admin |
| `POST /opportunities/{id}/review-response` | `{ "message": "..." }` | `ApiResponse<Opportunity>` returned to `PENDING`. The reply appears in private review history. | Opportunity owner |
| `POST /opportunities/{id}/report` | `reason` (`FAKE_JOB`, `EXPIRED`, `WRONG_INFORMATION`, `DUPLICATE`, `SUSPICIOUS_PAYMENT`, `MISLEADING_SALARY`, `BROKEN_URL`, `INAPPROPRIATE_CONTENT`) and optional `details` | `ApiResponse<OpportunityReport>`; submission never changes opportunity status | Required |
| `GET /moderation/reports` | `page`, `size`, `direction` | `ApiResponse<PageResponse<OpportunityReport>>` for open reports | Moderator/admin |
| `GET /moderation/reports/{id}` | Path ID | `ApiResponse<OpportunityReport>` including reviewer identity when reviewed | Moderator/admin |
| `PATCH /moderation/reports/{id}` | `{ "status": "REVIEWED" | "DISMISSED" }` | `ApiResponse<OpportunityReport>` including reviewer identity | Moderator/admin |
| `PATCH /moderation/opportunities/{id}/status` | `{ "status": "..." }` | `ApiResponse<Opportunity>` and status history entry | Moderator/admin |
| `PUT /admin/users/{id}/moderator-permission` | `{ "enabled": boolean }` | `ApiResponse<ModeratorPermission>` | Admin |
| `GET /admin/users` | Optional `search` (name or sign-in ID), `page`, `size` | `ApiResponse<PageResponse<AdminUser>>` with `userId`, `displayName`, `username`, `administrator`, and `moderator` | Admin |
| `GET /walk-ins` | Optional `keyword`, `location`, `date` (`TODAY`, `TOMORROW`, `THIS_WEEK`, `UPCOMING`, or `yyyy-MM-dd`), `role`, repeated `skills`, `company`, `minExperience`, `maxExperience`, `minSalary`, `maxSalary`, `page`, `size`, `sort`, `direction` | `ApiResponse<PageResponse<WalkInDrive>>` | Public |
| `GET /walk-ins/upcoming` | `location`, `role`, repeated `skills`, `company`, experience, `page`, `size`, `sort`, `direction` | `ApiResponse<PageResponse<WalkInDrive>>` | Public |
| `GET /walk-ins/today` | Location, role, skills, company, experience, `page`, `size`, `sort`, `direction` | `ApiResponse<PageResponse<WalkInDrive>>` | Public |
| `GET /walk-ins/{id}` | Path ID | `ApiResponse<WalkInDrive>` | Public |
| `GET /categories` | Optional `search`, `parentCategoryId`, `page`, `size`, `sort`, `direction` | `ApiResponse<PageResponse<Category>>` | Public |
| `GET /roles` | Optional `search`, `categoryId`, `page`, `size`, `sort`, `direction` | `ApiResponse<PageResponse<JobRole>>` | Public |
| `GET /roles/{slug}` | Path slug | `JobRole` | Public |
| `GET /skills` | Optional `search`, `page`, `size`, `sort`, `direction` | `ApiResponse<PageResponse<Skill>>` | Public |
| `GET /skills/popular` | Optional `search`, `page`, `size` | `ApiResponse<PageResponse<Skill>>` | Public |
| `GET /locations` | Optional `search` or `keyword`, `page`, `size`, `sort`, `direction` | `ApiResponse<PageResponse<Location>>` | Public |
| `GET /admin/{categories,roles,skills,locations}` | Optional `search`, category `parentCategoryId`/`categoryId`, `page`, `size`, `sort`, `direction` | `ApiResponse<PageResponse<TaxonomyDto>>` | Admin |
| `POST /admin/{categories,roles,skills,locations}` | Feature request DTO | `ApiResponse<TaxonomyDto>` | Admin |
| `PUT /admin/{categories,roles,skills,locations}/{id}` | Feature request DTO | `ApiResponse<TaxonomyDto>` | Admin |
| `PATCH /admin/{categories,roles,skills,locations}/{id}/activate` or `/deactivate` | None | `ApiResponse<null>` | Admin |
| `GET /companies` | Optional `search` or `keyword`, `page`, `size`, `sort`, `direction` | `ApiResponse<PageResponse<Company>>` | Public |
| `GET /companies/{id}` | Path ID | `ApiResponse<Company>` | Public |
| `POST /companies` | `CompanyRequest` | `ApiResponse<Company>` (pending, inactive, unverified) | Required |
| `GET /admin/companies` | Optional search and pagination | `ApiResponse<PageResponse<Company>>` | Admin |
| `POST /admin/companies` | `CompanyRequest` | `ApiResponse<Company>` (active, unverified) | Admin |
| `PUT /admin/companies/{id}` | `CompanyRequest` | `ApiResponse<Company>` | Admin |
| `PATCH /admin/companies/{id}/activate` or `/deactivate` | None | `ApiResponse<null>` | Admin |
| `PUT /admin/companies/{id}/verification` or `/moderation/companies/{id}/verification` | `{ "verified": boolean }` | `ApiResponse<Company>` | Admin or moderator |
| `GET /auth/csrf` | None | `ApiResponse<{ token }>` and XSRF cookie | Public |
| `POST /auth/register` | `RegisterRequest`: `fullName` (also accepts `displayName`), `email`, `password` | `ApiResponse<User>` | Public |
| `POST /auth/login` | `AuthCredentials`: `email`, `password` | `ApiResponse<AuthSession>`; server also sets refresh cookie | Public |
| `POST /auth/refresh` | Empty JSON body; refresh and XSRF cookies plus `X-XSRF-TOKEN` header | `ApiResponse<AuthSession>` with a new short lived access token | Refresh cookie |
| `POST /auth/logout` | Empty JSON body; refresh and XSRF cookies plus `X-XSRF-TOKEN` header | `ApiResponse<null>`; server clears refresh cookie | Refresh cookie |
| `GET /users/me` | None | `User` | Required |
| `GET /users/me/dashboard` | None | `DashboardSummary` | Required |
| `GET /users/me/opportunities` | `page`, `size` | `PageResponse<Opportunity>` | Required |
| `GET /users/me/saved` | `page`, `size`, `sort` (`savedAt`), `direction` | `ApiResponse<PageResponse<Opportunity>>`; only currently active opportunities are included | Required |
| `POST /opportunities/{id}/save` | Empty JSON body | `ApiResponse<null>` (201 Created); duplicate saves return 409 | Required |
| `DELETE /opportunities/{id}/save` | Path ID | `ApiResponse<null>` (200 OK); removing an absent save is idempotent | Required |

## Status codes

- `200 OK`: successful read or update.
- `201 Created`: successful registration or resource creation.
- `204 No Content`: successful delete/logout when the backend chooses an empty response.
- `400 Bad Request`: invalid DTO or query parameter; `fieldErrors` may identify fields.
- `401 Unauthorized`: missing/expired access token or invalid credentials.
- `403 Forbidden`: authenticated user lacks permission.
- `404 Not Found`: requested resource does not exist.
- `409 Conflict`: duplicate account or conflicting state.
- `500 Internal Server Error`: unexpected server failure. Do not include stack traces in public responses.

## Frontend integration notes

- `HomePageComponent` loads `/home` once through `HomeService` and passes its categories, jobs, walk-ins, and skills to child sections. This avoids four duplicate homepage requests.
- Job search submits on form submission (not on every keystroke). Filters, pagination, and sort state live in the URL and reload `GET /opportunities`.
- Walk-in filtering sends one request after the user applies filters. The calendar and cards share that response.
- API data is currently a planned integration contract. Do not treat these endpoints as verified against the Spring Boot service or SQL Server until backend integration tests have run.

## Spring Boot integration smoke check

1. Start the backend on `http://localhost:8081` with its `/api/v1` controller mappings and a reachable SQL Server database.
2. Configure Spring CORS for the Angular dev origin (normally `http://localhost:4200`). When refresh cookies are enabled, allow credentials and use an explicit allowed origin rather than `*`.
3. Run the UI with `npm start`; the development environment already targets `http://localhost:8081/api/v1`.
4. Check the public calls in browser Network tools: `GET /home`, `GET /opportunities`, and `GET /walk-ins/upcoming`. Verify JSON properties and pagination match the DTOs above.
5. Submit a job search and confirm the URL query state matches the outgoing request (`page` is zero-based for the API). Change a filter, sort, and page and confirm each causes one updated request.
6. Verify empty arrays, `400`, `401`, `403`, `404`, `500`, and network-offline behavior. The UI should display friendly messages, never a backend stack trace.
7. Test registration/login, refresh-cookie `Set-Cookie` attributes, token refresh after a `401`, and logout cookie clearing. Confirm no token is written to local storage or logged.
8. Test saved opportunities and moderator report updates only with the appropriate authenticated roles.

See [the Phase 1–9 audit](PHASE_1_TO_9_AUDIT.md) for the services and flows exercised against the local backend and database, and the integration checks still pending.
