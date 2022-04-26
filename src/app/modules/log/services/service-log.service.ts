import { Injectable } from '@angular/core';
import { HttpParams, HttpClient } from '@angular/common/http';
import { NgConfigService } from '@cg/ng-config';
import { ErrorService } from '@cg/ng-errorhandler';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ServiceLog } from '@log/models/service-log.model';

@Injectable()
export class ServiceLogService {

  private serviceLogUrl = '';

  constructor(
    private configService: NgConfigService,
    private http: HttpClient,
    private errorService: ErrorService,
  ) {
    const coreUrl = this.configService.get('coreUrl');
    this.serviceLogUrl = `${coreUrl}management/serviceLog`;
  }
  getServiceLogPageList(param: {trustAppName: string, clientIp: string, trustAppType: number, trustAppInfo: string,
    transactionId: string, errorType: number, logClass: number, bLogDate: number, eLogDate: number,
    pageSize: number, pageIndex: number}): Observable<{amount: number, result: ServiceLog[]}> {
      let params = new HttpParams();
      params = params.append('account', param.trustAppName);
      params = params.append('clientIp', param.clientIp);
      params = params.append('appInfo', param.trustAppInfo);
      params = params.append('appType', param.trustAppType.toString());
      params = params.append('transactionId', param.transactionId);
      params = params.append('logClass', param.logClass.toString());
      params = params.append('errorType', param.errorType.toString());
      params = params.append('bLogDate', (isNaN(param.bLogDate) || param.bLogDate === 0) ? '' : param.bLogDate + '');
      params = params.append('eLogDate', (isNaN(param.eLogDate) || param.eLogDate === 0) ? '' : param.eLogDate + '');
      params = params.append('pageSize', param.pageSize.toString());
      params = params.append('pageIndex', param.pageIndex.toString());
      return this.http
        .get<any>(this.serviceLogUrl, { params: params })
        .pipe(
          map(this.errorService.handleSuccess),
          catchError(this.errorService.handleError)
        );
    }

  /** GET: get service log from the server */
  getServiceLogList(): Observable<ServiceLog[]> {
    return this.http
      .get<ServiceLog[]>(this.serviceLogUrl)
      .pipe(
        map(this.errorService.handleSuccess),
        catchError(this.errorService.handleError)
      );
  }

  /** GET: get service by id from the server */
  getServicesLog(serviceLogId: number): Observable<any> {
    const url = `${this.serviceLogUrl}/${serviceLogId}`;
    return this.http.get<ServiceLog>(url)
      .pipe(
        map(this.errorService.handleSuccess),
        catchError(this.errorService.handleError)
      );
  }
}
