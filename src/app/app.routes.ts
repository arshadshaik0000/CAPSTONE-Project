
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LandingPageComponent } from './shared/landing-page/landing-page.component';
import { AdminLoginComponent } from './auth/admin-login/admin-login.component';
import { UserLoginComponent } from './auth/user-login/user-login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard.component';
import { UserDashboardComponent } from './user/user-dashboard.component';
import { SuperAdminDashboardComponent } from './superadmin/superadmin-dashboard.component';
import { UserProductivityChartComponent } from './admin/user-productivity-chart/user-productivity-chart.component';
import { RoleRedirectComponent } from './shared/role-redirect.component';

export const routes: Routes = [
  /* ──────────────── 🔓 PUBLIC ──────────────── */
  { path: '', component: LandingPageComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'user-login', component: UserLoginComponent },
  { path: 'login', component: UserLoginComponent }, // MS redirect fix

  /* ──────────────── ✅ DASHBOARD REDIRECT ──────────────── */
  {
    path: 'dashboard',
    component: RoleRedirectComponent 
  },

  /* ──────────────── 👤 USER ──────────────── */
  {
    path: 'user-dashboard',
    component: UserDashboardComponent,
    canActivate: [authGuard],
    data: { role: 'User' }
  },
  {
    path: 'user/tasks',
    loadComponent: () =>
      import('./user/task-list/task-list.component').then(m => m.TaskListComponent),
    canActivate: [authGuard],
    data: { role: 'User' }
  },

  /* ──────────────── 🛠️ ADMIN ──────────────── */
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [authGuard],
    data: { role: 'Admin' }
  },
  {
    path: 'admin/users',
    loadComponent: () =>
      import('./admin/user-management/user-list.component').then(m => m.UserListComponent),
    canActivate: [authGuard],
    data: { role: 'Admin' }
  },
  {
    path: 'admin/categories',
    loadComponent: () =>
      import('./admin/category-management/category-management.component').then(m => m.CategoryManagementComponent),
    canActivate: [authGuard],
    data: { role: 'Admin' }
  },
  {
    path: 'admin/add-category',
    loadComponent: () =>
      import('./admin/category-management/category-form.component').then(m => m.CategoryFormComponent),
    canActivate: [authGuard],
    data: { role: 'Admin' }
  },
  {
    path: 'admin/tasks',
    loadComponent: () =>
      import('./admin/task-management/task-management.component').then(m => m.TaskManagementComponent),
    canActivate: [authGuard],
    data: { role: 'Admin' }
  },
  {
    path: 'admin/users-management',
    loadComponent: () =>
      import('./admin/user-management/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [authGuard],
    data: { role: 'Admin' }
  },

  /* ──────────────── 🧑‍💼 SUPER ADMIN ──────────────── */
  {
    path: 'superadmin-dashboard',
    component: SuperAdminDashboardComponent,
    canActivate: [authGuard],
    data: { role: 'SuperAdmin' }
  },
  {
    path: 'superadmin/departments',
    loadComponent: () =>
      import('./superadmin/department-management/department-management.component').then(m => m.DepartmentManagementComponent),
    canActivate: [authGuard],
    data: { role: 'SuperAdmin' }
  },
  {
    path: 'superadmin/admins',
    loadComponent: () =>
      import('./superadmin/admin-management/admin-management.component').then(m => m.AdminManagementComponent),
    canActivate: [authGuard],
    data: { role: 'SuperAdmin' }
  },
  {
    path: 'superadmin/reports/productivity',
    loadComponent: () =>
      import('./superadmin/user-productivity-report.component').then(m => m.UserProductivityReportComponent),
    canActivate: [authGuard],
    data: { role: 'SuperAdmin' }
  },
  {
    path: 'superadmin/tasks',
    loadComponent: () =>
      import('./superadmin/task-approval/task-approval.component').then(m => m.TaskApprovalComponent),
    canActivate: [authGuard],
    data: { role: 'SuperAdmin' }
  },

  /* ──────────────── 📊 SHARED REPORTS ──────────────── */
  {
    path: 'reports/user-productivity',
    loadComponent: () =>
      import('./admin/user-productivity-chart/user-productivity-chart.component').then(m => m.UserProductivityChartComponent),
    canActivate: [authGuard],
    data: { role: 'Admin' }
  },
  {
    path: 'user-productivity-chart',
    component: UserProductivityChartComponent
  },

  /* ──────────────── 🚫 ERROR HANDLING ──────────────── */
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./shared/forbidden.component').then(m => m.ForbiddenComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./shared/not-found.component').then(m => m.NotFoundComponent)
  }
];
