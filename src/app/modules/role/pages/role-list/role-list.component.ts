import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { LocalizationService } from '@cg/ng-localization';
import { ManagementPermission } from '@shared/enums/management-permission.enum';
import { MessageService } from '@shared/services/message.service';
import { UtilService } from '@shared/services/util.service';
import { RoleDelDialogComponent } from '@role/components/role-del-dialog/role-del-dialog.component';
import { Role } from '@role/models/role.model';
import { RoleService } from '@role/services/role.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class RoleListComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  showData: (i: number, row: object) => boolean;
  currentPage: PageEvent;

  MANAGEMENT_PERMISSION: typeof ManagementPermission = ManagementPermission;

  roles: Role[];
  displayedColumns = ['select', 'roleName', 'desc', 'action'];
  selection = new SelectionModel<Role>(true, []);
  totalCount: number;
  dataSource = new MatTableDataSource<Role | any>();

  routerSubscription: Subscription;

  constructor(
    private roleService: RoleService,
    private router: Router,
    private matPaginatorIntl: MatPaginatorIntl,
    private dialog: MatDialog,
    private messageService: MessageService,
    private translate: LocalizationService,
    private util: UtilService
  ) { }

  ngOnInit(): void {
    this.showData = (i: number, row: object) => {
      return this.totalCount !== 0;
    };
    this.currentPage = new PageEvent();
    this.currentPage.pageIndex = 0;
    this.currentPage.pageSize = 10;
    this.getRoleList();
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
    this.matPaginatorIntl.nextPageLabel =  this.translate.get('general.nextPage');
    this.matPaginatorIntl.previousPageLabel =  this.translate.get('general.previousPage');
    this.matPaginatorIntl.firstPageLabel = this.translate.get('general.firstPage');
    this.matPaginatorIntl.lastPageLabel = this.translate.get('general.lastPage');
  }

  ngOnDestroy(): void {
    if (this.util.isDefined(this.routerSubscription)) {
      this.routerSubscription.unsubscribe();
    }
  }

  search(): void {
    this.currentPage.pageIndex = 0;
    if (this.util.isDefined(this.paginator)) {
      this.paginator.pageIndex = 0;
    }
    this.getRoleList();
  }

  changePage(event?: PageEvent): void {
    this.currentPage.pageIndex = event.pageIndex;
    this.currentPage.pageSize = event.pageSize;
    this.getRoleList();
  }

  getSelectedCheckBoxes(): any {
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

  getRoleList(): void {
    this.roleService.getRolePageList(this.currentPage.pageSize, this.currentPage.pageIndex).subscribe(
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

  openDelDialog(element: Role | Role[]): void {
    let delArray = [];
    if (Array.isArray(element)) {
      delArray = element;
    } else {
      delArray.push(element);
    }
    const dialogRef = this.dialog.open(RoleDelDialogComponent, {
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

  addRole() {
    this.router.navigate(['/management/system/role/list/add']);
  }

  editRole(editRole: Role): void {
    this.router.navigate(['/management/system/role/list/edit', {roleId: editRole.roleId}]);
  }
}
