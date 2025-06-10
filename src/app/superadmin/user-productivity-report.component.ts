import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { UserProductivity } from '../models/user-productivity.model';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-user-productivity-report',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './user-productivity-report.component.html'
})
export class UserProductivityReportComponent implements OnInit {
  /** Raw list from the API */
  data: UserProductivity[] = [];

  /** NxCharts-friendly series  */
  chartData: { name: string; value: number }[] = [];

  loading = true;
  /** [width, height] */
  view: [number, number] = [700, 400];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    /* ✔  call the correct method name and add types */
    this.taskService.getUserProductivityStats().subscribe({
      next: (result: UserProductivity[]) => {
        this.data = result;

        /* make bar-chart series */
        this.chartData = result.map(u => ({
          name: u.username,        // label
          value: u.completedTasks  // bar height
        }));

        this.loading = false;
      },
      error: () => {
        alert('Failed to load productivity data');
        this.loading = false;
      }
    });
  }
}
