import { trigger, style, state, transition, animate } from '@angular/animations';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatPaginator, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { LocalizationService } from '@cg/ng-localization';
import { MessageService } from '@shared/services/message.service';
import { UtilService } from '@shared/services/util.service';
import { ManagerLogClass } from '@log/enums/manager-log-class.enum';
import { ManagerLog } from '@log/models/manager-log.model';
import { ManagerLogService } from '@log/services/manager-log.service';

@Component({
  selector: 'app-manager-log-list',
  templateUrl: './manager-log-list.component.html',
  styleUrls: ['./manager-log-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class ManagerLogListComponent implements OnInit, AfterViewInit {

  MANAGER_LOG_CLASS: typeof ManagerLogClass = ManagerLogClass;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  showData: (i: number, row: object) => boolean;
  managerLogDataSource = new MatTableDataSource<ManagerLog | any>();
  currentPage: PageEvent;
  totalCount: number;
  displayedColumns: string[] = ['logDate', 'account', 'logClass', 'operation', 'resp'];

  searchForm: FormGroup;

  logClassList: number[] = [this.MANAGER_LOG_CLASS.USER,
                            this.MANAGER_LOG_CLASS.ROLE,
                            this.MANAGER_LOG_CLASS.GROUP,
                            this.MANAGER_LOG_CLASS.SETTING,
                            this.MANAGER_LOG_CLASS.LOG,
                            this.MANAGER_LOG_CLASS.APP,
                            this.MANAGER_LOG_CLASS.TOKEN];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private matPaginatorIntl: MatPaginatorIntl,
    private messageService: MessageService,
    private translate: LocalizationService,
    private util: UtilService,
    private managerLogService: ManagerLogService,
  ) {
    this.searchForm = this.fb.group({
      account: ['', Validators.maxLength(64)],
      logClass: [this.logClassList],
      bLogDate: [''],
      eLogDate: ['']
    });
  }

  ngOnInit() {
    this.showData = (i: number, row: object) => {
      return this.totalCount !== 0;
    };
    this.currentPage = new PageEvent();
    this.currentPage.pageIndex = 0;
    this.currentPage.pageSize = 10;
    this.getManagerLogPageList();
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
    this.getManagerLogPageList();
  }

  search(): void {
    this.currentPage.pageIndex = 0;
    if (this.util.isDefined(this.paginator)) {
      this.paginator.pageIndex = 0;
    }
    this.getManagerLogPageList();
  }

  getManagerLogPageList() {
    if (this.searchForm.invalid) {
      return;
    }

    let bLogTimestamp = 0;
    let eLogTimestamp = 0;
    try {
      bLogTimestamp = new Date(this.searchForm.value.bLogDate).getTime();
      eLogTimestamp = new Date(this.searchForm.value.eLogDate).getTime();
      eLogTimestamp = eLogTimestamp + 24 * 60 * 60 * 1000 - 1;
    } catch {
      console.log('Invalid date');
    }

    this.managerLogService.getManagerLogPageList(
        this.searchForm.value.account,
        this.searchForm.value.logClass,
        bLogTimestamp,
        eLogTimestamp,
        this.currentPage.pageSize,
        this.currentPage.pageIndex)
      .subscribe(
        rst => {
          this.totalCount = rst.amount;
          this.managerLogDataSource.data = rst.result;
          if (this.totalCount === 0) {
            this.managerLogDataSource.data = [{noData: 'NoData'}];
          }
        },
        error => {
          const res =  this.translate.get('Message.error.serverErrorMsg');
          this.messageService.add({content: res, level: 'error'});
          this.router.navigate(['/management/error', error]);
        }
      );
  }

}
