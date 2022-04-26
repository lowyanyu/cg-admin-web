import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router, ActivatedRoute } from '@angular/router';
import { ErrorContext } from '@cg/ng-errorhandler';
import { LocalizationService } from '@cg/ng-localization';
import { ManagementPermission } from '@shared/enums/management-permission.enum';
import { MessageService } from '@shared/services/message.service';
import { TrustApp } from '@trustApp/models/trust-app.model';
import { APP_TYPE } from '@trustApp/enums/trust-app-type.enum';
import { TrustAppService } from '@trustApp/services/trust-app.service';

@Component({
  selector: 'app-trust-app-info',
  templateUrl: './trust-app-info.component.html',
  styleUrls: ['./trust-app-info.component.scss']
})
export class TrustAppInfoComponent implements OnInit {

  MANAGEMENT_PERMISSION: typeof ManagementPermission = ManagementPermission;
  APP_TYPE: typeof APP_TYPE = APP_TYPE;

  appId: number;
  application: TrustApp;

  chooseTab: string;

  constructor(
    private dialog: MatDialog,
    private messageService: MessageService,
    private translate: LocalizationService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private appService: TrustAppService

  ) { }

  ngOnInit() {
    this.appService.getAppTokenSetting();
    this.appId = +this.route.snapshot.paramMap.get('appId');
    if (this.appId !== undefined && this.appId !== 0) {
      this.getAppInfo();
      this.chooseTab = 'agent';
    }

  }

  getAppInfo(): void {
    this.appService.getAppInfo(this.appId).subscribe(
      rst => {
        this.application = rst;
      },
      error => {
        const err  = error as ErrorContext;
        if (err.status < 500) {
          const res =  this.translate.get('Message.error.getApplication', {name: this.application.appName, errorMsg: error.errorMessage});
          this.messageService.add({content: res, level: 'error'});
        } else {
          const res =  this.translate.get('Message.error.serverErrorMsg');
          this.messageService.add({content: res, level: 'error'});
          this.router.navigate(['/management/system/trustApp/list']);
        }
      }
    );
  }

  refresh(): void {
    this.getAppInfo();
  }

  goBack(): void {
    this.location.back();
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.chooseTab = tabChangeEvent.tab.ariaLabel;
  }
}
