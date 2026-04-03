import { Routes } from '@angular/router';

export const routes: Routes = [

  // Default route → redirect to upload
  {
    path: '',
    redirectTo: 'upload',
    pathMatch: 'full'
  },

  // Upload Resume
  {
    path: 'upload',
    loadComponent: () =>
      import('./features/resume/upload/upload.component')
        .then(m => m.UploadComponent)
  },

  // View Resumes List
  {
    path: 'resumes',
    loadComponent: () =>
      import('./features/resume/list/resume-list.component')
        .then(m => m.ResumeListComponent)
  },

  // Wildcard (optional but good practice)
  {
    path: '**',
    redirectTo: 'upload'
  }

];