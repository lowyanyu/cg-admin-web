import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { NgConfigService } from '@cg/ng-config';
import { ErrorService, ErrorContext } from '@cg/ng-errorhandler';
import { LocalizationService } from '@cg/ng-localization';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ServerResponse } from 'src/app/interfaces/server-resp.interface';
import { Role } from '@role/models/role.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
};

@Injectable()
export class RoleService {
  public roleUrl = '';
  public permissionUrl = '';

  constructor(
    private http: HttpClient,
    private configService: NgConfigService,
    private errorService: ErrorService,
    protected translate: LocalizationService
  ) {
    const coreUrl = this.configService.get('coreUrl');
    this.roleUrl = `${coreUrl}management/role`;
    this.permissionUrl = `${coreUrl}management/metadata/permission`;
  }

  getRolePageList(
      pageSize: number,
      pageIndex: number
      ): Observable<{amount: number, result: Role[]}> {
    let params = new HttpParams();
    params = params.append('pageSize', pageSize + '');
    params = params.append('pageIndex', pageIndex + '');
    return this.http
      .get<any>(this.roleUrl, { params: params })
      .pipe(
        map(this.errorService.handleSuccess),
        catchError(this.errorService.handleError)
      );
  }

  getPermissionList(type: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('type', type + '');
    return this.http
        .get<ServerResponse>
        (`${this.permissionUrl}`, {responseType: 'json', params: params} )
        .pipe(
          map(this.errorService.handleSuccess),
          catchError(this.errorService.handleError)
        );
  }

  addRole(role: Role): Observable<any> {
    return this.http
        .post<ServerResponse>
        (`${this.roleUrl}`, role, httpOptions)
        .pipe(
          map(this.errorService.handleSuccess),
          catchError(this.errorService.handleError)
        );
  }

  getRole(roleId: number): Observable<Role> {
    const url = `${this.roleUrl}/${roleId}`;
    return this.http
        .get<ServerResponse>(url)
        .pipe(
          map(this.errorService.handleSuccess),
          catchError(this.errorService.handleError)
        );
  }

  updateRole(role: Role, roleId: number): Observable<any> {
    const url = `${this.roleUrl}/${roleId}`;
    return this.http
        .post<ServerResponse>
        (url, role, httpOptions)
        .pipe(
          map(this.errorService.handleSuccess),
          catchError(this.errorService.handleError)
        );
  }

  delRole(roleId: number[]): Observable<any> {
    const url = `${this.roleUrl}/status`;
    const delParam = {
      data: roleId,
      op: 'delete'
    };
    return this.http.post<ServerResponse>
        (url, delParam, httpOptions).pipe(
          map(this.errorService.handleSuccess),
          catchError(this.errorService.handleError)
        );
  }

  getFlexItemWidth(innerWidth: number): string {
    const flexWidthOptions = ['1 1 22.25%', '1 1 30%', '1 1 46%', '1 1 100%', '1 1 auto'];
    if (innerWidth > 1700) {
      return flexWidthOptions[0];
    } else if (innerWidth > 1400) {
      return flexWidthOptions[1];
    } else if (innerWidth > 1100) {
      return flexWidthOptions[2];
    } else if (innerWidth > 720) {
      return flexWidthOptions[2];
    } else if (innerWidth > 600) {
      return flexWidthOptions[3];
    } else {
      return flexWidthOptions[4];
    }
  }
}
