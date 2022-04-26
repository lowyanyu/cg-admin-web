import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { ErrorContext } from '@cg/ng-errorhandler';
import { LocalizationService } from '@cg/ng-localization';
import { ManagementPermission } from '@shared/enums/management-permission.enum';
import { MessageService } from '@shared/services/message.service';

import { TrustAppTokenDelDialogComponent } from '@trustApp/components/trust-app-token-del-dialog/trust-app-token-del-dialog.component';
import { TOKENTYPE } from '@trustApp/enums/trust-app-token-type.enum';
import { TrustAppToken } from '@trustApp/models/trust-app-token.model';
import { TrustAppService } from '@trustApp/services/trust-app.service';

@Component({
  selector: 'app-trust-app-token-list',
  templateUrl: './trust-app-token-list.component.html',
  styleUrls: ['./trust-app-token-list.component.scss']
})
export class TrustAppTokenListComponent implements OnInit, OnChanges {

  TOKENTYPE = TOKENTYPE;
  MANAGEMENT_PERMISSION: typeof ManagementPermission = ManagementPermission;

  @Input() appId: number;

  tokens: TrustAppToken[];
  dataSource = new MatTableDataSource<TrustAppToken>();
  displayedColumns: string[] = ['ip', 'expireTime', 'token', 'action'];
  tokenDataType: number;

  constructor(
    public dialog: MatDialog,
    private messageService: MessageService,
    private translate: LocalizationService,
    private appService: TrustAppService
  ) { }

  ngOnChanges() {
    this.tokenDataType = this.appService.isUnlimitedToken.value;
    console.log(this.tokenDataType);
    if (this.tokenDataType !== TOKENTYPE.UNLIMTED) {
      this.getAppTokenList();

    }
  }

  ngOnInit() {
    if (this.tokenDataType !== TOKENTYPE.UNLIMTED) {
      if (typeof this.tokens !== 'undefined' && this.tokens.length > 0) {
        this.dataSource.data = this.tokens.slice();
      } else {
        this.tokenDataType = TOKENTYPE.NODATA;
      }
    }
  }

  getAllToken(): TrustAppToken[] {
    return this.tokens;
  }

  sortIp(tokenIps: TrustAppToken[]): void {
    tokenIps = tokenIps.sort((a, b) => {
      const num1 = Number(a.ip.split('.').map((num) => (`000${num}`).slice(-3) ).join(''));
      const num2 = Number(b.ip.split('.').map((num) => (`000${num}`).slice(-3) ).join(''));
      return num1 - num2;
    });
  }

  sortData(sort: Sort): void {
    const data = this.tokens.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSource.data = data;
      return;
    }

    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'date': return this.compare(a.expireTime, b.expireTime, isAsc);
        default: return 0;
      }
    });
  }

  compare(a: number | string , b: number | string , isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  openDelDialog(element: TrustAppToken | TrustAppToken[]): void {
    let delArray = [];
    if (Array.isArray(element)) {
      delArray = element;
    } else {
      delArray.push(element);
    }
    const dialogRef = this.dialog.open(TrustAppTokenDelDialogComponent, {
      width: '500px',
      data: delArray
    });
    dialogRef.afterClosed().subscribe(resp => {
      const errorContext = resp as ErrorContext;
      if (errorContext !== undefined) {
        if (errorContext.errorCode === 0) {
          this.getAppTokenList();
        }
      }
    });
  }

  getAppTokenList(): void {
    this.dataSource = new MatTableDataSource<TrustAppToken>();
    this.appService.getAppTokenList(this.appId)
    .subscribe(
      rst => {
        this.tokens = rst.result;
        if (typeof this.tokens !== 'undefined' && this.tokens.length > 0) {
          this.sortIp(this.tokens);
          this.dataSource.data = this.tokens;
          this.tokenDataType = TOKENTYPE.NORMAL;
        } else {
          this.tokenDataType = TOKENTYPE.NODATA;
        }
      },
      error => {
        let res;
        if (error.status < 500) {
          res =  this.translate.get('Message.error.getApplicationTokens', { errorMsg: error.errorMessage});
        } else {
          res =  this.translate.get('Message.error.serverErrorMsg');
        }
        this.messageService.add({content: res, level: 'error'});
      }
    );
  }
}
