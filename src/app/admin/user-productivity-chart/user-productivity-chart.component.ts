import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { AdminService } from '../../services/admin.service';
import { UserProductivity } from '../../models/user-productivity.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-productivity-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './user-productivity-chart.component.html',
  styleUrls: ['./user-productivity-chart.component.css'],
})
export class UserProductivityChartComponent implements OnInit {
  userData: UserProductivity[] = [];
  isLoading = true;

  barChartType: 'bar' = 'bar';

  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'User Task Productivity by Status' }
    }
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.fetchUserProductivityStats();
  }

  fetchUserProductivityStats(): void {
    this.adminService.getUserProductivityStats().subscribe({
      next: (data) => {
        this.userData = data;
        this.populateChart(data);
        this.isLoading = false;
      },
      error: () => {
        Swal.fire('❌ Failed to load productivity stats', 'Please try again.', 'error');
        this.isLoading = false;
      }
    });
  }

  populateChart(data: UserProductivity[]): void {
    const labels = data.map(u => u.username);
    this.barChartData.labels = labels;

    this.barChartData.datasets = [
      {
        label: 'Completed',
        data: data.map(u => u.completedTasks),
        backgroundColor: 'rgba(40, 167, 69, 0.8)'
      },
      {
        label: 'In Progress',
        data: data.map(u => u.inProgressTasks),
        backgroundColor: 'rgba(255, 193, 7, 0.8)'
      },
      {
        label: 'To Do',
        data: data.map(u => u.toDoTasks),
        backgroundColor: 'rgba(220, 53, 69, 0.8)'
      }
    ];
  }
}
