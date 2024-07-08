import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Chart, ChartData, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-hist-chart',
  standalone: true,
  templateUrl: './hist-chart.html',
})
export class HistChartComponent implements OnInit, AfterViewInit {
  @Input() chartData!: ChartData;
  @Input() xData: number[][] = [];
  @Input() yData: number[] = [];
  @Input() mean: number = 50;
  @Input() stdDev: number = 10;
  @Input() gradeBoundaries: { grade: string, min: number, max: number, cutoff: number }[] = [];

  private chart: any;

  constructor() {}

  ngOnInit() {
    console.log("INIT CHART DATA --> ", this.chartData);
    this.prepareChartData();
  }

  ngAfterViewInit() {
    this.createChart();
  }

  prepareChartData() {
    this.xData = this.gradeBoundaries.map(boundary => [boundary.min, boundary.max]);
  }

  createChart() {
    const ctx = document.getElementById('histogramFrequencyChart') as HTMLCanvasElement;

    // Prepare the histogram data as an array of objects with x and y properties
    const histogramData = this.xData.map((bin, index) => ({
      x: bin[0], // Start of the bin
      x2: bin[1], // End of the bin
      y: this.yData[index]
    }));

    // Calculate normal distribution points
    const normalDistributionData = this.calculateNormalDistribution(this.mean, this.stdDev);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        datasets: [
          {
            label: 'Histogram',
            data: histogramData,
            backgroundColor: 'rgba(63,81,181,0.6)',
            borderColor: 'rgba(63,81,181,1)',
            borderWidth: 1,
            barPercentage: 1.0,
            categoryPercentage: 1.0,
            parsing: false
          },
          {
            label: 'Normal Distribution',
            data: normalDistributionData,
            type: 'line',
            fill: false,
            borderColor: 'rgba(0,0,0,1)',
            backgroundColor: 'rgba(0,0,0,0.2)',
            tension: 0.1, // Smoothing of the line
            pointRadius: 0, // Remove points
            yAxisID: 'y'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'Marks Range'
            },
            ticks: {
              callback: (value) => {
                const numericValue = Number(value);
                const bin = histogramData.find(data => numericValue >= data.x && numericValue < data.x2);
                return bin ? `${bin.x}-${bin.x2}` : numericValue.toString();
              }
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Students'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        elements: {
          bar: {
            borderWidth: 1,
            borderSkipped: false,
          }
        },
        animation: {
          onComplete: () => {
            const chart = this.chart;
            const ctx = chart.ctx;
            ctx.save();
            chart.data.datasets[0].data.forEach((data: { x: any; x2: any; }, index: string | number) => {
              const meta = chart.getDatasetMeta(0);
              const bar = meta.data[index];
              const model = bar._model;

              // Custom draw for bars with varying widths
              const left = chart.scales.x.getPixelForValue(data.x);
              const right = chart.scales.x.getPixelForValue(data.x2);
              const top = model.y;
              const bottom = chart.scales.y.getPixelForValue(0);

              ctx.fillStyle = model.backgroundColor;
              ctx.fillRect(left, top, right - left, bottom - top);
              ctx.strokeStyle = model.borderColor;
              ctx.lineWidth = model.borderWidth;
              ctx.strokeRect(left, top, right - left, bottom - top);
            });
            ctx.restore();
          }
        }
      }
    });
  }

  calculateNormalDistribution(mean: number, stdDev: number) {
    const normalData = [];
    for (let i = 0; i <= 100; i++) {
      const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((i - mean) / stdDev, 2));
      normalData.push({ x: i, y: y * 1000 }); // Scale y for better visualization
    }
    return normalData;
  }
}
