import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { AuthService } from '../services/auth.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxChartsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  totalUsers = 0;
  totalTasks = 0;
  totalCategories = 0;

  statusChartData: any[] = [];
  userTaskChartData: any[] = [];
  userProductivityData: any[] = [];

  chartView: [number, number] = [500, 300];
  chartLoading = false;

  userProfile: { username?: string; email?: string; role?: string } = {};

  constructor(
    private adminService: AdminService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadUserInfo();
  }

  private loadDashboardData(): void {
    this.chartLoading = true;

    this.adminService.getUsers().subscribe(users => {
      this.totalUsers = users.length;

      this.adminService.getDepartmentTasks().subscribe(tasks => {
        this.totalTasks = tasks.length;

        const taskCounts: Record<string, number> = {};
        tasks.forEach(task => {
          const username = task.user?.username || 'Unassigned';
          taskCounts[username] = (taskCounts[username] || 0) + 1;
        });

        this.userTaskChartData = Object.entries(taskCounts).map(([name, value]) => ({ name, value }));

        const statusCounts: Record<'To Do' | 'In Progress' | 'Completed', number> = {
          'To Do': 0,
          'In Progress': 0,
          'Completed': 0
        };

        tasks.forEach(task => {
          if (statusCounts[task.status] !== undefined) {
            statusCounts[task.status]++;
          }
        });

        this.statusChartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

        this.adminService.getUserProductivityStats().subscribe(productivity => {
          this.userProductivityData = productivity.map(u => ({
            name: u.username,
            value: u.completedTasks // you could change to totalTasks if needed
          }));

          Swal.fire('✅ Success', 'Dashboard data loaded successfully', 'success');
          this.chartLoading = false;
        }, () => {
          Swal.fire('❌ Error', 'Failed to load productivity stats', 'error');
          this.chartLoading = false;
        });

      }, () => {
        Swal.fire('❌ Error', 'Failed to load department tasks', 'error');
        this.chartLoading = false;
      });
    }, () => {
      Swal.fire('❌ Error', 'Failed to load users', 'error');
      this.chartLoading = false;
    });

    this.adminService.getCategories().subscribe(categories => {
      this.totalCategories = categories.length;
    }, () => {
      Swal.fire('❌ Error', 'Failed to load categories', 'error');
    });
  }

  private loadUserInfo(): void {
this.userProfile.username = this.auth.getUsername() ?? 'Unknown';
    this.userProfile.email = this.auth.getUserEmail() ?? undefined;
    this.userProfile.role = this.auth.getUserRole() ?? undefined;
  }
}
