import { Component, ViewChild, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { ResumeService } from '../../../core/services/resume.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit, OnDestroy {

  selectedFile!: File;
  isUploading = false;
  fileName: string = '';
  errorMessage = '';
  isValidFile = false;

  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  isDragging = false;

  @ViewChild('fileInput') fileInput: any;

  constructor(
    private resumeService: ResumeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // 🔥 Prevent default (used globally)
  preventDefault = (event: Event) => {
    event.preventDefault();
  };

  // ✅ SSR SAFE INIT
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('dragover', this.preventDefault);
      window.addEventListener('drop', this.preventDefault);
    }
  }

  // ✅ CLEANUP
  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('dragover', this.preventDefault);
      window.removeEventListener('drop', this.preventDefault);
    }
  }

  // 🔥 COMMON FILE HANDLER
  handleFile(file: File) {

    this.errorMessage = '';
    this.isValidFile = false;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Only PDF, DOC, DOCX allowed';
      return;
    }

    if (file.size > maxSize) {
      this.errorMessage = 'File size must be less than 5MB';
      return;
    }

    if (file.size === 0) {
      this.errorMessage = 'File is empty';
      return;
    }

    this.selectedFile = file;
    this.fileName = file.name;
    this.isValidFile = true;
  }

  // ✅ CLICK SELECT
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.handleFile(file);
  }

  // ✅ DRAG OVER
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  // ✅ DRAG LEAVE
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  // ✅ DROP
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    const file = event.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }

  // ✅ TOAST
  showToastMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }

  // ✅ UPLOAD
  upload() {
    if (!this.selectedFile || this.isUploading) return;

    this.isUploading = true;
    this.errorMessage = '';

    this.resumeService.uploadResume(this.selectedFile)
      .subscribe({
        next: () => {
          this.showToastMessage('Resume uploaded successfully', 'success');
          this.resetForm();
          this.isUploading = false;
        },
        error: (err) => {

          if (err.status === 413) {
            this.showToastMessage('File size exceeds limit (5MB)', 'error');
          }
          else if (err.error?.error) {
            this.showToastMessage(err.error.error, 'error');
          }
          else {
            this.showToastMessage('Something went wrong', 'error');
          }

          this.isUploading = false;
        }
      });
  }

  // ✅ RESET
  resetForm() {
    this.selectedFile = undefined!;
    this.fileName = '';
    this.isValidFile = false;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
}