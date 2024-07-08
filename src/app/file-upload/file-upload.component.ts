import { Component, HostListener } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UploadService } from '../services/services.component';
import { ValidationService, ValidationErrorInfo } from '../services/validation-service'; // Ensure to import ValidationErrorInfo
import { Course1 } from '../model/model';


@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
})


export class UploadComponent {
  fileContent: string = '';
  errorMessage: string = '';
  isUploaded: boolean = false;
  isDownload: boolean = true;
  courses: Course1[] = [
    { code: 'CS101', name: 'Data structure and algorithms' },
    { code: 'CS102', name: 'Data science' },
    { code: 'CS103', name: 'Automation Engineering' },
    // Add more courses as needed
  ];
  // courseCode: string[] = ['cs101','cs102','cs103'];
  // courseTypes: string[] = ['Data Structures and Algorithms', ' Data Science', 'Automation Engineering'];
  totalMarks: number[] = [25, 50, 100];
  testTypes: string[] = ['Sem-1', 'Sem-2', 'Mid-Sem', 'Final-Sem'];
  headers: string[] | undefined;
  selectedCourseCode: string | undefined;
  selectedCourseType: string | undefined;
  selectedTotalMarks: number | undefined;
  selectedTestType: string | undefined;
  selectedCourse: string | undefined;

  
  constructor(private uploadService: UploadService,private router: Router, private validationService: ValidationService) { }

  onFileChange(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.readFile(file);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.readFile(file);
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  readFile(file: File): void {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      this.fileContent = reader.result as string;
      this.uploadAndPreview();
    };
    reader.onerror = () => {
      this.errorMessage = 'Failed to read file!';
    };
  }
  
  parseCSV(content: string): any[] {
    const rows = content.split('\n').map(row => row.split(','));
    const headers = rows.shift();

    if (!headers) {
      throw new Error('CSV has no headers');
    }

    return rows.map(row => {
      const data: any = {};
      row.forEach((value, index) => {
        data[headers[index]] = value.trim();
      });
      return data;
    });
  }
  uploadToLocalStorage(): void {
    try {
      this.uploadService.saveToLocalStorage(this.fileContent);
      this.errorMessage = '';
      this.isUploaded = true;
      console.log('Previewing CSV content:', this.fileContent);
    } catch (error) {
      this.errorMessage = 'Failed to save to local storage!';
      console.error(error);
    }
  }
  uploadAndPreview(): void {
    if (this.fileContent) {
      try {
        const parsedData = this.parseCSV(this.fileContent);
        this.isUploaded = true;
        this.navigateToPreview(parsedData);
      } catch (error) {
        this.errorMessage = "Failed to preview";
      }
    }
  }

  navigateToPreview(parsedData: any[]): void {
    this.router.navigate(['/preview'], {
      state: {
        fileContent: this.fileContent,
        selectedCourseCode: this.selectedCourseCode,
        selectedCourseType: this.selectedCourseType,
        selectedTotalMarks: this.selectedTotalMarks,
        selectedTestType: this.selectedTestType
      }
    });
  }
  downloadCSV(): void {
    // Define the CSV headers
    const headers = [
        "Student_Roll_no",
        "Student_Name",
        "Marks",
    ];

    // Join the headers with commas to create the CSV content
    const csvContent = headers.join(',') + '\n';

    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv' });

    // Create a URL for the Blob
    const url = window.URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course_template.csv';
    a.click();

    // Revoke the URL to free up memory
    window.URL.revokeObjectURL(url);
}
displayCourse(course: Course1): void {
  this.selectedCourseCode = course.code;
  this.selectedCourseType = course.name;
  
}
validateTotalMarks(): void {
  if (this.selectedTotalMarks !== undefined && (this.selectedTotalMarks < 0 || this.selectedTotalMarks > 100)) {
    this.errorMessage = 'Total marks must be between 0 and 100';
  } else {
    this.errorMessage = '';
  }
}
}
