import { Injectable } from '@angular/core';
import { ChartData, ChartType, ChartOptions, ChartDataset, ChartTypeRegistry, DefaultDataPoint } from 'chart.js';
import { ChartColors } from './chart-colors';
import { ChartConfig } from './chart-config';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  generateChartData<T extends keyof ChartTypeRegistry>(config: ChartConfig<T>): { data: ChartData<T>, options: ChartOptions } {
    const { chartType, xData, yData, title, xAxisLabel, yAxisLabel, legend, options } = config;

    const backgroundColors: (string | CanvasGradient | CanvasPattern)[] = [
      ChartColors.PRIMARY, ChartColors.DARK_RED, ChartColors.SUCCESS, ChartColors.INFO,
      ChartColors.WARNING, ChartColors.DARK_RED,  ChartColors.DARK
    ];

    const borderColors: (string | CanvasGradient | CanvasPattern)[] = [
      ChartColors.PRIMARY, ChartColors.DANGER, ChartColors.SUCCESS, ChartColors.INFO,
      ChartColors.WARNING, ChartColors.DANGER,  ChartColors.DARK
    ];

    // Ensure yData is of the correct type expected by ChartDataset<T>
    const typedYData: DefaultDataPoint<T> = yData as DefaultDataPoint<T>;

    const dataset: ChartDataset<T> = {
      type: chartType,
      label: title || 'Dataset',
      data: typedYData,
      backgroundColor: backgroundColors,
      borderColor: borderColors,
      borderWidth: 1
    }as unknown as ChartDataset<T>;;

    const chartData: ChartData<T> = {
      labels: xData,
      datasets: [dataset]
    };

    // Create default options without scales for pie charts
    const defaultOptions: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: legend || false,
          position: 'top',
          labels: {
            boxWidth: 20,
            font: {
              size: 12,
            }
          }
        },
        title: {
          display: !!title,
          text: title || '',
          font: {
            size: 18,
          },
          padding: {
            top: 10,
            bottom: 20 // Add padding below the title
          }
        }
      }
    };

    // Add scales only if the chart type is not pie or doughnut
    if (chartType !== 'pie' && chartType !== 'doughnut') {
      defaultOptions.scales = {
        x: {
          title: {
            display: !!xAxisLabel,
            text: xAxisLabel || '',
            color: '#000' // Color for x-axis label
          },
          grid: {
            display: false // Remove vertical grids
          },
          ticks: {
            color: '#000' // Color for x-axis ticks
          }
        },
        y: {
          title: {
            display: !!yAxisLabel,
            text: yAxisLabel || '',
            color: '#000' // Color for y-axis label
          },
          grid: {
            display: false // Remove horizontal grids
          },
          ticks: {
            color: '#000', // Color for y-axis ticks
            font: {
              size: 14 // Font size for y-axis values
            }
          }
        }
      };
    }

    return { data: chartData, options: { ...defaultOptions, ...options } };
  }
}
