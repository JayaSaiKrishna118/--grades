import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor() { }

  saveToLocalStorage(data: string): void {
    try {
      localStorage.setItem('uploadedCsv', data);
    } catch (error) {
      throw new Error('Failed to save to local storage!');
    }
  }
}
