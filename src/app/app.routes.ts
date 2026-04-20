import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { orgGuard } from './core/auth/org.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent),
  },
  {
    path: 'invitations/:token',
    loadComponent: () =>
      import('./features/auth/invitation-accept/invitation-accept').then(m => m.InvitationAcceptComponent),
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'auth/reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password').then(m => m.ResetPasswordComponent),
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./features/misc/forbidden/forbidden').then(m => m.ForbiddenComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
        canActivate: [orgGuard],
      },
      {
        path: 'map',
        loadComponent: () => import('./features/map/map-view').then(m => m.MapViewComponent),
        canActivate: [orgGuard],
      },
      {
        path: 'organizations',
        loadComponent: () =>
          import('./features/organizations/organization-list').then(m => m.OrganizationListComponent),
      },
      {
        path: 'organizations/:id',
        loadComponent: () =>
          import('./features/organizations/organization-detail').then(m => m.OrganizationDetailComponent),
      },
      {
        path: 'systems',
        loadComponent: () => import('./features/systems/system-list').then(m => m.SystemListComponent),
        canActivate: [orgGuard],
      },
      {
        path: 'systems/:id',
        loadComponent: () => import('./features/systems/system-detail').then(m => m.SystemDetailComponent),
        canActivate: [orgGuard],
      },
      {
        path: 'sampling',
        loadComponent: () => import('./features/sampling/sample-list').then(m => m.SampleListComponent),
        canActivate: [orgGuard],
      },
      {
        path: 'sampling/:id',
        loadComponent: () => import('./features/sampling/sample-detail').then(m => m.SampleDetailComponent),
        canActivate: [orgGuard],
      },
      {
        path: 'treatments',
        loadComponent: () => import('./features/treatments/treatment-list').then(m => m.TreatmentListComponent),
        canActivate: [orgGuard],
      },
      {
        path: 'treatments/:id',
        loadComponent: () => import('./features/treatments/treatment-detail').then(m => m.TreatmentDetailComponent),
        canActivate: [orgGuard],
      },
      {
        path: 'products',
        loadComponent: () => import('./features/products/product-list').then(m => m.ProductListComponent),
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./features/products/product-detail').then(m => m.ProductDetailComponent),
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reporting/reporting').then(m => m.ReportingComponent),
        canActivate: [orgGuard],
      },
      {
        path: 'site-visits',
        loadComponent: () => import('./features/site-visits/site-visit-list').then(m => m.SiteVisitListComponent),
        canActivate: [orgGuard],
      },
      {
        path: 'site-visits/:id',
        loadComponent: () => import('./features/site-visits/site-visit-detail').then(m => m.SiteVisitDetailComponent),
        canActivate: [orgGuard],
      },
      {
        path: 'account',
        loadComponent: () => import('./features/account/account').then(m => m.AccountComponent),
      },
      {
        path: 'people',
        loadComponent: () => import('./features/people/people').then(m => m.PeopleComponent),
        canActivate: [orgGuard],
      },
      {
        path: 'admin/system-admins',
        loadComponent: () => import('./features/admin/system-admins/system-admins').then(m => m.SystemAdminsComponent),
        canActivate: [roleGuard('admin')],
      },
      {
        path: 'admin/overview',
        loadComponent: () => import('./features/admin/overview/overview').then(m => m.AdminOverviewComponent),
        canActivate: [roleGuard('admin')],
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
