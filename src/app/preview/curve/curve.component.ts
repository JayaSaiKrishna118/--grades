import { Component, Input, SimpleChanges } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-curve',
  standalone: true,
  imports: [NgChartsModule],
  templateUrl: './curve.component.html',
  styleUrl: './curve.component.css'
})
export class CurveComponent {
  @Input() chartData: ChartData<'line'> = {
    labels: [],
    datasets: [{ data: [], label: 'Number of Students' }]
  };
  @Input() chartOptions: ChartOptions = {
    responsive: true,
  };
  chartType: ChartType = 'line';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData']) {
      this.updateChartData();
    }
  }

  updateChartData(): void {
    this.chartData.labels = this.chartData.labels || [];
    this.chartData.datasets[0].data = this.chartData.datasets[0].data || [];;
  }
}
