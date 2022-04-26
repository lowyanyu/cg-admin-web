import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { LocalizationService } from '@cg/ng-localization';
import { UtilService } from '@shared/services/util.service';
import { MessageService } from '@shared/services/message.service';
import { DebugLog } from '@log/models/debug-log.model';
import { DebugLogService } from '@log/services/debug-log.service';

@Component({
  selector: 'app-debug-log-list',
  templateUrl: './debug-log-list.component.html',
  styleUrls: ['./debug-log-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class DebugLogListComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  showData: (i: number, row: object) => boolean;

  debugLogPath: string;

  debuglogDataSource = new MatTableDataSource<DebugLog | any>();
  displayedColumns: string[] = ['fileName', 'lastUpdateTime', 'fileSize', 'action'];
  currentPage: PageEvent;
  totalCount: number;

  orderColumn: string;
  orderDirection: string;

  constructor(
    private router: Router,
    private matPaginatorIntl: MatPaginatorIntl,
    private messageService: MessageService,
    private translate: LocalizationService,
    private util: UtilService,
    private debugLogService: DebugLogService
  ) { }

  ngOnInit() {
    this.showData = (i: number, row: object) => {
      return this.totalCount !== 0;
    };
    this.search();
  }

  search(): void {
    this.currentPage = new PageEvent();
    this.currentPage.pageIndex = 0;
    this.currentPage.pageSize = 10;
    this.orderColumn = 'lastUpdateTime';
    this.orderDirection = 'DESC';
    this.getDebugLogList();
  }

  ngAfterViewInit() {
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

  changePage(event?: PageEvent): void {
    this.currentPage.pageIndex = event.pageIndex;
    this.currentPage.pageSize = event.pageSize;
    this.getDebugLogList();
  }

  sortLogList(sort: Sort): void {
    this.orderColumn = sort.active;
    this.orderDirection = sort.direction;
    this.getDebugLogList();
  }

  getDebugLogList(): void {
    this.debugLogService.getDebugLogPageList({
      pageIndex: this.currentPage.pageIndex,
      pageSize: this.currentPage.pageSize,
      orderColumn: this.orderColumn,
      orderType: this.orderDirection
    }).subscribe(
        rst => {
          this.debugLogPath = rst.debugLogPath;
          this.totalCount = rst.amount;
          this.debuglogDataSource.data = rst.result;
          if (this.totalCount === 0) {
            this.debuglogDataSource.data = [{noData: 'NoData'}];
          }
        },
        error => {
          const res =  this.translate.get('Message.error.serverErrorMsg');
          this.messageService.add({content: res, level: 'error'});
          this.router.navigate(['/management/error', error]);
        }
      );
  }

  downloadLog(element: DebugLog): void {
    this.debugLogService.downloadDebugLog(element.fileId).subscribe(
      rst => {
          let downloadFile = null;
          let downloadFileName = null;
          let link = null;
          const data = new Blob([atob(rst.file)], { type: 'text/plain' });
          if (this.util.isDefined(downloadFile)) {
            window.URL.revokeObjectURL(downloadFile);
          }

          downloadFileName = element.fileName;
          downloadFile = window.URL.createObjectURL(data);

          if (navigator.appVersion.toString().indexOf('.NET') > 0) {
             // for IE and Edge
            window.navigator.msSaveBlob(data, downloadFileName);
          } else {
            link = document.createElement('a');

            link.setAttribute('download', downloadFileName);
            link.href = downloadFile;
            document.body.appendChild(link);
          }

          window.requestAnimationFrame(() => {
            const event = new MouseEvent('click');
            link.dispatchEvent(event);
            document.body.removeChild(link);
          });
          console.log('Download Log');

          if (this.util.isDefined(downloadFile)) {
          } else {
            const res =  this.translate.get('Message.error.dwDebugLog', {name: element.fileName});
            this.messageService.add({content: res, level: 'error'});
          }
      },
      error => {
        let res;
        if (error.status < 500) {
          res =  this.translate.get('Message.error.dwDebugLog', {name: element.fileName, errorMsg: error.errorMessage});
          this.messageService.add({content: res, level: 'error'});
        } else {
          res =  this.translate.get('Message.error.serverErrorMsg');
          this.messageService.add({content: res, level: 'error'});
        }

      }
    );
  }


}
