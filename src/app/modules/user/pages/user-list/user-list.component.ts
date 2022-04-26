import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgAuthService } from '@cg/ng-auth';
import { LocalizationService } from '@cg/ng-localization';
import { ManagementPermission } from '@shared/enums/management-permission.enum';
import { PageChangeEvent } from '@shared/models/page-change-event.model';
import { MessageService } from '@shared/services/message.service';
import { UtilService } from '@shared/services/util.service';
import { UserDelDialogComponent } from '@user/components/user-del-dialog/user-del-dialog.component';
import { User } from '@user/models/user.model';
import { UserService } from '@user/services/user.service';
import { BehaviorSubject, combineLatest, iif, Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, shareReplay, startWith, switchMap, take, tap } from 'rxjs/operators';

const EMPTY_LIST = {amount: 0, result: [{noData: 'NoData'}]};

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class UserListComponent implements OnInit {

  MANAGEMENT_PERMISSION: typeof ManagementPermission = ManagementPermission;

  showData: (i: number, row: object) => boolean;

  loginUser = '';
  selection = new SelectionModel<User>(true, []);

  showData$ = new BehaviorSubject<number>(0);

  pagination$ = new BehaviorSubject<PageChangeEvent>({
    pageIndex: 0,
    pageSize: 10
  });

  userListQuery$ = this.pagination$.pipe(
    switchMap(pagination => this.getUserList(pagination)),
    startWith({amount: 0, result: []}),
    shareReplay(1)
  );

  userItems$ = this.userListQuery$.pipe(
    map(list => list.result)
  );
  userTotal$ = this.userListQuery$.pipe(
    map(list => list.amount)
  );
  transition$ = this.userTotal$.pipe(
    map(amount => (amount === 0) ? 'expanded' : 'collapsed')
  );
  canDelete$ = this.userListQuery$.pipe(
    map(list => list.result.filter(u => u.userAccount !== this.loginUser && u.userAccount !== 'admin')),
    switchMap(row => iif(() => (row.length > 0 && JSON.stringify(row) !== JSON.stringify(EMPTY_LIST.result)), of(true), of(false))),
    distinctUntilChanged()
  );
  displayedColumns$ = this.canDelete$.pipe(
    switchMap(del => iif(() => del, of(['select']), of([]))),
    map(col => [...col, ...['userAccount', 'userName', 'phone', 'email', 'role', 'desc', 'action']])
  );

  constructor(
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog,
    private messageService: MessageService,
    private translate: LocalizationService,
    private authService: NgAuthService,
    private util: UtilService
  ) {
    this.loginUser = this.authService.getPrincipal().getProperty('userName');
  }

  ngOnInit(): void {
    this.showData = (i: number, row: object) => {
      return this.showData$.value !== 0;
    };
  }

  changePage(event: PageChangeEvent): void {
    this.pagination$.next(event);
  }

  resetPage(): void {
    this.selection.clear();
    this.pagination$.next({
      pageIndex: 0,
      pageSize: 10
    });
  }

  masterToggle(): void {
    combineLatest([
      this.isAllSelected(),
      this.userItems$
    ]).pipe(
      take(1)
    ).subscribe({
      next: ([isAll, users]: [boolean, User[]]) => {
        users = users.filter(u => u.userAccount !== this.loginUser && u.userAccount !== 'admin');
        users.forEach(u => this.deselect(u));
        isAll ? null : users.forEach(u => this.select(u));
      }
    });
  }

  getSelectedCheckBoxes(): User[] {
    return this.selection.selected.filter(u => (u.userAccount !== this.loginUser && u.userAccount !== 'admin'));
  }

  selectionChange(checked: boolean, row: any): void {
    checked ? this.select(row) : this.deselect(row);
  }

  select(row: any): void {
    this.selection.select(row);
  }

  deselect(row: any): void {
    const item = this.selection.selected.find(u => u.userId === row.userId);
    // deselect found 'item' instead of 'row' since selectionmodel will not be able to find 'row' to deselect after page change
    this.selection.deselect(item);
  }

  // check if exist in selection by id
  isSelected(row: any): boolean {
    return this.selection.selected.find(u => u.userId === row.userId) ? true : false;
  }

  currentSelectedInfo$ = combineLatest([this.selection.changed, this.userItems$]).pipe(
    switchMap(([selectionChanged, users]) => {
      const selectedUserIds = this.getSelectedCheckBoxes().map(u => u.userId);
      users = users.filter(u => u.userAccount !== this.loginUser && u.userAccount !== 'admin');
      const intersection = users.filter(u => selectedUserIds.includes(u.userId));
      return of([intersection.length, users.length]);
    }),
    shareReplay(1)
  )

  isAllSelected(): Observable<boolean> {
    return this.currentSelectedInfo$.pipe(
      switchMap(([selectedSize, listSize]) => of(selectedSize === listSize))
    )
  }

  hasSelected(): Observable<boolean> {
    return this.currentSelectedInfo$.pipe(
      switchMap(([selectedSize, listSize]) => of(selectedSize > 0))
    )
  }

  getUserList(pagination: PageChangeEvent): Observable<{amount: number, result: User[] | any}> {
    return this
      .userService
      .getUserPageList(pagination.pageSize, pagination.pageIndex)
        .pipe(
          tap(data => this.showData$.next(data.result.length)),
          // tap(() => this.clearSelection()),
          switchMap(data => iif(() => data.amount === 0, of(EMPTY_LIST), of(data))),
          catchError(error => {
            const res =  this.translate.get('Message.error.serverErrorMsg');
            this.messageService.add({content: res, level: 'error'});
            this.router.navigate(['/management/error', error]);
            return of(EMPTY_LIST);
          })
        );
  }

  openDelDialog(element: User | User[]): void {
    let delArray = [];
    Array.isArray(element) ? delArray = element : delArray.push(element);

    const dialogRef = this.dialog.open(UserDelDialogComponent, {
      width: '500px',
      data: delArray
    });
    dialogRef.afterClosed().subscribe({
      next: resp => {
        if (resp !== undefined) {
          this.resetPage();
        }
      }
    });
  }

  addUser() {
    this.router.navigate(['/management/system/user/list/add']);
  }

  editUser(editUser: User): void {
    this.router.navigate(['/management/system/user/list/edit', { userId: editUser.userId, mode: 'edit' }]);
  }
}
