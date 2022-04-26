import { Injectable } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';
import { Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { NgConfigService } from '@cg/ng-config';
import { ErrorService } from '@cg/ng-errorhandler';
import { CgValidators } from '@cg/ng-validator';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { ServerResponse } from 'src/app/interfaces/server-resp.interface';
import { RadioValue } from '@shared/enums/radio-value.enum';
import { UtilService } from '@shared/services/util.service';
import { User } from '@user/models/user.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
};

@Injectable()
export class UserService {
  RADIO_VALUE_TYPE = RadioValue;

  private userUrl = '';
  private metaDataUrl = '';

  constructor(
    private http: HttpClient,
    private configService: NgConfigService,
    private errorService: ErrorService,
    private util: UtilService
  ) {
    const coreUrl = this.configService.get('coreUrl');
    this.userUrl = `${coreUrl}management/user`;
    this.metaDataUrl = `${coreUrl}management/metadata/role`;
  }

  getPwdRuleControl(userName: AbstractControl): ValidatorFn[] {
    let pwdRule: ValidatorFn[] = [Validators.pattern('[^\u4e00-\u9fa5|\\s]*$')];
    if (this.util.isDefined(this.configService.get('pwd_min_length'))) {
      pwdRule = [...pwdRule, ...[Validators.minLength( Number(this.configService.get('pwd_min_length')))]];
    }
    if (this.util.isDefined(this.configService.get('pwd_max_length'))) {
      pwdRule = [...pwdRule, ...[Validators.maxLength( Number(this.configService.get('pwd_max_length')))]];
    }
    if (this.util.isDefined(this.configService.get('pwd_allow_same_account'))
      && this.configService.get('pwd_allow_same_account') === String(this.RADIO_VALUE_TYPE.USED)) {
      pwdRule = [...pwdRule, ...[CgValidators.notEqualTo(userName)]];
    }
    if (this.util.isDefined(this.configService.get('pwd_allow_alphanumeric'))
        && this.configService.get('pwd_allow_alphanumeric') === String(this.RADIO_VALUE_TYPE.USED)) {
      pwdRule = [...pwdRule, ...[CgValidators.alphaNumeric]];
    }
    console.log(this.configService.get('pwd_allow_fulltype'));
    if (this.util.isDefined(this.configService.get('pwd_allow_fulltype'))
        && this.configService.get('pwd_allow_fulltype') === String(this.RADIO_VALUE_TYPE.USED)) {
      pwdRule = [...pwdRule, ...[CgValidators.limitFullwidth]];
    }
    if (this.util.isDefined(this.configService.get('pwd_limit_special_symbol'))
        && this.configService.get('pwd_limit_special_symbol') === String(this.RADIO_VALUE_TYPE.USED)) {
      pwdRule = [...pwdRule, ...[CgValidators.limitSymbol]];
    }
    if (this.util.isDefined(this.configService.get('pwd_non_repeat_char'))
        && this.configService.get('pwd_non_repeat_char') > 0) {
      pwdRule = [...pwdRule, ...[CgValidators.limitRepcontAlphaNumeric(Number(this.configService.get('pwd_non_repeat_char')))]];
    }
    if (this.util.isDefined(this.configService.get('pwd_non_continuous_char'))
        && this.configService.get('pwd_non_continuous_char') > 0) {
      pwdRule = [...pwdRule, ...[CgValidators.limitContAlphaNumeric(Number(this.configService.get('pwd_non_continuous_char')))]];
    }
    console.log(pwdRule);
    return pwdRule;
  }

  getUserPageList(
      pageSize: number,
      pageIndex: number): Observable<{amount: number, result: User[]}> {
    let params = new HttpParams();
    params = params.append('pageSize', pageSize + '');
    params = params.append('pageIndex', pageIndex + '');
    return this.http
      .get<any>(this.userUrl, { params: params })
      .pipe(
        map(this.errorService.handleSuccess),
        catchError(this.errorService.handleError)
      );
  }

  getRoleList(): Observable<any> {
    return this.http
        .get<ServerResponse>
        (`${this.metaDataUrl}`, {responseType: 'json'} )
        .pipe(
          map(resp => {
            if (resp.errorCode === 0) {
              return resp.data.result;
            } else {
              throw ({errorCode: resp.errorCode, errorMsg: resp.errorMessage});
            }
          }),
          catchError(this.errorService.handleError)
        );
  }

  addUser(user: User): Observable<any> {
    return this.http
        .post<ServerResponse>
        (`${this.userUrl}`, user, httpOptions)
        .pipe(
          map(this.errorService.handleSuccess),
          catchError(this.errorService.handleError)
        );
  }

  getUser(userId: number): Observable<User> {
    const url = `${this.userUrl}/${userId}`;
    return this.http
        .get<ServerResponse>(url)
        .pipe(
          map(this.errorService.handleSuccess),
          catchError(this.errorService.handleError)
        );
  }

  updateUser(user: User, userId: number): Observable<any> {
    const url = `${this.userUrl}/${userId}`;
    return this.http
        .post<ServerResponse>
        (url, user, httpOptions)
        .pipe(
          map(this.errorService.handleSuccess),
          catchError(this.errorService.handleError)
        );
  }

  delUser(userId: number[]): Observable<any> {
    const url = `${this.userUrl}/status`;
    const delParam = {
      data: userId,
      op: 'delete'
    };
    return this.http.post<ServerResponse>
        (url, delParam, httpOptions).pipe(
          map(this.errorService.handleSuccess),
          catchError(this.errorService.handleError)
        );
  }

}
