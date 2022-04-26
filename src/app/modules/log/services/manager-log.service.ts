import { Injectable } from '@angular/core';
import { HttpParams, HttpClient } from '@angular/common/http';
import { ErrorService } from '@cg/ng-errorhandler';
import { NgConfigService } from '@cg/ng-config';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ManagerLog } from '@log/models/manager-log.model';

@Injectable()
export class ManagerLogService {

  private managerLogUrl = '';

  constructor(
    private errorService: ErrorService,
    private configService: NgConfigService,
    private http: HttpClient
  ) {
    const coreUrl = this.configService.get('coreUrl');
    this.managerLogUrl = `${coreUrl}management/managerLog`;
  }
  getManagerLogPageList(
    account: string,
    logClass: number,
    bLogDate: number,
    eLogDate: number,
    pageSize: number,
    pageIndex: number): Observable<{amount: number, result: ManagerLog[]}> {
      let params = new HttpParams();
      params = params.append('account', account);
      params = params.append('logClass', logClass + '');
      params = params.append('bLogDate', (isNaN(bLogDate) || bLogDate === 0) ? '' : bLogDate + '');
      params = params.append('eLogDate', (isNaN(eLogDate) || eLogDate === 0) ? '' : eLogDate + '');
      params = params.append('pageSize', pageSize + '');
      params = params.append('pageIndex', pageIndex + '');
      return this.http
        .get<any>(this.managerLogUrl, { params: params })
        .pipe(
          map(this.errorService.handleSuccess),
          catchError(this.errorService.handleError)
        );
    }

  /** GET: get managerlog by id from the server */
  getManagerLog(managerLogId: number): Observable<ManagerLog> {
    const url = `${this.managerLogUrl}/${managerLogId}`;
    return this.http.get<ManagerLog>(url)
      .pipe(
        map(this.errorService.handleSuccess),
        catchError(this.errorService.handleError)
      );
  }

}
