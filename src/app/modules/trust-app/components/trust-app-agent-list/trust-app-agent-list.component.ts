import { Component, OnInit, Input, ViewChild, OnChanges } from '@angular/core';
import { FormGroupDirective, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ErrorContext } from '@cg/ng-errorhandler';
import { LocalizationService } from '@cg/ng-localization';
import { ManagementPermission } from '@shared/enums/management-permission.enum';
import { MessageService } from '@shared/services/message.service';
import { TrustAppAgent } from '@trustApp/models/trust-app-agent.model';
import { TrustAppAgentDelDialogComponent } from '@trustApp/components/trust-app-agent-del-dialog/trust-app-agent-del-dialog.component';
import { TrustAppService } from '@trustApp/services/trust-app.service';

@Component({
  selector: 'app-trust-app-agent-list',
  templateUrl: './trust-app-agent-list.component.html',
  styleUrls: ['./trust-app-agent-list.component.scss']
})
export class TrustAppAgentListComponent implements OnInit, OnChanges {

  MANAGEMENT_PERMISSION: typeof ManagementPermission = ManagementPermission;

  @Input() appId: number;

  @ViewChild('formDirective', {static: false}) formDirective: FormGroupDirective;

  addForm: FormGroup;
  dataSource: MatTableDataSource<TrustAppAgent> = new MatTableDataSource<TrustAppAgent>();
  displayedColumns: string[] = ['ip', 'desc', 'action'];


  constructor(
    private dialog: MatDialog,
    private translate: LocalizationService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private appService: TrustAppService
  ) {
    const ipPattern =
    '^([0-9]{1,3}|[*])[.]([0-9]{1,3}|[*])[.]([0-9]{1,3}|[*])[.]([0-9]{1,3}|[*])$';
    this.addForm = this.fb.group({
      appId: [Validators.required],
      agentIp: ['', [Validators.required, Validators.pattern(ipPattern)]],
      desc : ['']
    });
  }

  ngOnChanges() {
    if (this.formDirective !== undefined) {
      this.addForm.reset();
      this.formDirective.resetForm();
    }
    this.getAgentList();
  }

  ngOnInit() {
  }


  submit(): void {

    if (this.addForm.invalid) {
      return;
    }

    if (this.appId !== undefined) {
      this.addForm.controls.appId.patchValue(this.appId);
    } else {
      return;
    }

    const agent = new TrustAppAgent(this.addForm.value);
    this.appService.addAgent(agent)
    .subscribe(
      rst => {
        const res =  this.translate.get('Message.success.addApplication', {name: agent.agentIp});
        this.messageService.add({content: res, level: 'success'});
        this.getAgentList();
      },
      error => {
        let res;
        if (error.status < 500) {
          res =  this.translate.get('Message.error.addApplication', {name: agent.agentIp, errorMsg: error.errorMessage});
        } else {
          res =  this.translate.get('Message.error.serverErrorMsg');
        }
        this.messageService.add({content: res, level: 'error'});
      },
      () => {
        this.addForm.reset();
        this.formDirective.resetForm();
      }
    );
  }

  getAgentList(): void {
    this.appService.getAppAgentList(this.appId).subscribe(
      rst => {
        this.dataSource.data = rst.result;
      },
      error => {
        let res;
        if (error.status < 500) {
          res =  this.translate.get('Message.error.getApplicationAgents', {errorMsg: error.errorMessage});
        } else {
          res =  this.translate.get('Message.error.serverErrorMsg');
        }
        this.messageService.add({content: res, level: 'error'});
      }
    );
  }

  openDelDialog(element: TrustAppAgent): void {
    element.appId = this.appId;
    const dialogRef = this.dialog.open(TrustAppAgentDelDialogComponent, {
      width: '500px',
      data: [element]
    });
    dialogRef.afterClosed().subscribe(resp => {
      const errorContext = resp as ErrorContext;
      if (errorContext !== undefined) {
        if (errorContext.errorCode === 0) {
          this.getAgentList();
        }
      }
    });
  }


}
