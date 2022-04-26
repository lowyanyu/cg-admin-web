import { Component, OnInit, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { LocalizationService } from '@cg/ng-localization';
import { MessageService } from '@shared/services/message.service';
import { RolePermission } from '@role/models/role-permission.model';
import { Role } from '@role/models/role.model';
import { RoleService } from '@role/services/role.service';

@Component({
  selector: 'app-role-add',
  templateUrl: './role-add.component.html',
  styleUrls: ['./role-add.component.scss']
})
export class RoleAddComponent implements OnInit {
  addForm: FormGroup;
  errorMsg = '';
  permissionList: RolePermission[] = [];
  permissionClasses: string[] = [];
  defaultMap: Map<string, any> = new Map();
  flexOption = new FormControl();

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private roleService: RoleService,
    private location: Location,
    private translate: LocalizationService,
    private router: Router
  ) {
    this.addForm = this.fb.group({
      roleName: ['', Validators.required],
      desc: ['']
    });
  }

  ngOnInit(): void {
    this.onResize('resize');
    this.getPermissionList();
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event) {
    const innerWidth = window.innerWidth;
    this.flexOption.setValue(this.roleService.getFlexItemWidth(innerWidth));
  }

  goBack(): void {
    this.location.back();
  }

  buildForm(): void {
    this.permissionClasses.forEach(pc => {
      this.addForm.addControl(pc, new FormControl([]));
    });
  }

  selectAll(fcn: any): void {
    const selectedControl = this.addForm.controls[fcn];
    const s = this.permissionList.filter(p => p.permissionClass === fcn);
    selectedControl.patchValue(s, {onlySelf: true});
  }

  deselectAll(fcn: any): void {
    const selectedControl = this.addForm.controls[fcn];
    selectedControl.patchValue('');
  }

  isAllSelected(fcn: any): boolean {
    const selectedControl = this.addForm.controls[fcn];
    const selectedNum = selectedControl.value.length;
    const s = this.permissionList.filter(p => p.permissionClass === fcn);
    return selectedNum === s.length;
  }

  hasSelected(fcn: any): boolean {
    const selectedControl = this.addForm.controls[fcn];
    const selectedNum = selectedControl.value.length;
    return selectedNum > 0;
  }

  selectDefault(fcn: any) {
    const selectedControl = this.addForm.controls[fcn];
    const c  = [];
    if (selectedControl.value.length !== 0 && this.defaultMap.has(fcn)) {
      const triggeredPermission = this.defaultMap.get(fcn);
      const complement = selectedControl.value.filter(p => p !== triggeredPermission);
      c.push(triggeredPermission);
      complement.map(e => c.push(e));
      selectedControl.patchValue(c, {onlySelf: true});
    }
  }

  masterToggle(fcn: any) {
    this.isAllSelected(fcn) ? this.deselectAll(fcn) :  this.selectAll(fcn);
  }

  getPermissionList(): void {
    this.roleService.getPermissionList('web').subscribe(
      data => {
        this.permissionList = data.result;
        this.permissionList.map(p => {
          const intersection = this.permissionClasses.filter(pClass => pClass === p.permissionClass);
          if (intersection.length === 0) {
            this.permissionClasses.push(p.permissionClass);
          }
          this.getDefaultPermissions(p);
        });
        this.buildForm();
      },
      error => {
        const res =  this.translate.get('Message.error.serverErrorMsg');
        this.messageService.add({content: res, level: 'error'});
      }
    );
  }

  getDefaultPermissions(p: RolePermission): void {
    if (p.permissionName.match('Search')) {
      if (p.permissionName.match('ServiceLog') || p.permissionName.match('ManagerLog') || p.permissionName.match('DebugLog')) {
        return;
      } else {
        this.defaultMap.set(p.permissionClass, p);
      }
    }
  }

  submit() {
    if (this.addForm.invalid) {
      return;
    }

    const permissionIds = [];
    this.permissionClasses.forEach(i => {
      this.addForm.controls[i].value.map(p => {
        const perId = -1;
        const pId = {
          permissionId : perId
        };
        pId.permissionId = p.permissionId;
        permissionIds.push(pId);
        });
    });

    const role = new Role({roleName: this.addForm.value.roleName, desc: this.addForm.value.desc});
    role.updatePartical({permissions: permissionIds});

    this.roleService.addRole(role).subscribe(
      () => {
        const res =  this.translate.get('Message.success.addRole', {name: role.roleName});
        this.messageService.add({content: res, level: 'success'});
        this.router.navigate(['/management/system/role/list']);
      },
      error => {
        let res;
        if (error.status < 500) {
          res =  this.translate.get('Message.error.addRole', {name: role.roleName, errorMsg: error.errorMessage});
          this.messageService.add({content: res, level: 'error'});
        } else {
          res =  this.translate.get('Message.error.serverErrorMsg');
          this.messageService.add({content: res, level: 'error'});
          this.router.navigate(['/management/system/role/list']);
        }
      }
    );
  }

  compareWith(p: RolePermission, sp: RolePermission): boolean {
    return p && sp ? p.permissionId === sp.permissionId : p === sp;
  }
}
