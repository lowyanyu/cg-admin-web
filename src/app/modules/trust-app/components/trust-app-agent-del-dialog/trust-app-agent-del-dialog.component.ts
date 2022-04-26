import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorContext } from '@cg/ng-errorhandler';
import { LocalizationService } from '@cg/ng-localization';
import { MessageService } from '@shared/services/message.service';
import { TrustAppAgent } from '@trustApp/models/trust-app-agent.model';
import { TrustAppService } from '@trustApp/services/trust-app.service';

@Component({
  selector: 'app-trust-app-agent-del-dialog',
  templateUrl: './trust-app-agent-del-dialog.component.html',
  styleUrls: ['./trust-app-agent-del-dialog.component.scss']
})
export class TrustAppAgentDelDialogComponent implements OnInit {

  name = '';

  constructor(
    public dialogRef: MatDialogRef<TrustAppAgentDelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public delData: TrustAppAgent[],
    private appService: TrustAppService,
    private translate: LocalizationService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
  }

  getIdArray(delData: TrustAppAgent[]): Array<TrustAppAgent> {
    let IdArray = [];
    if (delData.length > 0) {
      IdArray = delData.map(d => {
        return new TrustAppAgent({appId: d.appId, agentId: d.agentId});
      });
    }
    return IdArray;
  }

  close(): void {
    this.dialogRef.close();
  }

  delete(): void {
    this.delData.map((d, index) => {
      if (index !== (this.delData.length - 1)) {
        this.name += d.agentIp + ' , ';
      } else {
        this.name += d.agentIp;
      }
    });
    this.appService.deleteAgent(this.getIdArray(this.delData)).subscribe(
      rst => {
        if (!rst) {
          const res = this.translate.get('Message.allSuccess.deleteAgent');
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
            res =  this.translate.get('Message.success.deleteAgent', {name: s.targetName});
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
                res =  this.translate.get('Message.success.deleteAgent', {name: e.targetName});
                return {content: res, level: 'success'};
              } else {
                res =  this.translate.get('Message.error.deleteAgent', {name: e.targetName, errorMsg: e.errorMessage});
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
