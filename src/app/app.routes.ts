import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent),
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
      },
      {
        path: 'map',
        loadComponent: () => import('./features/map/map-view').then(m => m.MapViewComponent),
        canActivate: [roleGuard('admin')],
      },
      {
        path: 'clients',
        loadComponent: () => import('./features/clients/client-list').then(m => m.ClientListComponent),
        canActivate: [roleGuard('admin')],
      },
      {
        path: 'clients/:id',
        loadComponent: () => import('./features/clients/client-detail').then(m => m.ClientDetailComponent),
        canActivate: [roleGuard('admin')],
      },
      {
        path: 'systems',
        loadComponent: () => import('./features/systems/system-list').then(m => m.SystemListComponent),
      },
      {
        path: 'systems/:id',
        loadComponent: () => import('./features/systems/system-detail').then(m => m.SystemDetailComponent),
      },
      {
        path: 'sampling',
        loadComponent: () => import('./features/sampling/sample-list').then(m => m.SampleListComponent),
      },
      {
        path: 'sampling/:id',
        loadComponent: () => import('./features/sampling/sample-detail').then(m => m.SampleDetailComponent),
      },
      {
        path: 'treatments',
        loadComponent: () => import('./features/treatments/treatment-list').then(m => m.TreatmentListComponent),
      },
      {
        path: 'treatments/:id',
        loadComponent: () => import('./features/treatments/treatment-detail').then(m => m.TreatmentDetailComponent),
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
        path: 'proposals',
        loadComponent: () => import('./features/proposals/proposal-list').then(m => m.ProposalListComponent),
        canActivate: [roleGuard('admin')],
      },
      {
        path: 'proposals/:id',
        loadComponent: () => import('./features/proposals/proposal-detail').then(m => m.ProposalDetailComponent),
        canActivate: [roleGuard('admin')],
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reporting/reporting').then(m => m.ReportingComponent),
      },
      {
        path: 'case-studies',
        loadComponent: () => import('./features/case-studies/case-study-list').then(m => m.CaseStudyListComponent),
      },
      {
        path: 'case-studies/:id',
        loadComponent: () => import('./features/case-studies/case-study-detail').then(m => m.CaseStudyDetailComponent),
      },
      {
        path: 'account',
        loadComponent: () => import('./features/account/account').then(m => m.AccountComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
