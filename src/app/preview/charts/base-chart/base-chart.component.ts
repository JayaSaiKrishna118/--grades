import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-base-chart',
  standalone: true,
  imports:[NgbModule],
  templateUrl: './base-chart.component.html'
})
export class BaseChartComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas', { static: true }) private chartCanvas!: ElementRef<HTMLCanvasElement>;

  @Input() chartType!: ChartConfiguration['type'];
  @Input() chartData!: ChartConfiguration['data'];
  @Input() chartOptions?: ChartConfiguration['options'];
  @Input() height: string = '500px';
  @Input() width: string = '100%';
  @Input() xAxisLabel?: string;
  @Input() yAxisLabel?: string;
  @Input() title?: string;
  @Input() subtitle?: string;

  private chart!: Chart;

  constructor() {}

  ngOnInit(): void {
    if (!this.chartType || !this.chartData) {
      throw new Error('chartType and chartData are required inputs.');
    }
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  createChart(): void {
    const defaultOptions: ChartConfiguration['options'] = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            boxWidth: 20,
            font: {
              size: 12,
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              if (this.chartType === 'pie' || this.chartType === 'doughnut') {
                const label = context.label || '';
                const value = context.raw || '';
                return `${label}: ${value}`;
              }
              return `${context.dataset.label}: ${context.raw}`;
            }
          }
        },
        title: {
          display: !!this.title,
          text: this.title || '',
          font: {
            size: 18,
          },
          padding: {
            top: 10,
            bottom: 20
          }
        },
        subtitle: {
          display: !!this.subtitle,
          text: this.subtitle || '',
          font: {
            size: 14,
          },
          padding: {
            top: 0,
            bottom: 20
          }
        }
      },
      layout: {
        padding: {
          left: 20,
          right: 20,
          top: 20,
          bottom: 20
        }
      }
    };

    if (this.chartType !== 'pie' && this.chartType !== 'doughnut') {
      defaultOptions.scales = {
        x: {
          display: true,
          title: {
            display: !!this.xAxisLabel,
            text: this.xAxisLabel || '',
            color: '#000'
          },
          grid: {
            display: false
          },
          ticks: {
            color: '#000'
          }
        },
        y: {
          display: true,
          beginAtZero: true,
          title: {
            display: !!this.yAxisLabel,
            text: this.yAxisLabel || '',
            color: '#000'
          },
          grid: {
            display: false
          },
          ticks: {
            color: '#000',
            font: {
              size: 14
            }
          }
        }
      };
    }

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: this.chartType,
      data: this.chartData,
      options: { ...defaultOptions, ...this.chartOptions }
    });
  }

  // downloadChartImage(): void {
  //   const link = document.createElement('a');
  //   link.href = this.chart.toBase64Image();
  //   link.download = `${this.chartType}-chart.png`;
  //   link.click();
  // }
}
