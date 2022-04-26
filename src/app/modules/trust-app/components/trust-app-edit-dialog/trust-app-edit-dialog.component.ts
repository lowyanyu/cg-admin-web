import { Component, OnInit, Inject } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorContext } from '@cg/ng-errorhandler';
import { LocalizationService } from '@cg/ng-localization';
import { MessageService } from '@shared/services/message.service';
import { TrustApp } from '@trustApp/models/trust-app.model';
import { TrustAppService } from '@trustApp/services/trust-app.service';

@Component({
  selector: 'app-trust-app-edit-dialog',
  templateUrl: './trust-app-edit-dialog.component.html',
  styleUrls: ['./trust-app-edit-dialog.component.scss']
})
export class TrustAppEditDialogComponent implements OnInit {

  editForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public editApp: TrustApp,
    private dialogRef: MatDialogRef<TrustAppEditDialogComponent>,
    private fb: FormBuilder,
    private appService: TrustAppService,
    private translate: LocalizationService,
    private messageService: MessageService,
  ) {
    this.editForm = this.fb.group({
      appName: [this.editApp.appName, Validators.required],
      appType: [this.editApp.appType, Validators.required],
      desc: [this.editApp.desc],
    });
  }

  ngOnInit() {
  }

  submit(): void {
    if (this.editForm.invalid) {
      return;
    }
    this.appService.editApp(this.editApp.appId, this.editForm.value).subscribe(
      () => {
        const res =  this.translate.get('Message.success.editApplication', {name: this.editApp.appName});
        this.messageService.add({content: res, level: 'success'});
        this.dialogRef.close(new ErrorContext(0, res));
      },
      error => {
        let res;
        if (error.status < 500) {
          res =  this.translate.get('Message.error.editApplication', {name: this.editApp.appName, errorMsg: error.errorMessage});
        } else {
          res =  this.translate.get('Message.error.serverErrorMsg');
        }
        this.messageService.add({content: res, level: 'error'});
        this.dialogRef.close(error);
      }
    );
  }

}
