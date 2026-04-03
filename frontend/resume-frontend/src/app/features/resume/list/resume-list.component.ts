import { Component, OnInit } from '@angular/core';
import { ResumeService } from '../../../core/services/resume.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resume-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resume-list.component.html',
  styleUrls: ['./resume-list.component.css']
})
export class ResumeListComponent implements OnInit {

  resumes: any[] = [];

  constructor(private resumeService: ResumeService) {}

  ngOnInit(): void {
    this.loadResumes();
  }

  // 🔥 Load all resumes
  loadResumes() {
    this.resumeService.getAllResumes()
      .subscribe({
        next: (data) => {
          this.resumes = data;
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  //format size in KB/MB
  formatSize(size: number): string {
  if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + ' KB';
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' MB';
  }
}

  // 🔥 Preview (PDF only)
  preview(id: string) {
    this.resumeService.downloadResume(id)
      .subscribe({
        next: (blob) => {
          const file = new Blob([blob], { type: 'application/pdf' });
          const url = URL.createObjectURL(file);
          window.open(url, '_blank');
        },
        error: (err) => {
          console.error('Preview error:', err);
        }
      });
  }

  // 🔥 Download
  download(id: string) {
    this.resumeService.downloadResume(id)
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume';
        a.click();
      });
  }

  // 🔥 Delete with confirmation
  delete(id: string) {

    const confirmDelete = confirm('Are you sure you want to delete this resume?');

    if (!confirmDelete) return;

    this.resumeService.deleteResume(id)
      .subscribe({
        next: () => {
          this.loadResumes(); // refresh list
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
}