import { style, trigger, state, transition, animate } from '@angular/animations';
import { CdkAccordionItem, CdkAccordion } from '@angular/cdk/accordion';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild, AfterViewInit, Optional, SkipSelf, Inject, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanelState, MAT_ACCORDION, matExpansionAnimations } from '@angular/material/expansion';
import { MatPaginator, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { LocalizationService } from '@cg/ng-localization';
import { MessageService } from '@shared/services/message.service';
import { UtilService } from '@shared/services/util.service';
import { ServiceLogDetailDialogComponent } from '@log/components/service-log-detail-dialog/service-log-detail-dialog.component';
import { ErrorCodeType } from '@log/enums/error-code-type.enum';
import { ServiceLogClass } from '@log/enums/service-log-class.enum';
import { ServiceLog } from '@log/models/service-log.model';
import { ServiceLogService } from '@log/services/service-log.service';

@Component({
  selector: 'app-service-log-list',
  templateUrl: './service-log-list.component.html',
  styleUrls: ['./service-log-list.component.scss'],
  animations: [matExpansionAnimations.bodyExpansion,
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class ServiceLogListComponent extends CdkAccordionItem implements OnInit, AfterViewInit {

  SERVICE_LOG_CLASS: typeof ServiceLogClass = ServiceLogClass;
  ERROR_CODE_TYPE: typeof ErrorCodeType = ErrorCodeType;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  showData: (i: number, row: object) => boolean;
  serviceLogDataSource = new MatTableDataSource<ServiceLog | any>();
  currentPage: PageEvent;
  totalCount: number;

  displayedColumns: string[] = ['logDate', 'account', 'clientIp', 'logClass', 'operation', 'errorCodeType', 'resp', 'action'];

  searchForm: FormGroup;

  logClassList: number[] = [this.SERVICE_LOG_CLASS.ASYMMETRIC_KEY,
                            this.SERVICE_LOG_CLASS.SYMMETRIC_KEY,
                            this.SERVICE_LOG_CLASS.END_TO_END,
                            this.SERVICE_LOG_CLASS.CERT,
                            this.SERVICE_LOG_CLASS.TOKEN];
  appTypeList: number[] = [1, 2];

  errorCodeTypes: number[] = [this.ERROR_CODE_TYPE.ALL,
                              this.ERROR_CODE_TYPE.NORMAL,
                              this.ERROR_CODE_TYPE.ABNORMAL];

  constructor(
    @Optional() @SkipSelf() @Inject(MAT_ACCORDION) accordion: CdkAccordion,
    changeDetectorRef: ChangeDetectorRef,
    expansionDispatcher: UniqueSelectionDispatcher,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private matPaginatorIntl: MatPaginatorIntl,
    private messageService: MessageService,
    private translate: LocalizationService,
    private serviceLogService: ServiceLogService,
    private util: UtilService
  ) {
    super(accordion, changeDetectorRef, expansionDispatcher);
    // const ipPattern =
    //     '^([0-9]{1,3}|[*])[.]([0-9]{1,3}|[*])[.]([0-9]{1,3}|[*])[.]([0-9]{1,3}|[*])$';
    this.searchForm = this.fb.group({
      trustAppName: ['', Validators.maxLength(64)],
      clientIp: [''],
      appInfo: [''],
      trustAppType: [[]],
      transactionId: [''],
      logClass: [this.logClassList],
      errorType: [''],
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
    this.getServiceLogPageList();
  }

  ngAfterViewInit() {
    this.matPaginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
      if (length === 0 || pageSize === 0) {
        return this.translate.get('general.pageCount', {startIndex: 0, endIndex: 0, total: 0});
      }

      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
      return this.translate.get('general.pageCount', {startIndex: (startIndex + 1), endIndex: `${endIndex}`, total: length});
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
    this.getServiceLogPageList();
  }

  getExpandedState(): MatExpansionPanelState {
    return this.expanded ? 'expanded' : 'collapsed';
  }

  search(): void {
    this.currentPage.pageIndex = 0;
    if (this.util.isDefined(this.paginator)) {
      this.paginator.pageIndex = 0;
    }
    this.getServiceLogPageList();
  }

  getServiceLogPageList() {
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

    this.serviceLogService.getServiceLogPageList(
      {trustAppName: this.searchForm.value.trustAppName, clientIp: this.searchForm.value.clientIp,
          trustAppType: this.searchForm.value.trustAppType, trustAppInfo: this.searchForm.value.appInfo,
          transactionId: this.searchForm.value.transactionId,
          errorType: this.searchForm.value.errorType, logClass: this.searchForm.value.logClass,
          bLogDate: bLogTimestamp, eLogDate: eLogTimestamp,
          pageSize: this.currentPage.pageSize, pageIndex: this.currentPage.pageIndex})
      .subscribe(
        rst => {
          this.totalCount = rst.amount;
          this.serviceLogDataSource.data = rst.result;
          if (this.totalCount === 0) {
            this.serviceLogDataSource.data = [{noData: 'NoData'}];
          }
        },
        error => {
          const res =  this.translate.get('Message.error.serverErrorMsg');
          this.messageService.add({content: res, level: 'error'});
          this.router.navigate(['/management/error', error]);
        }
      );
  }

  openDetailDialog(logId: number) {
    const dialogRef = this.dialog.open(ServiceLogDetailDialogComponent, {
      width: '550px',
      data: logId
    });
  }

}

