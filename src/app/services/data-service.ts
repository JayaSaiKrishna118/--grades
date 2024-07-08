import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AttendanceData } from '../model/model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private jsonUrl = 'assets/attendance_data.json'; // Path to your JSON file

  constructor(private http: HttpClient) {}

  getJsonData(): Observable<AttendanceData[]> {
    return this.http.get<{ Attendance: AttendanceData[] }>(this.jsonUrl).pipe(
      map(response => response.Attendance)
    );
  }
}
