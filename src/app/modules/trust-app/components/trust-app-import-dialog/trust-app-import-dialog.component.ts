import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ErrorContext } from '@cg/ng-errorhandler';
import { LocalizationService } from '@cg/ng-localization';
import { MessageService } from '@shared/services/message.service';
import { TrustAppService } from '@trustApp/services/trust-app.service';

@Component({
  selector: 'app-trust-app-import-dialog',
  templateUrl: './trust-app-import-dialog.component.html',
  styleUrls: ['./trust-app-import-dialog.component.scss']
})
export class TrustAppImportDialogComponent implements OnInit {

  uploadForm: FormGroup;
  fileToUpload: Array<File>;
  filePath: string;

  constructor(
    private dialogRef: MatDialogRef<TrustAppImportDialogComponent>,
    private messageService: MessageService,
    private appService: TrustAppService,
    fb: FormBuilder,
    private translate: LocalizationService,
  ) {
    this.uploadForm = fb.group({
      importFile: ['', Validators.required],
      fileType: '',
      isFileUpload: ''
    });
  }

  ngOnInit() {
    this.filePath = this.translate.get('general.notChooseFile');
  }

  fileChangeEvent(fileInput: any): void {
    this.fileToUpload = fileInput.target.files as Array<File>;
    if (this.fileToUpload[0] !== undefined) {
      console.log('appToUpload: ' + this.fileToUpload[0].name);
      this.filePath = this.fileToUpload[0].name;
    }
  }

  submit(): void {
    if (this.fileToUpload === undefined) {
      this.uploadForm.controls.isFileUpload.markAsTouched();
      return;
    } else {
      this.uploadForm.controls.isFileUpload.markAsUntouched();
    }
    const parentThis = this;
    const reader  = new FileReader();
    reader.readAsDataURL(this.fileToUpload[0]);
    reader.onload = () => {
      const content = reader.result as string;
      const uploadParam = {
        importFile: content.split(',')[1],
      };
      parentThis.appService.importApp(uploadParam)
      .subscribe(
        () => {
          const res  = parentThis.translate.get('Message.success.importApplication');
          parentThis.dialogRef.close(new ErrorContext(0, res));
          parentThis.messageService.add({content: res, level: 'success'});
        },
        error => {
          let res;
          if (error.status < 500) {
            res =  res = parentThis.translate.get('Message.error.importApplication', {errorMsg: error.errorMessage});
            parentThis.messageService.add({content: res, level: 'error'});
          } else {
            res =  parentThis.translate.get('Message.error.serverErrorMsg');
            parentThis.dialogRef.close(error);
            parentThis.messageService.add({content: res, level: 'error'});
          }
        }
      );
    };

  }


}
