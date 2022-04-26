import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { NgConfigService } from '@cg/ng-config';
import { NgAuthService } from '@cg/ng-auth';
import { ErrorService } from '@cg/ng-errorhandler';
import { NgCryptoService } from '@cg/ng-crypto';
import { catchError, map } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
};

@Injectable()
export class LoginService {

  loginUrl = '';
  refreshUrl = '';

  constructor(
    private authService: NgAuthService,
    private errorService: ErrorService,
    private cgcrypto: NgCryptoService,
    private configService: NgConfigService,
  ) {
    const coreUrl = this.configService.get('coreUrl');
    this.loginUrl = `${coreUrl}management/login`;
    this.refreshUrl = `${coreUrl}management/refresh`;
  }

  login(account: string, pwd: string) {
    const credential = {account: account, pwd: this.cgcrypto.sha256(pwd)};
    return this.authService.login(this.loginUrl, this.refreshUrl, credential).pipe(
      map(resp => {
        return resp;
      }),
      catchError(this.errorService.handleError)
    );
  }
}
