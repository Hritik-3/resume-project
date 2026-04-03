import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Resume } from '../../shared/models/resume.model';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {

  private baseUrl = 'http://localhost:8080/api/resumes';

  constructor(private http: HttpClient) {}

  // 1. Upload Resume
  uploadResume(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<Resume>(`${this.baseUrl}/upload`, formData);
  }

  // 2. Get All Resumes
  getAllResumes(): Observable<Resume[]> {
    return this.http.get<Resume[]>(this.baseUrl);
  }

  // 3. Download Resume (BLOB)
  downloadResume(id: string) {
  return this.http.get(`${this.baseUrl}/download/${id}`, {
    responseType: 'blob'
  });
}

  // 4. Delete Resume
  deleteResume(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}