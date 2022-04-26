import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { ErrorContext } from '@cg/ng-errorhandler';
import { LocalizationService } from '@cg/ng-localization';
import { ManagementPermission } from '@shared/enums/management-permission.enum';
import { MessageService } from '@shared/services/message.service';
import { forkJoin } from 'rxjs';
import { TrustApp } from '@trustApp/models/trust-app.model';
import { TrustAppPerms } from '@trustApp/models/trust-app-perms.model';
import { TrustAppService } from '@trustApp/services/trust-app.service';

@Component({
  selector: 'app-trust-app-perms-list',
  templateUrl: './trust-app-perms-list.component.html',
  styleUrls: ['./trust-app-perms-list.component.scss']
})
export class TrustAppPermsListComponent implements OnInit, OnChanges {

  MANAGEMENT_PERMISSION: typeof ManagementPermission = ManagementPermission;

  @Input() isStepperSet: boolean;

  @Input() appId: number;

  permissions: TrustAppPerms[];
  dataSource = new MatTableDataSource<TrustAppPerms>();
  displayedColumns: string[] = ['select', 'permission'];

  selection = new SelectionModel<TrustAppPerms>(true, []);
  selected: TrustAppPerms[];

  constructor(
    private messageService: MessageService,
    private translate: LocalizationService,
    private appService: TrustAppService,
  ) { }

  ngOnChanges() {
    this.getAppPerList();
    console.log(typeof this.isStepperSet);
  }

  ngOnInit() {
  }

  getAppPerList() {

    forkJoin(
      [this.appService.getAppPerms(this.appId),
      this.appService.getAppPermsList()]
    )
    .subscribe(([rst1, rst2]) => {
      this.permissions = rst1.result;
      this.dataSource.data = rst2.result;
      if (typeof this.permissions !== 'undefined' && this.permissions.length > 0) {
        this.dataSource.data.forEach(row => {
          if (this.permissions.some(p => p.permissionId  === row.permissionId)) {
            this.selection.select(row);
          }
        });
        this.selected = this.selection.selected.map( s => {
          return new TrustAppPerms({ permissionId: s.permissionId});
        });
      }
    },
    error => {
      const res =  this.translate.get('Message.error.serverErrorMsg');
      this.messageService.add({content: res, level: 'error'});
    });
  }

  getSelectedCheckBoxes() {
    this.selected = this.selection.selected.map( s => {
      return new TrustAppPerms({ permissionId: s.permissionId});
    });
    this.appService.selectedAppPermissions.next(this.selected);

  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    console.log(this.isAllSelected());
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => {
        if (this.selection.selected.every(s => s.permissionId  !== row.permissionId)) {
          this.selection.select(row);
        }
      });
    this.getSelectedCheckBoxes();
  }

  submit(): void {
    if (this.selected && this.selected.length > 0) {
      const app = new TrustApp({appId: this.appId, permissions: this.selected});
      this.appService.editPermission(app)
      .subscribe(
        () => {
          this.getAppPerList();
          const res =  this.translate.get('Message.success.setApplicationPermission');
          this.messageService.add({content: res, level: 'success'});
        },
        error => {
          const errorContext = error as ErrorContext;
          let res;
          if (errorContext.status < 500) {
            res =  this.translate.get('Message.error.setApplicationPermission', { errorMsg: error.errorMessage});
          } else {
            res =  this.translate.get('Message.error.serverErrorMsg');
          }
          this.messageService.add({content: res, level: 'error'});
        },
        () => this.selection.clear()
      );
    }
  }

}
