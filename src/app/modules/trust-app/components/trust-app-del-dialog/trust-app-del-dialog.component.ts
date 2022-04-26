import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorContext } from '@cg/ng-errorhandler';
import { LocalizationService } from '@cg/ng-localization';
import { UtilService } from '@shared/services/util.service';
import { MessageService } from '@shared/services/message.service';
import { TrustApp } from '@trustApp/models/trust-app.model';
import { TrustAppService } from '@trustApp/services/trust-app.service';

@Component({
  selector: 'app-trust-app-del-dialog',
  templateUrl: './trust-app-del-dialog.component.html',
  styleUrls: ['./trust-app-del-dialog.component.scss']
})
export class TrustAppDelDialogComponent implements OnInit {

  name = '';
  constructor(
    private dialogRef: MatDialogRef<TrustAppDelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public delData: TrustApp[],
    private appService: TrustAppService,
    private translate: LocalizationService,
    private messageService: MessageService,
    private util: UtilService
  ) { }

  ngOnInit() {
    if (!this.util.isDefined(this.delData)) {
      const res =  this.translate.get('Message.error.serverErrorMsg');
      this.messageService.add({content: res, level: 'error'});
      this.dialogRef.close();
    }
  }

  getIdArray(delData: TrustApp[]): Array<number> {
    let IdArray = [];
    if (delData.length > 0) {
      IdArray = delData.map(d => {
        return d.appId;
      });
    }
    return IdArray;
  }

  close(): void {
    this.dialogRef.close();
  }

  delete(): void {
    this.appService.deleteApp(this.getIdArray(this.delData)).subscribe(
      rst => {
        if (!rst) {
          const res = this.translate.get('Message.allSuccess.deleteApplication');
          this.messageService.add({content: res, level: 'success'});
          this.dialogRef.close(new ErrorContext(0, res));
          return;
        }
        let success = new Array<ErrorContext>();
        if (rst.result instanceof Array) {
          success = rst.result;
        } else {
          success = [rst.result];
        }
        let res = '';
        this.messageService.addAll(
          success.map((s: ErrorContext) => {
            res =  this.translate.get('Message.success.deleteApplication', {name: s.targetName});
            return {content: res, level: 'success'};
          })
        );
        this.dialogRef.close(new ErrorContext(0, res));
      },
      error => {
        let errors = new Array<ErrorContext>();
        if (error instanceof Array) {
          errors = error;
        } else {
          errors = [error];
        }
        if (errors.findIndex(e => e.status >= 500) !== -1) {
          const res =  this.translate.get('Message.error.serverErrorMsg');
          this.messageService.add({content: res, level: 'error'});
        } else {
          let res = '';
          this.messageService.addAll(
            errors.map((e: ErrorContext) => {
              if (e.errorCode === 0) {
                res =  this.translate.get('Message.success.deleteApplication', {name: e.targetName});
                return {content: res, level: 'success'};
              } else {
                res =  this.translate.get('Message.error.deleteApplication', {name: e.targetName, errorMsg: e.errorMessage});
                return {content: res, level: 'error'};
              }
            })
          );
        }
        this.dialogRef.close(error);
      }
    );
  }
}
