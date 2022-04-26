import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LocalizationService } from '@cg/ng-localization';
import { MessageService } from '@shared/services/message.service';
import { TrustApp } from '@trustApp/models/trust-app.model';
import { TrustAppService } from '@trustApp/services/trust-app.service';

@Component({
  selector: 'app-trust-app-export-dialog',
  templateUrl: './trust-app-export-dialog.component.html',
  styleUrls: ['./trust-app-export-dialog.component.scss']
})
export class TrustAppExportDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<TrustAppExportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public trustApp: TrustApp,
    private appService: TrustAppService,
    private translate: LocalizationService,
    private messageService: MessageService,
  ) { }

  ngOnInit() {
  }

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.appService.getAppExportFile(this.trustApp.appId)
      .subscribe(
        rst => {
          let downloadFile = null;
          let link = null;
          const data = new Blob([rst.exportFile], { type: 'text/plain' });
          if (downloadFile !== null) {
            window.URL.revokeObjectURL(downloadFile);
          }
          downloadFile = window.URL.createObjectURL(data);

          if (navigator.appVersion.toString().indexOf('.NET') > 0) {
             // for IE and Edge
            window.navigator.msSaveBlob(data, this.trustApp.appName + '.txt');
          } else {
              // for modern browsers
              link = document.createElement('a');
              link.setAttribute('download', this.trustApp.appName + '.txt');
              link.href = downloadFile;
              document.body.appendChild(link);
          }

          window.requestAnimationFrame(() => {
            const event = new MouseEvent('click');
            link.dispatchEvent(event);
            document.body.removeChild(link);
          });

          console.log('Download Trust App File');
          if (downloadFile === null) {
            const res =  this.translate.get('Message.error.exportApplication', {name: this.trustApp.appName});
            this.messageService.add({content: res, level: 'error'});
          }

          this.dialogRef.close();
        },
        error => {
          let res;
          if (error.status < 500) {
            res =  this.translate.get('Message.error.exportApplication', {errorMsg: error.errorMessage});
          } else {
            res =  this.translate.get('Message.error.serverErrorMsg');
          }
          this.messageService.add({content: res, level: 'error'});
        }
      );
    }

}
