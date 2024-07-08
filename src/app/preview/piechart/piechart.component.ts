import { Component, Input, SimpleChanges } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';


@Component({
  selector: 'app-piechart',
  standalone: true,
  imports: [NgChartsModule],
  templateUrl: './piechart.component.html',
  styleUrl: './piechart.component.css'
})
export class PiechartComponent {
  @Input() chartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [], hoverBackgroundColor: [] }]
  };
  @Input() chartOptions: ChartOptions = {
    responsive: true,
  };
  chartType: ChartType = 'pie';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData']) {
      this.updateChartData();
    }
  }

  updateChartData(): void {
    this.chartData.labels = this.chartData.labels || [];
    this.chartData.datasets[0].data = this.chartData.datasets[0].data || [];
    this.chartData.datasets[0].backgroundColor = this.chartData.datasets[0].backgroundColor || [];
    this.chartData.datasets[0].hoverBackgroundColor = this.chartData.datasets[0].hoverBackgroundColor || [];
 }
}