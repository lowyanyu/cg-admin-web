import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LocalizationService } from '@cg/ng-localization';
import { MessageService } from '@shared/services/message.service';
import { TrustAppService } from '@trustApp/services/trust-app.service';

@Component({
  selector: 'app-trust-app-apikey-dl-dialog',
  templateUrl: './trust-app-apikey-dl-dialog.component.html',
  styleUrls: ['./trust-app-apikey-dl-dialog.component.scss']
})
export class TrustAppApikeyDlDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<TrustAppApikeyDlDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public appId: number,
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
    this.appService.getAppKey(this.appId)
      .subscribe(
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

          this.dialogRef.close();
        },
        error => {
          let res;
          if (error.status < 500) {
            res =  this.translate.get('Message.error.updateAPIKey', {errorMsg: error.errorMessage});
          } else {
            res =  this.translate.get('Message.error.serverErrorMsg');
          }
          this.messageService.add({content: res, level: 'error'});
        }
      );
  }
}
