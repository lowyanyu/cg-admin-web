import { Injectable } from '@angular/core';
import { HttpHeaders, HttpParams, HttpClient } from '@angular/common/http';
import { NgConfigService } from '@cg/ng-config';
import { ErrorContext, ErrorService } from '@cg/ng-errorhandler';
import { LocalizationService } from '@cg/ng-localization';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TrustApp } from '@trustApp/models/trust-app.model';
import { TrustAppToken } from '@trustApp/models/trust-app-token.model';
import { TrustAppPerms } from '@trustApp/models/trust-app-perms.model';
import { TrustAppAgent } from '@trustApp/models/trust-app-agent.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
};

@Injectable()
export class TrustAppService {

  selectedAppPermissions = new Subject<TrustAppPerms[]>();
  selectedAppPERMSObservable = this.selectedAppPermissions.asObservable();
  isUnlimitedToken = new BehaviorSubject<number>(1);

  private appUrl = '';
  private agentUrl = '';
  private appPermsUrl = '';
  private tokenUrl = '';

  constructor(
    private configService: NgConfigService,
    private errorService: ErrorService,
    protected translate: LocalizationService,
    private http: HttpClient
  ) {
    const coreUrl = this.configService.get('coreUrl');
    this.appUrl = `${coreUrl}management/application`;
    this.agentUrl = `${coreUrl}management/agent`;
    this.appPermsUrl = `${coreUrl}management/metadata/permission`;
    this.tokenUrl = `${coreUrl}management/token`;

  }

  getAppTokenSetting(): void {
    const tokenExpireTime = (this.configService.get('app_token_expire_time') === '0') ?
    0 : this.configService.get('app_token_expire_time');
    this.isUnlimitedToken.next(tokenExpireTime);
  }


  /** GET: get application from the server */
  getAppList(
    pageSize: number,
    pageIndex: number): Observable<{amount: number, result: TrustApp[]}> {
    let params = new HttpParams();
    params = params.append('pageSize', pageSize + '');
    params = params.append('pageIndex', pageIndex + '');
    return this.http
    .get<any>(this.appUrl, { params: params })
    .pipe(
      map(this.errorService.handleSuccess),
      catchError(this.errorService.handleError)
    );
  }

  /** GET: get application for cluster from the server */
  getAppsForCluster(): Observable<Array<{ appId: number, appName: string }>> {
    return this.http
    .get<any>(this.appUrl)
    .pipe(
      map(resp => {
        if (resp.errorCode !== undefined) {
          if (resp.errorCode === 0) {
            const data = resp.data;
            const apps = data.result.map(a => {
              return { appId: a.appId, appName: a.appName };
            });
            return apps;
          } else {
            const res =  this.translate.get('Message.error.noErrorMsg');
            const errorContext = new ErrorContext(resp.errorCode, ( resp.errorMessage || res));
            errorContext.status = resp.status || undefined;
            throw errorContext;
          }
        } else {
          const res =  this.translate.get('Message.error.noErrorMsg');
          const errorContext = new ErrorContext(-1, res);
          errorContext.status = resp.status || undefined;
          throw errorContext;
        }
      }),
      catchError(this.errorService.handleError)
    );
  }

  /** GET: get Application by Id from the server */
  getAppInfo(appId: number): Observable<TrustApp> {
    const url = `${this.appUrl}/${appId}`;
    return this.http
    .get<any>(url)
    .pipe(
      map(this.errorService.handleSuccess),
      catchError(this.errorService.handleError)
    );
  }

  /** GET: get Application Permission List from the server */
  getAppPermsList(): Observable<{amount: number, result: TrustAppPerms[]}> {
    let params = new HttpParams();
    params = params.append('type', 'api');
    return this.http
    .get<any>(this.appPermsUrl, { params: params })
    .pipe(
      map(this.errorService.handleSuccess),
      catchError(this.errorService.handleError)
    );
  }

  /** GET: get Application Permission List from the server */
  getAppPerms(appId: number): Observable<{amount: number, result: TrustAppPerms[]}> {
    const url = `${this.appPermsUrl}/${appId}`;
    return this.http
    .get<any>(url)
    .pipe(
      map(this.errorService.handleSuccess),
      catchError(this.errorService.handleError)
    );
  }

  /** GET: get Application Agents List from the server */
  getAppAgentList(appId: number): Observable<{amount: number, result: TrustAppAgent[]}> {
    const url = `${this.appUrl}/${appId}/key`;
    let params = new HttpParams();
    params = params.append('appId', String(appId));
    return this.http
    .get<any>(this.agentUrl, { params: params })
    .pipe(
      map(this.errorService.handleSuccess),
      catchError(this.errorService.handleError)
    );
  }

  /** GET: get Application token List from the server */
  getAppTokenList(appId: number): Observable<{amount: number, result: TrustAppToken[]}> {
    const url = `${this.tokenUrl}/${appId}`;
    return this.http
    .get<TrustAppToken[]>(url)
    .pipe(
      map(this.errorService.handleSuccess),
      catchError(this.errorService.handleError)
    );
  }

  /** GET: get Application token List from the server */
  getAppExportFile(appId: number): Observable<{exportFile: string}> {
    const url = `${this.appUrl}/${appId}/exportFile`;
    return this.http
    .get<TrustApp>(url)
    .pipe(
      map(this.errorService.handleSuccess),
      catchError(this.errorService.handleError)
    );
  }

  /** GET: get Application API Key */
  getAppKey(appId: number): Observable<TrustApp> {
    const url = `${this.appUrl}/apikey/${appId}`;
    return this.http
    .get<TrustApp>(url)
    .pipe(
      map(this.errorService.handleSuccess),
      catchError(this.errorService.handleError)
    );
  }

  /** POST: add Application */
  addApp(app: TrustApp): Observable<TrustApp> {
    return this.http
    .post<any>(this.appUrl, app, httpOptions)
    .pipe(
      map(this.errorService.handleSuccess),
      catchError(this.errorService.handleError)
    );
  }

  /** POST: import Application */
  importApp(param: {importFile}): Observable<TrustApp> {
    const url = `${this.appUrl}/importFile`;
    return this.http
    .post<any>(url, param, httpOptions)
    .pipe(
      map(this.errorService.handleSuccess),
      catchError(this.errorService.handleError)
    );
  }


  /** POST: add Application Agent */
  addAgent(agent: TrustAppAgent): Observable<TrustAppAgent> {
    return this.http
    .post<any>(this.agentUrl, agent, httpOptions)
    .pipe(
      map(this.errorService.handleSuccess),
      catchError(this.errorService.handleError)
    );
  }

  /** POST: edit Application  */
  editApp(appId: number, app: TrustApp): Observable<TrustAppAgent> {
    const url = `${this.appUrl}/${appId}`;
    return this.http
    .post<any>(url, app, httpOptions)
    .pipe(
      map(this.errorService.handleSuccess),
      catchError(this.errorService.handleError)
    );
  }

  /** POST: edit Application Permission */
  editPermission(app: TrustApp): Observable<TrustAppAgent> {
    const url = `${this.appUrl}/editPermission`;
    return this.http
    .post<any>(url, app, httpOptions)
    .pipe(
      map(this.errorService.handleSuccess),
      catchError(this.errorService.handleError)
    );
  }

  /** DELETE: delete application by application id from the server */
  deleteApp(appId: number[]): Observable<any> {
    const url = `${this.appUrl}/status`;
    const delParam = {
      data : appId,
      op : 'delete'
    };
    return this.http.post<any>(url, delParam, httpOptions).pipe(
      map(this.errorService.handleSuccess),
      catchError(this.errorService.handleError)
    );
  }

  /** POST: delete agents by agentId from the server */
  deleteAgent(agentId: TrustAppAgent[]): Observable<any> {
    const url = `${this.agentUrl}/status`;
    const delParam = {
      data : agentId,
      op : 'delete'
    };
    return this.http.post<any>(url, delParam, httpOptions).pipe(
      map(this.errorService.handleSuccess),
      catchError(this.errorService.handleError)
    );
  }

  /** POST: delete tokens by agentId from the server */
  deleteToken(tokenId: TrustAppToken[]): Observable<any> {
    const url = `${this.tokenUrl}/status`;
    const delParam = {
      tokenIds : tokenId,
      op : 'delete'
    };
    return this.http.post<any>(url, delParam, httpOptions).pipe(
      map(this.errorService.handleSuccess),
      catchError(this.errorService.handleError)
    );
  }

}
