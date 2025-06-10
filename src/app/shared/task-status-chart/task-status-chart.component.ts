import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-task-status-chart',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <div class="mt-4">
      <h5 class="text-center mb-3">{{ chartTitle }}</h5>

      <!-- Pie Chart -->
      <ngx-charts-pie-chart
        *ngIf="showPieChart"
        [results]="chartData"
        [legend]="true"
        [labels]="true"
        [doughnut]="false"
        [view]="[500,300]"
        [scheme]="pieColorScheme">
      </ngx-charts-pie-chart>

      <!-- Grouped Vertical Bar Chart -->
      <ngx-charts-bar-vertical-2d
        *ngIf="showBarChart"
        [results]="statusData"
        [legend]="true"
        [xAxis]="true"
        [yAxis]="true"
        [roundEdges]="true"
        [barPadding]="5"
        [groupPadding]="10"
        [animations]="true"
        [showDataLabel]="true"
        [view]="[700,400]"
        [scheme]="barColorScheme">
      </ngx-charts-bar-vertical-2d>
    </div>
  `
})
export class TaskStatusChartComponent implements OnChanges {
  @Input() chartTitle = 'Task Status Chart';
  @Input() tasks: { status: string }[] = [];
  @Input() statusData: any[] = [];

  chartData: { name: string; value: number }[] = [];

pieColorScheme: any = {
  name: 'customPieScheme',
  selectable: true,
  group: 'Ordinal',
  domain: ['#28a745', '#ffc107', '#17a2b8']
};

barColorScheme: any = {
  name: 'customBarScheme',
  selectable: true,
  group: 'Ordinal',
  domain: ['#28a745', '#ffc107', '#17a2b8']
};


  get showPieChart(): boolean {
    return this.tasks && this.tasks.length > 0;
  }

  get showBarChart(): boolean {
    return this.statusData && this.statusData.length > 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.showPieChart) {
      const grouped = this.tasks.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      this.chartData = Object.entries(grouped).map(([status, count]) => ({
        name: status,
        value: count
      }));
    }
  }
}
