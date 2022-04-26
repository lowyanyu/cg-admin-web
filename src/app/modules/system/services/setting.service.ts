import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { NgConfigService } from '@cg/ng-config';
import { ErrorService, ErrorContext } from '@cg/ng-errorhandler';
import { LocalizationService } from '@cg/ng-localization';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Setting } from '@shared/models/setting.model';
import { SuperClass } from '@shared/models/super-class.model';
import { SuperSubClass } from '@shared/models/super-sub-class.model';
import { UtilService } from '@shared/services/util.service';
import { SelectOption } from '@shared/models/select-option.model';
import { ServerResponse } from 'src/app/interfaces/server-resp.interface';
import { SettingDef } from '@system/enums/setting.def.enum';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
};

@Injectable()
export class SettingService {
  SETTINGDEF = SettingDef;
  private settingUrl = '';

  constructor(
    private http: HttpClient,
    private util: UtilService,
    private configService: NgConfigService,
    private translate: LocalizationService,
    private errorService: ErrorService
  ) {
    const coreUrl = this.configService.get('coreUrl');
    this.settingUrl = `${coreUrl}management/setting`;
  }

  // GET: get setting list from the server
  getSettingClassList(): Observable<{result: SuperClass[]}> {
    return this.http
      .get<ServerResponse>(this.settingUrl)
      .pipe(
        map(resp => {
          if (resp.errorCode !== undefined) {
            if (resp.errorCode === 0) {
              const data = resp.data;
              let superClasses = new Array<SuperClass>();
              superClasses = data.result.map(sc => {
                sc.setting = sc.settings.reduce((pre, cur) => {
                  const findSuperClass = pre.findIndex(i => i.subClass === cur.subClass);
                  if (findSuperClass === -1) {
                    pre.push(new SuperSubClass({
                      subClass: cur.subClass,
                      settings: [cur]
                    }));
                    return pre;
                  }

                  pre[findSuperClass].settings.push(cur);
                  return pre;
                }, Array<SuperSubClass>());
                return new SuperClass({superClass: sc.superClass, subClasses: sc.setting});
              });
              superClasses = superClasses.filter(sc => sc.superClass !== 10);
              superClasses.forEach(superClass => {
                superClass.subClasses.forEach(sub => {
                  sub.settings.sort((a, b) => {
                    return a.setOrder - b.setOrder;
                  });
                  sub.settings.forEach(s => {
                    s.originValue = s.setValue;
                    s.hasExtra = this.SETTINGDEF.HASEXTRA_NO;
                    if (this.util.isDefined(s.setOption)) {
                      if (this.util.isDefined(s.setOption.selection) && this.util.isArray(s.setOption.selection)) {
                        (s.setOption.selection as Array<SelectOption>).forEach(sel => {
                          if (this.util.isDefined(sel.ext)) {
                            s.hasExtra = this.SETTINGDEF.HASEXTRA_YES;
                          }
                        });
                      }
                    }
                  });
                });
                superClass.subClasses.sort((a, b) => {
                  return a.subClass - b.subClass;
                });
              });
              return {result: superClasses};
            } else {
              throw ({errorCode: resp.errorCode, errorMsg: resp.errorMessage});
            }
          } else {
            const res =  this.translate.get('Message.error.noErrorMsg');
            const errorContext = new ErrorContext(-1, res);
            throw errorContext;
          }
        }),
        catchError(this.errorService.handleError)
      );
  }

  // POST: update the setting on the server
  updateSettings(settingList: Setting[]): Observable<any> {
    return this.http
    .post<ServerResponse>(this.settingUrl, settingList, httpOptions)
    .pipe(
      map(this.errorService.handleSuccess),
      catchError(this.errorService.handleError)
    );
  }
}
