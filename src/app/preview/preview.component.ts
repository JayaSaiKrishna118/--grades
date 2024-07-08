import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, PipeTransform } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DecimalPipe, AsyncPipe } from '@angular/common';
import { NgbPaginationModule, NgbHighlight } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ValidationService, ValidationErrorInfo } from '../services/validation-service';
import {NgChartsModule} from 'ng2-charts';
import { HttpClient } from '@angular/common/http';
import { HistogramComponent } from "./histogram/histogram.component";
import { AttendanceData } from '../model/model';
import { DataService } from '../services/data-service';
import { ChartData, ChartOptions } from 'chart.js';
import { ChartColors } from './charts/base-chart/chart-colors';
import { GradeBoundary } from '../model/model';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';

// import { CurveComponent } from "./curve/curve.component"; 
// import { PiechartComponent } from './piechart/piechart.component';
// import { Chart, registerables } from 'chart.js';

// Chart.register(...registerables);
@Component({
    selector: 'app-preview',
    standalone: true,
    templateUrl: './preview.component.html',
    styleUrls: ['./preview.component.css'],
    providers: [DecimalPipe],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbPaginationModule, DecimalPipe, AsyncPipe, NgbHighlight, NgChartsModule, HistogramComponent, NgxSliderModule]
})
export class PreviewComponent implements OnInit {
  setChartType(type: 'bar'): void {
    this.chartType = type;
    this.updateChartData();
  }
  histogramChartData!: ChartData<'bar'>;
  histogramChartOptions: ChartOptions = { responsive: true, scales: { x: { title: { display: true, text: 'Marks Range' } }, y: { title: { display: true, text: 'Number of Students' }, beginAtZero: true } } };
  attendanceData:AttendanceData[] = [];
  csvHeaders: string[] = [];
  csvData: string[][] = [];
  parsedData: any[] = [];
  headers: string[] = [];
  currentPageData$: Observable<any[]> | undefined;
  pageSize: number = 5;
  page: number = 1;
  collectionSize: number = 0;
  selectedCourseCode: string | undefined;
  selectedCourseType: string | undefined;
  selectedTotalMarks: number | undefined;
  selectedTestType: string | undefined;
  fileContent: string = '';
  value: number = 10;
  sliderOptions: Options = {
    floor: 0,
    ceil: 100
  };
  gradeData: {[key:string]:number} ={};
  chartData: any = { labels: [], datasets: [{ data: [], label: 'Number of Students' }] };
  // chartOptions: any = {
  //   responsive: true,
  //   scales: {
  //     x: {
  //       title: {
  //         display: true,
  //         text: 'Marks Range'
  //       },
  //       ticks: {
  //         autoSkip: false
  //       }
  //     },
  //     y: {
  //       title: {
  //         display: true,
  //         text: 'Number of Students'
  //       },
  //       beginAtZero: true
  //     }
  //   }
  // };
  chartType: 'bar' = 'bar';
  // chartData: ChartData<'bar' | 'line' | 'pie'> = {
  //   labels: [],
  //   datasets: [{ data: [], label: 'Number of Students' }]
  // };
  // chartOptions: ChartOptions = {
  //   responsive: true,
  // };
  // chartType: 'bar' | 'line' | 'pie' = 'bar';
  // chartType: ChartType = 'bar';
  // chartData: ChartData<'bar' | 'line' | 'pie'> = {
  //   labels: [],
  //   datasets: [{ data: [], label: 'Number of Students' }]
  // };
  // chartOptions: ChartOptions = {
  //   responsive: true,
  // };
  // chartType: any;
  min_req_attendance: number = 75;
  filter = new FormControl('', { nonNullable: true });
  gradeBoundaries: GradeBoundary[] = [
    { grade: 'S', min: 80, max: 100, cutoff: 80 },
    { grade: 'A', min: 65, max: 79, cutoff: 65 },
    { grade: 'B', min: 55, max: 64, cutoff: 55 },
    { grade: 'C', min: 45, max: 54, cutoff: 45 },
    { grade: 'D', min: 35, max: 44, cutoff: 35 },
    { grade: 'E', min: 25, max: 34, cutoff: 25 },
    { grade: 'U', min: 0, max: 24, cutoff: 0 },
    { grade: 'W', min: 0, max: 0, cutoff: 0 }
  ];
  

  updateGradeBoundaries(): void {
    // Sort boundaries in decreasing order based on cutoff values
    this.gradeBoundaries.sort((a, b) => b.cutoff - a.cutoff);

    // Ensure cutoffs are within valid range and strictly decreasing
    for (let i = 0; i < this.gradeBoundaries.length - 1; i++) {
      // Ensure the cutoff does not go below 0
      if (this.gradeBoundaries[i].cutoff < 0) {
        this.gradeBoundaries[i].cutoff = 0;
      }

      // Adjust the cutoff to ensure it's strictly decreasing
      if (this.gradeBoundaries[i].cutoff <= this.gradeBoundaries[i + 1].cutoff) {
        this.gradeBoundaries[i + 1].cutoff = this.gradeBoundaries[i].cutoff - 1;

        // Ensure the next cutoff does not go below 0
        if (this.gradeBoundaries[i + 1].cutoff < 0) {
          this.gradeBoundaries[i + 1].cutoff = 0;
        }
      }
    }

    // Ensure the lowest grade boundary (W) has a cutoff of 0
    const wBoundary = this.gradeBoundaries.find(boundary => boundary.grade === 'W');
    if (wBoundary) {
      wBoundary.cutoff = 0;
    }

    // Recalculate grades and update chart data
    this.calculateGrades();
    this.updateChartData();
  }

  

  onCutoffChange(index: number): void {
    if (index < this.gradeBoundaries.length - 1 && this.gradeBoundaries[index].cutoff <= this.gradeBoundaries[index + 1].cutoff) {
      alert('Cutoff value must be greater than the next grade boundary.');
      return;
    }
    
    this.updateGradeBoundaries();
    this.updateChartData();
  }
  validationErrors: ValidationErrorInfo[] = [];
  // chartType: 'bar' | 'line' | 'pie' = 'bar';
  constructor(private route: ActivatedRoute, private pipe: DecimalPipe, private validationService: ValidationService, private http: HttpClient, private dataService: DataService) {}

  ngOnInit(): void {
    const state = window.history.state;
    this.fileContent = state.fileContent || '';
    this.selectedCourseCode = state.selectedCourseCode || '';
    this.selectedCourseType = state.selectedCourseType || '';
    this.selectedTotalMarks = state.selectedTotalMarks || 0;
    this.selectedTestType = state.selectedTestType || '';
    this.parseFileContent(this.fileContent);
    this.currentPageData$ = this.filter.valueChanges.pipe(
      startWith(''),
      map((text) => this.search(text))
    );

    this.currentPageData$.subscribe(data => {
      console.log('currentPageData$: ', data);
    });
    this.dataService.getJsonData().subscribe({
      next: (data: AttendanceData[]) => {
        this.attendanceData = data;
        this.mergeAttendanceWithCSV();
        this.calculateGrades();
        // this.updateChartData();
      }
    });
  }
  mergeAttendanceWithCSV(): void {
    // Ensure that parsedData contains the rollno and that attendanceData is loaded
    if (!this.parsedData.length || !this.attendanceData.length) {
      return;
    }
  
    // Create a map for quick lookups of attendance data by rollno
    const attendanceMap = new Map<number, number>();
    this.attendanceData.forEach(record => {
      attendanceMap.set(record.rollno, record.attendance);
    });
  
    // Merge attendance data into parsedData
    this.parsedData = this.parsedData.map(student => {
      const rollno = student['Student_Rollno']; // Assuming CSV has 'Student_Rollno' field
      const attendance = attendanceMap.get(rollno);
      
      if (attendance !== undefined) {
        student['Attendance'] = attendance;
      } else {
        student['Attendance'] = 'Not Available';
      }
  
      return student;
    });
  
    // Calculate grades based on attendance and update chart data
    this.calculateGrades();
  
    // Update the collection size and refresh the displayed page data
    this.collectionSize = this.parsedData.length;
    this.refreshPageData();
  }
  
  parseFileContent(fileContent: string): void {
    if (this.isCSV(fileContent)) {
      this.parseCSV(fileContent);
    } else {
      this.parseXLSX(fileContent);
    }
  }

  isCSV(content: string): boolean {
    return content.includes('\n');
  }

  parseCSV(fileContent: string): void {
    const rows = fileContent.split('\n').map((row) => row.split(','));
    
    this.headers = rows[0];
    console.log(this.headers)
    this.parsedData = rows.slice(1).map((row) => {
      const obj: any = {};
      this.headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      obj['Marks Percentage'] = this.calculateMarksPercentage(obj['Marks']);
      // obj['Marks Grade'] = this.calculateGrades(obj['Marks']);
      return obj;
    });
    this.collectionSize = this.parsedData.length;
    
    this.refreshPageData();
  }
  calculateMarksPercentage(marks: string): number {
    const marksObtained = parseFloat(marks);
    const totalMarks = 100; // Assuming total marks is 100, adjust if needed
    return (marksObtained / totalMarks) * 100;
  }
  parseXLSX(fileContent: string): void {
    const rows = JSON.parse(fileContent);
    this.headers = rows[0];
    this.parsedData = rows.slice(1).map((row: any[]) => {
      const obj: any = {};
      row.forEach((cell, index) => {
        obj[this.headers[index]] = cell;
      });
      return obj;
    });
    this.collectionSize = this.parsedData.length;
  }
  
  search(text: string): any[] {
    const term = text.toLowerCase();
    return this.parsedData.filter((student) => {
      return (
        student['Student Name']?.toLowerCase().includes(term) ||
        student['Student_Rollno']?.toString().includes(term) ||
        student['Marks']?.toString().includes(term) ||
        student['Attendance']?.toString().includes(term)
      );
    });
  }

  refreshPageData(): void {
    this.currentPageData$ = this.filter.valueChanges.pipe(
      startWith(this.filter.value),
      map((text) => this.search(text).slice((this.page - 1) * this.pageSize, this.page * this.pageSize))
    );
  }
  
  async validateAndDisplay(): Promise<void> {
    try {
      const validationErrors: ValidationErrorInfo[] = await this.validationService.validateData(this.parsedData);
      if (validationErrors.length === 0) {
        this.validationErrors;
      } else {
        console.error('Validation errors:', validationErrors);
      }
    } catch (error) {
      console.error('Validation error occurred:', error);
    }
  }

  calculateGrades(): void {
    this.gradeData = {}; // Reset grade data
    
    this.parsedData.forEach((student) => {
      const attendance = parseFloat(student['Attendance']);
      const marks = parseFloat(student['Marks']);
      const totalMarks = this.selectedTotalMarks ?? 0;
      
      if (isNaN(attendance) || attendance < this.min_req_attendance) {
        student['Marks Grade'] = 'W'; // Low attendance or attendance not provided
      } else if (isNaN(marks)) {
        student['Marks Grade'] = 'I'; // Missed exam or marks not provided
      } else {
        const grade = this.determineGrade(marks);
        student['Marks Grade'] = grade;
      }
      student['Marks Percentage'] = ((marks / totalMarks) * 100).toFixed(2);
      
      // Update grade distribution
      this.gradeData[student['Marks Grade']] = (this.gradeData[student['Marks Grade']] || 0) + 1;
    });
    
    // Update chart with new grade distribution data
    this.updateChartData();
  }
  
  determineGrade(marks: number): string {
    for (let i = 0; i < this.gradeBoundaries.length; i++) {
      const boundary = this.gradeBoundaries[i];
      if (marks >= boundary.cutoff) {
        return boundary.grade;
      }
    }
    return 'U'; // Default grade if no boundaries match
  }
  getMarksRange(marks: number): string {
    if (marks >= 90) return '90-100';
    if (marks >= 80) return '80-89';
    if (marks >= 70) return '70-79';
    if (marks >= 60) return '60-69';
    if (marks >= 50) return '50-59';
    if (marks >= 40) return '40-49';
    if (marks >= 30) return '30-39';
    return '0-29';
  }
  
  // updateChartData(): void {
  //   this.chartData.labels = Object.keys(this.gradeData);
  //   this.chartData.datasets[0].data = Object.values(this.gradeData);
  // }
  updateChartData(): void {
    // Generate the labels and data for the chart
    const labels = ['W', 'U', 'E', 'D', 'C', 'B', 'A', 'S']; // Grade ranges in desired order
    const data = labels.map(grade => this.gradeData[grade] || 0);
  
    this.histogramChartData = {
      labels,
      datasets: [{ data, label: 'Number of Students', backgroundColor: this.getBackgroundColors() }]
    };
  }
  

  getBackgroundColors(): string[] {
    return [
      ChartColors.PRIMARY,
      ChartColors.SECONDARY,
      ChartColors.SUCCESS,
      ChartColors.INFO,
      ChartColors.WARNING,
      ChartColors.DANGER,
      ChartColors.DARK_CYAN,
      ChartColors.DARK_MAGENTA

    ];
  }
  
  // submitGrades(): void {
  //   const gradeSubmission = {
  //     courseCode: this.selectedCourseCode,
  //     courseType: this.selectedCourseType,
  //     totalMarks: this.selectedTotalMarks,
  //     testType: this.selectedTestType,
  //     grades: this.parsedData.map(student => ({
  //       studentName: student['Student Name'],
  //       marks: student['Marks'],
  //       attendance: student['Attendance'],
  //       grade: student['Marks Grade']
  //     }))
  //   };

  //   // Replace with your actual endpoint
  //   const endpoint = '';

  //   this.http.post<any>(endpoint, gradeSubmission).subscribe({
  //     next: (response) => {
  //       console.log('Grades submitted successfully:', response);
  //       alert('Grades submitted successfully!');
  //     },
  //     error: (error) => {
  //       console.error('Error submitting grades:', error);
  //       alert('Failed to submit grades. Please try again.');
  //     }
  //   });
  // }
  // // gaussian(x: number, mean: number, stdDev: number): number {
  //   return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
  // }

  // calculateGradesWithGaussian(): void {
  //   const marksArray = this.parsedData.map(student => parseFloat(student['Marks']));
  //   const mean = marksArray.reduce((acc, curr) => acc + curr, 0) / marksArray.length;
  //   const stdDev = Math.sqrt(marksArray.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / marksArray.length);

  //   this.gradeData = {}; // Reset gradeData

  //   this.parsedData.forEach((student) => {
  //     const attendance = parseFloat(student['Attendance']);
  //     let marks = parseFloat(student['Marks']);
  //     const totalMarks = this.selectedTotalMarks ?? 0;

  //     if (isNaN(attendance) || attendance < this.min_req_attendance) {
  //       student['Marks Grade'] = 'W'; // Low attendance or attendance not provided
  //     } else if (isNaN(marks)) {
  //       student['Marks Grade'] = 'I'; // Missed exam or marks not provided
  //     } else {
  //       // Apply Gaussian normalization
  //       marks = this.gaussian(marks, mean, stdDev);
  //       const grade = this.determineGrade(marks * totalMarks); // Scale back to total marks
  //       student['Marks Grade'] = grade;
  //     }

  //     student['Marks Percentage'] = ((marks / totalMarks) * 100).toFixed(2);
  //     // Update grade distribution for chart
  //     this.gradeData[student['Marks Grade']] = (this.gradeData[student['Marks Grade']] || 0) + 1;
  //   });

  //   // Update chart with new grade distribution data
  //   this.updateChartData();
  // }
}