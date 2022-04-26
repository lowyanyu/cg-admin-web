import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { ErrorContext } from '@cg/ng-errorhandler';
import { LocalizationService } from '@cg/ng-localization';
import { ManagementPermission } from '@shared/enums/management-permission.enum';
import { MessageService } from '@shared/services/message.service';
import { UtilService } from '@shared/services/util.service';

import { TrustAppDelDialogComponent } from '@trustApp/components/trust-app-del-dialog/trust-app-del-dialog.component';
import { TrustAppImportDialogComponent } from '@trustApp/components/trust-app-import-dialog/trust-app-import-dialog.component';
import { TrustAppExportDialogComponent } from '@trustApp/components/trust-app-export-dialog/trust-app-export-dialog.component';
import { TrustAppEditDialogComponent } from '@trustApp/components/trust-app-edit-dialog/trust-app-edit-dialog.component';
import { TrustAppApikeyDlDialogComponent } from '@trustApp/components/trust-app-apikey-dl-dialog/trust-app-apikey-dl-dialog.component';
import { TrustApp } from '@trustApp/models/trust-app.model';
import { TrustAppService } from '@trustApp/services/trust-app.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-trust-app-list',
  templateUrl: './trust-app-list.component.html',
  styleUrls: ['./trust-app-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class TrustAppListComponent implements OnInit, AfterViewInit, OnDestroy {

  MANAGEMENT_PERMISSION: typeof ManagementPermission = ManagementPermission;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  showData: (i: number, row: object) => boolean;
  dataSource = new MatTableDataSource<TrustApp | any>();
  currentPage: PageEvent;
  totalCount: number;
  displayedColumns: string[] = ['select', 'appName', 'appType', 'desc', 'action'];
  selection = new SelectionModel<TrustApp>(true, []);

  routerSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private matPaginatorIntl: MatPaginatorIntl,
    private messageService: MessageService,
    private translate: LocalizationService,
    private appService: TrustAppService,
    private util: UtilService
  ) { }

  ngOnInit() {
    this.showData = (i: number, row: object) => {
      return this.totalCount !== 0;
    };
    this.currentPage = new PageEvent();
    this.currentPage.pageIndex = 0;
    this.currentPage.pageSize = 10;
    this.getAppList();
  }

  ngAfterViewInit() {
    this.routerSubscription = this.router.events.pipe(
      filter((event: RouterEvent) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.search();
    });

    this.matPaginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
      if (length === 0 || pageSize === 0) {
        return this.translate.get('general.pageCount', {startIndex: 0, endIndex: 0, total: 0});
      }

      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
      return this.translate.get('general.pageCount', {startIndex: (startIndex + 1), endIndex: endIndex, total: length});
    };

    this.matPaginatorIntl.itemsPerPageLabel =  this.translate.get('general.perPage');
    this.matPaginatorIntl.nextPageLabel =  this.translate.get('general.previousPage');
    this.matPaginatorIntl.previousPageLabel =  this.translate.get('general.nextPage');
    this.matPaginatorIntl.firstPageLabel = this.translate.get('general.firstPage');
    this.matPaginatorIntl.lastPageLabel = this.translate.get('general.lastPage');
  }

  ngOnDestroy(): void {
    if (this.util.isDefined(this.routerSubscription)) {
      this.routerSubscription.unsubscribe();
    }
  }

  changePage(event?: PageEvent): void {
    this.currentPage.pageIndex = event.pageIndex;
    this.currentPage.pageSize = event.pageSize;
    this.getAppList();
  }

  getAppList(): void {
    this.appService.getAppList(this.currentPage.pageSize, this.currentPage.pageIndex).subscribe(
      rst => {
        this.totalCount = rst.amount;
        this.dataSource.data = rst.result;
        if (this.totalCount === 0) {
          this.dataSource.data = [{noData: 'NoData'}];
        }
      },
      error => {
        const res =  this.translate.get('Message.error.serverErrorMsg');
        this.messageService.add({content: res, level: 'error'});
        this.router.navigate(['/management/error', error]);
      }
    );
  }

  getAppInfo(appId: number): void {
    this.router.navigate(['/management/system/trustApp/list/info', {appId: appId}]);
  }

  getSelectedCheckBoxes() {
    return this.selection.selected;
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  openDelDialog(element: TrustApp | Array<TrustApp>): void {
    let delArray = [];
    if (Array.isArray(element)) {
      delArray = element;
    } else {
      delArray.push(element);
    }
    const dialogRef = this.dialog.open(TrustAppDelDialogComponent, {
      width: '500px',
      data: delArray
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp !== undefined) {
        this.selection.clear();
        this.search();
      }
    });
  }

  openDlDialog(appId: number): void {
    const dialogRef = this.dialog.open(TrustAppApikeyDlDialogComponent, {
      width: '500px',
      data: appId
    });
  }

  openExportDialog(element: TrustApp ): void {
    const dialogRef = this.dialog.open(TrustAppExportDialogComponent, {
      width: '500px',
      data: element
    });
  }

  openEditDialog(element: TrustApp): void {
    const dialogRef = this.dialog.open(TrustAppEditDialogComponent, {
      width: '500px',
      data: element
    });
    dialogRef.afterClosed().subscribe(resp => {
      const errorContext = resp as ErrorContext;
      if (errorContext !== undefined) {
        if (errorContext.errorCode === 0) {
          this.selection.clear();
          this.search();
        }
      }
    });
  }

  openImportDialog(): void {
    const dialogRef = this.dialog.open(TrustAppImportDialogComponent, {
      width: '500px',
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp !== undefined) {
        this.selection.clear();
        this.search();
      }
    });
  }

  search(): void {
    this.currentPage.pageIndex = 0;
    if (this.util.isDefined(this.paginator)) {
      this.paginator.pageIndex = 0;
    }
    this.getAppList();
  }
}
