import { Routes } from '@angular/router';
import { UploadComponent } from './file-upload/file-upload.component';
import { PreviewComponent } from './preview/preview.component';


export const routes: Routes = [
    { path: '', component: UploadComponent },
    { path: 'preview', component: PreviewComponent },
];