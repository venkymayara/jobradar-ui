# JobRadar API contract (planned)

These are frontend DTO expectations for the separate Spring Boot repository. They describe planned contracts; they do not confirm that an endpoint is implemented or connected to SQL Server. The API base is `/api/v1` and is configured per Angular environment.

## Conventions

- JSON request and response bodies use `camelCase` DTO properties.
- List endpoints use `PageResponse<T>`: `{ "content": [], "page": 0, "size": 10, "totalElements": 0, "totalPages": 0, "first": true, "last": true }`.
- Dates use ISO 8601 strings. Monetary values include `currencyCode`.
- Authenticated requests use a short lived `Authorization: Bearer <access-token>` header. Refresh tokens are set by the server in an `HttpOnly; Secure; SameSite` cookie; the frontend never writes tokens to local storage.
- Common errors may include `{ "status": 400, "error": "Bad Request", "message": "...", "path": "/api/v1/...", "timestamp": "...", "fieldErrors": {} }`. The UI maps HTTP status to a safe user-facing message and does not display stack traces.

## DTO response shapes

`Opportunity` contains `opportunityId`, `title`, `companyName`, `companyLogo`, `location`, `workMode`, `employmentType`, `minExperience`, `maxExperience`, `minSalary`, `maxSalary`, `currencyCode`, `opportunityType`, `description`, `applicationUrl`, `publishedAt`, `applicationDeadline`, `skills`, `roles`, and `status`.

`WalkInDrive` contains `opportunityId`, `title`, `companyName`, `location`, `driveDate`, `startTime`, `endTime`, `venue`, `venueAddress`, `minExperience`, `maxExperience`, `skills`, and `instructions`.

`Category` contains `categoryId`, `categoryName`, `parentCategoryId`, `slug`, and `opportunityCount`. Optional presentation fields `description` and `icon` may be omitted.

`JobRole` contains `jobRoleId`, `roleName`, `slug`, `categoryId`, and `opportunityCount`. `Skill` contains `skillId`, `skillName`, and `opportunityCount`. Location, Company, User, and pagination DTOs are modeled in `src/models/`.

## Endpoints

| Method and endpoint | Query / request | Response | Authentication |
|---|---|---|---|
| `GET /home` | None | `{ categories: Category[], latestOpportunities: Opportunity[], upcomingWalkIns: WalkInDrive[], popularSkills: Skill[] }` | Public |
| `GET /opportunities` | `keyword`, `role`, repeated `skills`, `company`, `location`, `minExperience`, `maxExperience`, `workMode`, `employmentType`, `opportunityType`, `minSalary`, `maxSalary`, `postedWithin`, `page` (zero-based), `size`, repeated `sort` | `PageResponse<Opportunity>` | Public |
| `GET /opportunities/latest` | None | `Opportunity[]` | Public |
| `GET /opportunities/{id}` | Path ID | `Opportunity` | Public |
| `GET /walk-ins/upcoming` | `location`, `date`, `role`, repeated `skills`, `minExperience`, `maxExperience`, `page`, `size` | `PageResponse<WalkInDrive>` | Public |
| `GET /walk-ins/today` | Walk-in filter parameters | `WalkInDrive[]` | Public |
| `GET /walk-ins/{id}` | Path ID | `WalkInDrive` | Public |
| `GET /categories` | None | `Category[]` | Public |
| `GET /roles` | Optional `categoryId` | `JobRole[]` | Public |
| `GET /roles/{slug}` | Path slug | `JobRole` | Public |
| `GET /skills` | None | `Skill[]` | Public |
| `GET /skills/popular` | None | `Skill[]` | Public |
| `GET /locations` | Optional `keyword` | `Location[]` | Public |
| `GET /companies` | Optional `keyword` | `Company[]` | Public |
| `POST /auth/register` | `RegisterRequest`: `displayName`, `email`, `password` | `User` | Public |
| `POST /auth/login` | `AuthCredentials`: `email`, `password` | `AuthSession`; server also sets refresh cookie | Public |
| `POST /auth/refresh` | Empty JSON body; refresh cookie | `AuthSession` with a new short lived access token | Refresh cookie |
| `POST /auth/logout` | Empty JSON body; refresh cookie | Empty response; server clears refresh cookie | Refresh cookie |
| `GET /users/me` | None | `User` | Required |
| `GET /users/me/dashboard` | None | `DashboardSummary` | Required |
| `GET /users/me/opportunities` | `page`, `size` | `PageResponse<Opportunity>` | Required |
| `GET /users/me/saved` | None | `Opportunity[]` | Required |
| `POST /opportunities/{id}/save` | Empty JSON body | Empty response | Required |
| `DELETE /opportunities/{id}/save` | Path ID | Empty response | Required |
| `GET /moderation/reports` | `page`, `size`, optional `sort` | `PageResponse<ModerationReport>` | Moderator/admin |
| `PATCH /moderation/reports/{id}` | `UpdateReportRequest`: `status`, optional `moderatorNote` | `ModerationReport` | Moderator/admin |

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

The API has not been called against a running Spring Boot service in this workspace, so these checks remain for the backend integration environment.
