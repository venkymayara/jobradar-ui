import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    // API data lives in the separate Spring Boot service; render these routes in-browser
    // so prerendering does not require the API to be running during Angular builds.
    renderMode: RenderMode.Client,
  },
];
