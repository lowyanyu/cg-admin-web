import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { NgAuthService } from '@cg/ng-auth';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, switchMap, take, filter } from 'rxjs/operators';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {

  private refreshTokenInProgress = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  constructor(private authService: NgAuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // console.log('Refresh Token Progress Init  is Lock : ', this.refreshTokenInProgress);
    if (
      req.url.includes('/management/refresh') ||
      req.url.includes('login')
    ) {
      // refresh and login don't need token
    } else {
      // console.log(this.authService.getPrincipal().getProperty('userName'));
      if (this.authService.authToken) {
        if (this.authService.authToken.accessToken) {
          if (this.authService.authToken.tokenType) {
            req = req.clone({
                setHeaders: {
                    Authorization: `${this.authService.authToken.tokenType} ${this.authService.authToken.accessToken}`
                }
            });
          } else {
            req = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${this.authService.authToken.accessToken}`
                }
            });
          }
        } else {
          // console.log('access token is empty, do logout');
          this.authService.logout();
        }
      } else {
        // console.log('currentUser && authToken is empty, do logout');
        this.authService.logout();
      }
    }
    return next.handle(req).pipe(
      catchError(error => {
        // console.log('AuthenticationInterceptor...', error);
        // Do not need to refresh token api
        if (
            req.url.includes('/management/refresh') ||
            req.url.includes('login')
        ) {
          // Logout and to redirect it to login page when refresh token failed
          if (req.url.includes('refresh')) {
            this.authService.logout();
          }
        }

        // Only handle http status 401
        if (error.status !== 401) {
          return throwError(error);
        }
        // console.log('Rfresh Token Progress is Lock : ', this.refreshTokenInProgress);
        if (this.refreshTokenInProgress) {
          // Someone is refreshing token now, pending request
          return this.refreshTokenSubject.pipe(
            filter(result => result !== null),
            take(1),
            switchMap(() => next.handle(this.addAuthenticationToken(req)))
          );

        } else {
          // console.log('AuthenticationInterceptor Send Refresh Token.....');
          this.refreshTokenInProgress = true;
          // Set the refreshTokenSubject to null so that subsequent API calls will wait until the new token has been retrieved
          this.refreshTokenSubject.next(null);
          return this.authService
              .refreshToken().pipe(
                switchMap(
                  token => {
                    // console.log('Rfresh Token Progress Refresh Token pipe : ', token);
                    this.refreshTokenInProgress = false;
                    this.refreshTokenSubject.next(token);
                    return next.handle(this.addAuthenticationToken(req));
                  }
                ),
                catchError(re => {
                  this.refreshTokenInProgress = false;
                  this.authService.logout();
                  return of(null);
                })
              );
        }
      })
    );
  }

  addAuthenticationToken(req) {
    const accessToken = this.authService.authToken.accessToken;

    // If access token is null this means that user is not logged in
    // And we return the original request
    if (!accessToken) {
        return req;
    }

    // We clone the request, because the original request is immutable
    return req.clone({
        setHeaders: {
          Authorization: `Bearer ${this.authService.authToken.accessToken}`
        }
    });
  }
}
