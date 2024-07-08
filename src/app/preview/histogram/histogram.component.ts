// import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
// import { ChartData, ChartOptions, ChartType } from 'chart.js';
// import { NgChartsModule } from 'ng2-charts';
// import { ChartColors } from '../charts/base-chart/chart-colors';

// @Component({
//   selector: 'app-histogram',
//   standalone: true,
//   imports: [NgChartsModule],
//   templateUrl: './histogram.component.html',
//   styleUrls: ['./histogram.component.css'],
// })
// export class HistogramComponent implements OnChanges {
//   @Input() chartData: ChartData<'bar'> = {
//     labels: [],
//     datasets: [{ data: [], label: 'Number of Students', backgroundColor: ChartColors.PRIMARY }]
//   };
//   @Input() chartOptions: ChartOptions = {
//     responsive: true,
//     scales: {
//       x: {
//         title: { display: true, text: 'Marks Range' },
//       },
//       y: {
//         title: { display: true, text: 'Number of Students' },
//         beginAtZero: true,
//       }
//     }
//   };
//   chartType: ChartType = 'bar';
//   gradeBoundaries: any;

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['chartData']) {
//       this.updateChartData();
//       if (this.chartData && this.chartData.datasets) {
//         this.chartData.datasets.forEach((dataset: any) => {
//           dataset.barPercentage = 1.0;
//           dataset.categoryPercentage = 1.0;
//         });
//       }
//     }
//   }

//   updateChartData(): void {
//     if (!this.chartData) {
//       this.chartData = {
//         labels: this.getLabels(),
//         datasets: [{
//           data: [],
//           label: 'Number of Students',
//           backgroundColor: this.getBackgroundColors()
//         }]
//       };
//     } else {
//       if (!this.chartData.labels) {
//         this.chartData.labels = this.getLabels();
//       } else {
//         this.chartData.labels = this.getLabels();
//       }

//       if (!this.chartData.datasets || this.chartData.datasets.length === 0) {
//         this.chartData.datasets = [{
//           data: [],
//           label: 'Number of Students',
//           backgroundColor: this.getBackgroundColors()
//         }];
//       } else {
//         this.chartData.datasets[0].backgroundColor = this.getBackgroundColors();
//       }

//       if (!this.chartData.datasets[0].data) {
//         this.chartData.datasets[0].data = [];
//       }
//     }
//   }

//   getLabels(): string[] {
//     return this.gradeBoundaries.map((boundary: { grade: any; min: any; max: any; }) => `${boundary.grade} (${boundary.min}-${boundary.max})`);
//   }
  
//   getBackgroundColors(): string[] {
//     return [
//       ChartColors.PRIMARY,
//       ChartColors.SECONDARY,
//       ChartColors.SUCCESS,
//       ChartColors.INFO,
//       ChartColors.WARNING,
//       ChartColors.DANGER,
//       ChartColors.DARK_CYAN,
//       ChartColors.DARK_MAGENTA
//     ];
//   }
  
// }


import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartData, ChartOptions, ChartType} from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-histogram',
  standalone: true,
  imports: [NgChartsModule],
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.css'],
})
export class HistogramComponent implements OnChanges {
  @Input() chartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Number of Students' }]
  };
  @Input() chartOptions: ChartOptions = {
    responsive: true,
  };
  chartType: ChartType = 'bar';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData']) {
      this.updateChartData();
      this.chartData.datasets.forEach((dataset: any) => {
        dataset.barPercentage = 1.0;
        dataset.categoryPercentage = 1.0;
      });
    }
  }

  updateChartData(): void {
    this.chartData.labels = this.chartData.labels || [];
    this.chartData.datasets[0].data = this.chartData.datasets[0].data || [];
  }
}
