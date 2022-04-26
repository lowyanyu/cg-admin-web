import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorContext } from '@cg/ng-errorhandler';
import { LocalizationService } from '@cg/ng-localization';
import { UserStatus } from '@home/enums/user-status.enum';
import { LoginService } from '@home/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  USER_STATUS = UserStatus;

  loginForm: FormGroup;
  alertMessage = '';
  timeout: any;

  constructor(
    private router: Router,
    private translate: LocalizationService,
    private loginService: LoginService,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      loginAccount: ['', Validators.required],
      loginPwd: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  login(loginValue: any): void {
    this.alertMessage = '';
    if (this.loginForm.invalid) {
      return;
    }

    this.loginService.login(loginValue.loginAccount, loginValue.loginPwd).subscribe(
      rtn => {
        if (rtn.errorCode === this.USER_STATUS.FIRST_TIME_LOGIN) {
          this.alertMessage = this.translate.get('Message.warn.firstLogin');
          this.timeout = setTimeout(() => {
            this.router.navigate(['/management/dashboard']);
          }, 3000);
        } else if (rtn.errorCode === this.USER_STATUS.PWD_VAILD_TIME) {
          this.alertMessage = this.translate.get('Message.warn.passwordExpired');
          this.timeout = setTimeout(() => {
            this.router.navigate(['/management/dashboard']);
          }, 3000);
        } else {
          this.router.navigate(['/management/dashboard']);
        }
      },
      error => {
        const errorContext = error as ErrorContext;
        if (errorContext.errorCode === this.USER_STATUS.LOCKED
                        || errorContext.errorCode === this.USER_STATUS.OVER_ERROR_TIMES) {
          this.alertMessage = errorContext.errorMessage;
        } else {
          this.alertMessage = this.translate.get('general.loginFail');
        }
      }
    );
  }

  clearTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  ngOnDestroy() {
    this.clearTimeout();
  }

}
