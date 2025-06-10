import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SuperAdminService, Department, AppUser, DepartmentStatsDto } from '../services/super-admin.service';
import { AuthService } from '../services/auth.service';
import { TaskStatusChartComponent } from '../shared/task-status-chart/task-status-chart.component';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  templateUrl: './superadmin-dashboard.component.html',
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    TaskStatusChartComponent,
    NgxChartsModule
  ]
})
export class SuperAdminDashboardComponent implements OnInit {
  isLoading = true;

  totalDepartments = 0;
  totalAdmins = 0;
  totalUsers = 0;

  tasks: any[] = [];
  departments: Department[] = [];
  departmentStats: DepartmentStatsDto[] = [];

  multiSeriesChartData: any[] = [];
  globalStatusChartData: any[] = [];
  chartView: [number, number] = [700, 400];

  colorScheme: string = 'vivid'; // or use another valid scheme: 'cool', 'fire', 'natural', etc.


  constructor(
    private superAdminService: SuperAdminService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: '🔒 You are not authenticated',
        text: 'Redirecting to login...',
        timer: 2000,
        showConfirmButton: false
      });
      window.location.href = '/';
      return;
    }

    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    this.superAdminService.getDepartments().subscribe({
      next: (depts) => {
        this.departments = depts;
        this.totalDepartments = depts.length;
      },
      error: () => {
        Swal.fire({ icon: 'error', title: '❌ Failed to fetch departments' });
      }
    });

    this.superAdminService.getAdmins().subscribe({
      next: (admins) => {
        this.totalAdmins = admins.length;
      },
      error: () => {
        Swal.fire({ icon: 'error', title: '❌ Failed to fetch admins' });
      }
    });

    this.superAdminService.getAllUsers().subscribe({
      next: (users: AppUser[]) => {
        this.totalUsers = users.length;
      },
      error: () => {
        Swal.fire({ icon: 'error', title: '❌ Failed to fetch users' });
      }
    });

    this.superAdminService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
      },
      error: () => {
        Swal.fire({ icon: 'error', title: '❌ Failed to fetch tasks' });
      }
    });

    this.superAdminService.getDepartmentStats().subscribe({
      next: (stats: DepartmentStatsDto[]) => {
        this.departmentStats = stats;

        const totalCompleted = stats.reduce((sum, d) => sum + d.completedCount, 0);
        const totalInProgress = stats.reduce((sum, d) => sum + d.inProgressCount, 0);
        const totalToDo = stats.reduce((sum, d) => sum + d.toDoCount, 0);

        this.multiSeriesChartData = stats.map((d) => ({
          name: d.name,
          series: [
            { name: 'Completed', value: d.completedCount },
            { name: 'In Progress', value: d.inProgressCount },
            { name: 'To Do', value: d.toDoCount }
          ]
        }));

        this.globalStatusChartData = [
          { name: 'Completed', value: totalCompleted },
          { name: 'In Progress', value: totalInProgress },
          { name: 'To Do', value: totalToDo }
        ];

        this.tasks = [
          ...Array(totalCompleted).fill({ status: 'Completed' }),
          ...Array(totalInProgress).fill({ status: 'In Progress' }),
          ...Array(totalToDo).fill({ status: 'To Do' })
        ];

        Swal.fire({
          icon: 'success',
          title: '📊 Department stats loaded!',
          showConfirmButton: false,
          timer: 1500
        });

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Department stats error', err);
        Swal.fire({
          icon: 'error',
          title: '❌ Failed to load department stats'
        });
        this.isLoading = false;
      }
    });
  }
}
