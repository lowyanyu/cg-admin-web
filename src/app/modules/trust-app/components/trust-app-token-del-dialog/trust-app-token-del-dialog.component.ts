import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorContext } from '@cg/ng-errorhandler';
import { LocalizationService } from '@cg/ng-localization';
import { MessageService } from '@shared/services/message.service';
import { TrustAppToken } from '@trustApp/models/trust-app-token.model';
import { TrustAppService } from '@trustApp/services/trust-app.service';

@Component({
  selector: 'app-trust-app-token-del-dialog',
  templateUrl: './trust-app-token-del-dialog.component.html',
  styleUrls: ['./trust-app-token-del-dialog.component.scss']
})
export class TrustAppTokenDelDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<TrustAppTokenDelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public delData: TrustAppToken[],
    private messageService: MessageService,
    private appService: TrustAppService,
    private translate: LocalizationService
  ) { }

  ngOnInit() {
  }

  getIdArray(delData: TrustAppToken[]): Array<TrustAppToken> {
    let IdArray = [];
    if (delData.length > 0) {
      IdArray = delData.map(d => {
        return d.tokenId;
      });
    }
    return IdArray;
  }

  close(): void {
    this.dialogRef.close();
  }

  delete(): void {
    this.appService.deleteToken(this.getIdArray(this.delData))
    .subscribe(
      rst => {
        if (!rst) {
          const res = this.translate.get('Message.allSuccess.deleteToken');
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
            res =  this.translate.get('Message.success.deleteToken', {name: s.targetName});
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
                res =  this.translate.get('Message.success.deleteToken', {name: e.targetName});
                return {content: res, level: 'success'};
              } else {
                res =  this.translate.get('Message.error.deleteToken', {name: e.targetName, errorMsg: e.errorMessage});
                return {content: res, level: 'error'};
              }
            })
          );
        }
        this.dialogRef.close(error);
      },
      () => this.delData = []
    );
  }
}
