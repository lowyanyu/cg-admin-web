import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgConfigService } from '@cg/ng-config';
import { ErrorService, ErrorContext } from '@cg/ng-errorhandler';
import { LocalizationService } from '@cg/ng-localization';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SelectOption } from '@shared/models/select-option.model';

@Injectable()
export class FormControlService {

  private coreUrl = '';
  constructor(
    private configService: NgConfigService,
    private errorService: ErrorService,
    private http: HttpClient,
    private translate: LocalizationService
  ) {
    this.coreUrl = this.configService.get('coreUrl');
  }

  /** GET: get select option list from the server */
  getSelectOptionList(param: string, loadLable: string, loadValue: string): Observable<{result: SelectOption[]}> {
    const url =  `${this.coreUrl}management/controlItem/fontSettings`;
    return this.http
      .get<any>(url)
      .pipe(
        map(resp => {
          if (resp.errorCode !== undefined) {
            if (resp.errorCode === 0) {
              const data = resp.data;
              if (data.amount > 0) {
                const rst = data.result;
                const result = data.result.map(r => {
                  const d = r.fontSettings;
                  return new SelectOption(r.fontSettingsName.toString(), r.fontSettingsId.toString());
                });

                return {result: result};
              } else {
                return {result: []};
              }

            } else {
              const errorContext = new ErrorContext(resp.errorCode, ( resp.errorMessage || this.translate.get('Message.error.noErrorMsg')));
              errorContext.status = resp.status || undefined;
              throw errorContext;
            }
          } else {
            const errorContext = new ErrorContext(-1, this.translate.get('Message.error.noErrorMsg'));
            errorContext.status = resp.status || undefined;
            throw errorContext;
          }
        }),
        catchError(this.errorService.handleError)
      );
  }

}
