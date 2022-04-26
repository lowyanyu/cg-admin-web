import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorContext } from '@cg/ng-errorhandler';
import { LocalizationService } from '@cg/ng-localization';
import { MessageService } from '@shared/services/message.service';
import { UtilService } from '@shared/services/util.service';
import { Role } from '@role/models/role.model';
import { RoleService } from '@role/services/role.service';

@Component({
  selector: 'app-role-del-dialog',
  templateUrl: './role-del-dialog.component.html',
  styleUrls: ['./role-del-dialog.component.scss']
})
export class RoleDelDialogComponent implements OnInit {
  name = '';

  constructor(private dialogRef: MatDialogRef<RoleDelDialogComponent>,
              private util: UtilService,
              private messageService: MessageService,
              private translate: LocalizationService,
              private roleService: RoleService,
              @Inject(MAT_DIALOG_DATA) public delData: Role[]) { }

  ngOnInit(): void {
    if (!this.util.isDefined(this.delData)) {
      this.dialogRef.close();
    }
  }

  getIdArray(delData: Role[]): Array<number> {
    let IdArray = [];
    if (delData.length > 0) {
      IdArray = delData.map(d => {
        return d.roleId;
      });
    }
    return IdArray;
  }

  close(): void {
    this.dialogRef.close();
  }

  delete(): void {
    this.roleService.delRole(this.getIdArray(this.delData)).subscribe(
      rst => {
        if (!rst) {
          const res = this.translate.get('Message.allSuccess.deleteRole');
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
            res =  this.translate.get('Message.success.deleteRole', {name: s.targetName});
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
                res =  this.translate.get('Message.success.deleteAccount', {name: e.targetName});
                return {content: res, level: 'success'};
              } else {
                res =  this.translate.get('Message.error.deleteAccount', {name: e.targetName, errorMsg: e.errorMessage});
                return {content: res, level: 'error'};
              }
            })
          );
        }
        this.dialogRef.close(error);
      },
    );
  }

}
