# ACCWS Backend Scope — Client Account (v0)

Rough scoping doc as we transition the wireframe to a real API. Focus here is **what a Client user needs at the most basic level**. Admin scope is noted where it shapes the data model, but is not the priority for this pass.

Frontend is Angular 21 with a service layer already stubbed against `MockDataService`. Services call a `USE_MOCK_DATA` flag and are ready to swap to `HttpClient` against a `/api` base URL (`src/app/core/services/api.config.ts`). Type definitions live in `src/app/core/models/` and are the source of truth for payload shapes.

---

## 1. Product in one paragraph

ACCWS (Athabasca County Wastewater Solutions) sells wastewater treatment products and ongoing service to municipalities and utility commissions. The platform has two audiences:

- **Admin / ACCWS staff** — manages clients, logs field visits, builds treatment plans, issues proposals.
- **Client / Municipal operator** — a read-mostly view into *their own* systems: what treatment is scheduled, what ACCWS did on site, sampling results, and reference content (products, case studies).

Everything a client sees must be scoped to their `clientId`.

---

## 2. Users & Auth (minimum)

```
User {
  id, name, email, role: 'admin' | 'client',
  clientId?: string   // required when role === 'client'
  phone?, title?, avatar?
}
```

Backend needs to support, at minimum:

- `POST /api/auth/login` → `{ token, user }`
- `GET  /api/auth/me`
- `POST /api/auth/logout`
- Bearer token on all protected routes.
- Role claim in the token so the frontend guard (`roleGuard('admin')`) can hide admin-only routes. Backend must **also** enforce — don't trust the client.
- Every list endpoint, when called by a `client` user, filters by their `clientId` server-side.

OAuth (Google / Microsoft) is in the wireframe but can be deferred.

---

## 3. Core entities the client account touches

These are the entities a client user reads. Admin writes most of them; client mostly reads.

| Entity            | Client can | Admin can    | Notes                                        |
|-------------------|-----------|--------------|----------------------------------------------|
| `Client`          | read self | full CRUD    | Client only ever sees their own record       |
| `WastewaterSystem`| read      | full CRUD    | Filtered by `clientId`                       |
| `Cell` (nested)   | read      | full CRUD    | Belongs to a system                          |
| `TreatmentPlan`   | read      | full CRUD    | Dosing schedule per zone, per month          |
| `Product`         | read      | full CRUD    | Global catalog, not client-scoped            |
| `SiteVisit`       | read      | create/update| Field visit log; big nested payload          |
| `SampleRecord`    | read      | full CRUD    | Lab results, sludge surveys                  |
| `CaseStudy`       | read      | full CRUD    | Marketing content, global                    |
| `Proposal`        | —         | full CRUD    | **Admin only.** Not visible to client at all |

Full field-level types are in `src/app/core/models/`. Don't re-derive — mirror those.

---

## 4. What the Client account actually does

The client experience is 6 screens. This is the MVP API surface.

### 4.1 Dashboard (`/dashboard`)
- KPIs: count of their active systems, count of active treatment plans.
- **"What's Coming Up"** — upcoming dosing tasks for the *current month*, derived from `TreatmentPlan.dosingSchedules[].months`.
- Recent activity + alerts, scoped to their systems.

Endpoints:
- `GET /api/reporting/dashboard` — rolled-up counts for the current user.
- `GET /api/reporting/activity-log?limit=10`
- `GET /api/reporting/alerts`
- Upcoming tasks can be derived client-side from `GET /api/treatments` if the dosing schedule is included; a dedicated `GET /api/treatments/upcoming?month=4` is cleaner.

### 4.2 My Sites / Map (`/map`)
- Leaflet map, pins = their systems. Pin color by `status` (`healthy | attention | critical | offline`).
- Popup: name, type, status, link to detail.

Endpoint: `GET /api/systems` (server filters by `clientId`). Needs `location { lat, lng }` on every system.

### 4.3 Systems list + detail (`/systems`, `/systems/:id`)
Detail page has 3 tabs:
- **Overview** — system specs + cells table.
- **Visits** — list of `SiteVisit` for this system.
- **Data** — list of `SampleRecord` + trend charts (BOD, TSS over time).

Endpoints:
- `GET /api/systems`, `GET /api/systems/:id`
- `GET /api/systems/:id/site-visits`
- `GET /api/systems/:id/sampling`

### 4.4 Site Visits (`/site-visits`, `/site-visits/:id`)
Biggest payload in the app. Visit has a discriminated union `observation` keyed on system type (`lift-station` | `lagoon` | `wwtp`) — each has its own fields (FOG, sludge, algae, water color, H2S, odour intensity, etc.). See `src/app/core/models/site-visit.ts`.

Also carries: activities checklist, product applications, weather snapshot, photo IDs, follow-up flag.

Endpoints for client (read-only to start):
- `GET /api/site-visits` (scoped)
- `GET /api/site-visits/:id`
- Photos referenced by id — need a `GET /api/photos/:id` or signed URL story.

### 4.5 Treatments (`/treatments`, `/treatments/:id`)
Client views the annual dosing calendar — zones × months grid, product + quantity + frequency per cell.

Endpoints:
- `GET /api/treatments` (scoped)
- `GET /api/treatments/:id`
- `GET /api/products/:id` — product names in the table are clickable.

### 4.6 Products (`/products`, `/products/:id`)
Global catalog. No client scoping. Pricing is modeled but currently hidden in the UI — backend should still return it; frontend decides what to show.

### 4.7 Account (`/account`)
- `GET /api/auth/me`
- `PATCH /api/users/:id` — name, email, phone, title.

---

## 5. Things that are explicitly **not** in client scope

Use this to avoid over-building:

- Clients list / other clients' data.
- Proposals — all routes, all fields.
- Creating/editing treatment plans, systems, sampling records, or case studies.
- The "Log Visit" form. Wireframe has the button, but for v0 assume admin-only creation.

---

## 6. Cross-cutting requirements

- **Scoping**: every list endpoint must filter by the caller's `clientId` when `role === 'client'`. Detail endpoints must 403 (not 404) if the requested resource belongs to another client — or 404 if you prefer not to leak existence; pick one and be consistent.
- **Photo storage**: `SiteVisit.photoIds` and `CaseStudy.imageUrl` imply blob storage. Signed URLs preferred so the API doesn't proxy bytes.
- **Timestamps**: all dates are ISO 8601 strings in the frontend models. Keep it that way.
- **Money**: `Product.price`, `Proposal.total` etc. are CAD numbers. Decide on units (cents vs dollars) early.
- **Geospatial**: `location { lat, lng }` on every system. No bounds-query needed yet — client-side filters the full list.
- **Activity + alerts**: derive server-side from domain events (system status change, new sample, visit completed). Don't expect the frontend to synthesize these.

---

## 7. Suggested build order for the client slice

1. Auth + `/me` + role-scoped middleware.
2. `GET /api/systems` (scoped) + `/api/systems/:id`. Unlocks the map and Systems list.
3. `GET /api/treatments` (scoped). Unlocks the treatments screen and the dashboard's "What's Coming Up".
4. `GET /api/site-visits` + `/api/site-visits/:id`. Unlocks the Visits tab — biggest schema, save for when the shape has been reviewed.
5. `GET /api/sampling`. Unlocks the Data tab and trend charts.
6. `GET /api/products` (global). Unlocks product links from treatments.
7. Reporting: dashboard summary, activity log, alerts.

Case studies and account edits are low-priority.

---

## 8. Open questions for the backend team

- Are we using JWT or server sessions? Frontend is agnostic but caching/CORS story differs.
- Do clients ever log their own visits, or is that always ACCWS staff? (Affects whether `POST /api/site-visits` is exposed to `role: 'client'`.)
- Photo storage — S3-style signed URLs, or proxied through the API?
- Is there an existing ERP / CRM (e.g. for proposals, products) that the API should read from, or is this the system of record?
- Multi-tenancy model: one DB with `clientId` column, or hard isolation per client?
