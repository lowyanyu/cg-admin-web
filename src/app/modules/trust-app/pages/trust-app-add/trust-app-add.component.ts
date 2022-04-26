import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { LocalizationService } from '@cg/ng-localization';
import { ErrorContext } from '@cg/ng-errorhandler';
import { Subscription } from 'rxjs';
import { ManagementPermission } from '@shared/enums/management-permission.enum';
import { MessageService } from '@shared/services/message.service';
import { APP_TYPE } from '@trustApp/enums/trust-app-type.enum';
import { TrustAppPerms } from '@trustApp/models/trust-app-perms.model';
import { TrustApp } from '@trustApp/models/trust-app.model';
import { TrustAppService } from '@trustApp/services/trust-app.service';

@Component({
  selector: 'app-trust-app-add',
  templateUrl: './trust-app-add.component.html',
  styleUrls: ['./trust-app-add.component.scss']
})
export class TrustAppAddComponent implements OnInit, OnDestroy {

  MANAGEMENT_PERMISSION: typeof ManagementPermission = ManagementPermission;
  APP_TYPE: typeof APP_TYPE = APP_TYPE;

  selectedAppPERMSSubscription: Subscription;
  selectedAppPERMS: TrustAppPerms[];

  addForm: FormGroup;
  isEditable = false;

  newApp: TrustApp;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private appService: TrustAppService,
    private messageService: MessageService,
    private translate: LocalizationService
  ) {
    this.addForm = this.fb.group({
      appName : ['', Validators.required],
      appType : [APP_TYPE.GENERAL, Validators.required],
      desc : ['']
    });
  }

  ngOnInit() {
    this.selectedAppPERMSSubscription = this.appService.selectedAppPERMSObservable.subscribe(
      perms => {
      if (perms) {
        this.selectedAppPERMS = perms;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  submitApp(stepper: MatStepper): void {
    if (this.addForm.invalid) {
      return;
    }
    const app = new TrustApp(this.addForm.value);
    this.appService.addApp(app).subscribe(
      rst => {
        this.newApp = rst;
        const res =  this.translate.get('Message.success.addApplication', {name: app.appName});
        this.messageService.add({content: res, level: 'success'});
        console.log(stepper);
        stepper.next();
      },
      error => {
        console.log(error);
        const errorContext = error as ErrorContext;
        if (errorContext.status < 500) {
          const res =  this.translate.get('Message.error.addApplication', {name: app.appName, errorMsg: error.errorMessage});
          this.messageService.add({content: res, level: 'error'});
        } else {
          const res =  this.translate.get('Message.error.serverErrorMsg');
          this.messageService.add({content: res, level: 'error'});
          this.router.navigate(['/management/system/trustApp/list']);
        }
      }
    );
  }

  submitPerms(stepper: MatStepper): void {
    if (typeof this.selectedAppPERMS !== 'undefined' && this.selectedAppPERMS.length !== 0) {
      const app = new TrustApp({appId: this.newApp.appId, permissions: this.selectedAppPERMS});
      this.appService.editPermission(app)
      .subscribe(
        () => {
          const res =  this.translate.get('Message.success.setApplicationPermission');
          this.messageService.add({content: res, level: 'success'});
          stepper.next();
        },
        error => {
          const errorContext = error as ErrorContext;
          if (errorContext.status < 500) {
            const res =  this.translate.get('Message.error.setApplicationPermission', {errorMsg: error.errorMessage});
            this.messageService.add({content: res, level: 'error'});
          } else {
            const res =  this.translate.get('Message.error.serverErrorMsg');
            this.messageService.add({content: res, level: 'error'});
            this.router.navigate(['/management/system/trustApp/list']);
          }
        }
      );
    } else {
      stepper.next();
    }
  }

  getAppKey(): void {
    this.appService.getAppKey(this.newApp.appId).subscribe(
      rst => {
          let downloadFile = null;
          let link = null;
          const data = new Blob([rst.apiKey], { type: 'text/plain' });
          if (downloadFile !== null) {
            window.URL.revokeObjectURL(downloadFile);
          }
          downloadFile = window.URL.createObjectURL(data);

          if (navigator.appVersion.toString().indexOf('.NET') > 0) {
             // for IE and Edge
            window.navigator.msSaveBlob(data, 'apiKey.pem');
          } else {
              // for modern browsers
              link = document.createElement('a');
              link.setAttribute('download', 'apiKey.pem');
              link.href = downloadFile;
              document.body.appendChild(link);
          }

          window.requestAnimationFrame(() => {
            const event = new MouseEvent('click');
            link.dispatchEvent(event);
            document.body.removeChild(link);
          });

          console.log('Download Api Key');
          if (downloadFile === null) {
            const res =  this.translate.get('Message.error.downloadAPIKey');
            this.messageService.add({content: res, level: 'error'});
          }

      },
      error => {
        let res;
        if (error.status < 500) {
          res =  this.translate.get('Message.error.updateAPIKey', {errorMsg: error.errorMessage});
        } else {
          res =  this.translate.get('Message.error.serverErrorMsg');
        }
        this.messageService.add({content: res, level: 'error'});
        this.router.navigate(['/management/system/trustApp/list']);
      }
    );
  }

  ngOnDestroy(): void {
    this.selectedAppPERMSSubscription.unsubscribe();
  }

}
