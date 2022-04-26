import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LocalizationService } from '@cg/ng-localization';
import { MessageService } from '@shared/services/message.service';
import { UtilService } from '@shared/services/util.service';
import { ServiceLog } from '@log/models/service-log.model';
import { ServiceLogService } from '@log/services/service-log.service';

@Component({
  selector: 'app-service-log-detail-dialog',
  templateUrl: './service-log-detail-dialog.component.html',
  styleUrls: ['./service-log-detail-dialog.component.scss']
})
export class ServiceLogDetailDialogComponent implements OnInit {

  serviceLogData: ServiceLog;

  constructor(
    public dialogRef: MatDialogRef<ServiceLogDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number,
    private messageService: MessageService,
    private translate: LocalizationService,
    private util: UtilService,
    private serviceLogService: ServiceLogService,
  ) { }

  ngOnInit() {
    if (!this.util.isDefined(this.data)) {
      const res =  this.translate.get('Message.error.serverErrorMsg');
      this.messageService.add({content: res, level: 'error'});
      this.dialogRef.close();
    } else {
      this.getServiceLogData();
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  getServiceLogData(): void {
    this.serviceLogService.getServicesLog(this.data)
    .subscribe(
      rst => {
        this.serviceLogData = rst;
      },
      error => {
        const res =  this.translate.get('Message.error.serverErrorMsg');
        this.messageService.add({content: res, level: 'error'});
        this.dialogRef.close();
      }
    );
  }

}
