import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NgConfigService } from '@cg/ng-config';
import { ErrorService } from '@cg/ng-errorhandler';
import { LocalizationService } from '@cg/ng-localization';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DebugLog } from '@log/models/debug-log.model';

@Injectable()
export class DebugLogService {

  private debugLogUrl = '';

  constructor(
    private http: HttpClient,
    private configService: NgConfigService,
    private errorService: ErrorService,
    protected translate: LocalizationService
  ) {
    const coreUrl = this.configService.get('coreUrl');
    this.debugLogUrl = `${coreUrl}management/debugLog`;
  }

  /** GET: get debug log file list from the server */
  getDebugLogPageList(param: {
    orderColumn: string,
    orderType: string,
    pageSize: number,
    pageIndex: number}): Observable<{debugLogPath: string, amount: number, result: DebugLog[]}> {
      let params = new HttpParams();
      params = params.append('pageSize', param.pageSize + '');
      params = params.append('pageIndex', param.pageIndex + '');
      params = params.append('orderColumn', param.orderColumn + '');
      params = params.append('orderType', param.orderType + '');
      return this.http
        .get<any>(this.debugLogUrl, { params: params })
        .pipe(
          map(this.errorService.handleSuccess),
          catchError(this.errorService.handleError)
        );
    }

  downloadDebugLog(fileId: number): Observable<any> {
    const url = `${this.debugLogUrl}/file`;
    let params = new HttpParams();
    params = params.append('fileId', fileId + '');
    return this.http
    .get<any>(url, { params: params })
    .pipe(
      map(this.errorService.handleSuccess),
      catchError(this.errorService.handleError)
    );
  }

}
