import { SortColumn, SortDirection } from "../sortable-col";

// Represents a course with its details
export interface Course {
  course_code: string;
  course_name: string;
  exam_type: string;
  total_marks: number;
}

// Represents a simplified course model
export interface Course1 {
  code: string;
  name: string;
}

// Represents the result of a search operation
export interface SearchResult {
  parsedData: StudentInfo[]; // Changed to StudentInfo for type safety
  total: number;
}

// Represents the state of the pagination and sorting
export interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}
export interface AttendanceData {
  marks: number;
  rollno: number;
  attendance: number; // Adjust the type if you have a specific format for attendance
}
// Represents a student’s information
export interface StudentInfo {
  roll_no: number;             // Student roll number
  name: string;                // Student name
  marks: number;               // Marks obtained
  attendance: number;          // Attendance percentage
  marks_percentage: string;    // Percentage of marks
  marks_grade: string;         // Grade based on marks
  attendance_grade: string;   // Grade based on attendance
}

// Represents a range with min and max values
export interface Range {
  min: number;
  max: number;
}
export interface GradeBoundary {
  grade: string;
  min: number;
  max: number;
  cutoff: number;
   // You can keep this for display purposes if needed
}


// Represents grade boundaries for different grades
export interface GradeBoundaryRange {
  S: Range;
  A: Range;
  B: Range;
  C: Range;
  D: Range;
  E: Range;
  U: Range;
  I: Range;
  W: Range;
}
export class DistributionModel {
  mean: number;
  stdDev: number;
  
  constructor(mean: number, stdDev: number) {
    this.mean = mean;
    this.stdDev = stdDev;
  }
}
// Class for representing grades along with course information
export class Grade {
  course_code: string;
  course_name: string;
  total_marks: number;
  marks_grade: string;
  attendance_grade: string;
  marks: number;               // Marks obtained


  constructor(course: Course, studentInfo: StudentInfo) {
    this.course_code = course.course_code;
    this.course_name = course.course_name;
    this.total_marks = course.total_marks;
    this.marks_grade = studentInfo.marks_grade;
    this.attendance_grade = studentInfo.attendance_grade;
    this.marks= studentInfo.marks;
  }
  
}
