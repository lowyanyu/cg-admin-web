import { Component, OnInit, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { LocalizationService } from '@cg/ng-localization';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from '@shared/services/message.service';
import { forkJoin, Observable } from 'rxjs';
import { Role } from '@role/models/role.model';
import { RolePermission } from '@role/models/role-permission.model';
import { RoleService } from '@role/services/role.service';

@Component({
  selector: 'app-role-edit',
  templateUrl: './role-edit.component.html',
  styleUrls: ['./role-edit.component.scss']
})
export class RoleEditComponent implements OnInit {
  editForm: FormGroup;
  errorMsg = '';
  roleId: number;
  role: Role;

  permissionList: RolePermission[] = [];
  permissionClasses: string[] = [];
  permissionMap: Map<string, RolePermission[]>;
  defaultMap: Map<string, any> = new Map();
  defaultPermissions: RolePermission[];

  innerWidth: any;
  flexOption = new FormControl();

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private roleService: RoleService,
    private router: Router,
    private location: Location,
    private translate: LocalizationService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      roleName: ['', Validators.required],
      desc: ['']
    });
  }

  ngOnInit(): void {
    this.onResize('resize');
    this.roleId = +this.route.snapshot.paramMap.get('roleId');

    if (this.roleId && this.roleId !== undefined) {
      this.requestDataFromMultipleSources().subscribe(
        res => {
          const data1 = res[0];
          const data = data1.result;

          this.role = res[1];
          this.editForm.patchValue(this.role);

          this.permissionList = data;
          this.permissionList.map(p => {
            const sameCount = this.permissionClasses.filter(pClass => pClass === p.permissionClass);
            if (sameCount.length === 0) {
              this.permissionClasses.push(p.permissionClass);
            }
            this.getDefaultPermissions(p);
          });
          this.buildForm();
        },
        error => {
          let res;
          if (error.status < 500) {
            res =  this.translate.get('Message.error.getRole', {name: this.role.roleName, errorMsg: error.errorMessage});
          } else {
            res =  this.translate.get('Message.error.serverErrorMsg');
          }
          this.messageService.add({content: res, level: 'error'});
          this.router.navigate(['/management/system/role']);
        }
      );
    }
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
      this.editForm.addControl(pc, new FormControl([]));
    });
    this.permissionClasses.forEach(pc => {
      const sameClassPermissions = this.role.permissions.filter(p => p.permissionClass === pc);
      this.editForm.controls[pc].patchValue(sameClassPermissions, { onlySelf: true });
    });
  }

  requestDataFromMultipleSources(): Observable<any[]> {
    const res1 = this.roleService.getPermissionList('web');
    const res2 = this.roleService.getRole(this.roleId);
    return forkJoin([res1, res2]);
  }

  selectAll(fcn: any): void {
    const selectedControl = this.editForm.controls[fcn];
    const s = this.permissionList.filter(p => p.permissionClass === fcn);
    selectedControl.patchValue(s, { onlySelf: true });
  }

  deselectAll(fcn: any): void {
    const selectedControl = this.editForm.controls[fcn];
    selectedControl.patchValue('');
  }

  isAllSelected(fcn: any): boolean {
    const selectedControl = this.editForm.controls[fcn];
    const selectedNum = selectedControl.value.length;
    const s = this.permissionList.filter(p => p.permissionClass === fcn);
    return selectedNum === s.length;
  }

  hasSelected(fcn: any): boolean {
    const selectedControl = this.editForm.controls[fcn];
    const selectedNum = selectedControl.value != null ? selectedControl.value.length : 1;
    return selectedNum !== 0;
  }

  selectDefault(fcn: any): void {
    const selectedControl = this.editForm.controls[fcn];
    const c = [];
    if (selectedControl.value.length !== 0 && this.defaultMap.has(fcn)) {
      const triggeredPermission = this.defaultMap.get(fcn);
      const complement = selectedControl.value.filter(p => p !== triggeredPermission);
      c.push(triggeredPermission);
      complement.map(e => c.push(e));
      selectedControl.patchValue(c, { onlySelf: true });
    }
  }

  masterToggle(fcn: any): void {
    this.isAllSelected(fcn) ? this.deselectAll(fcn) : this.selectAll(fcn);
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
    if (this.editForm.invalid) {
      return;
    }

    const permissionIds = [];
    this.permissionClasses.forEach(i => {
      if (this.editForm.controls[i].value.length !== 0) {
        this.editForm.controls[i].value.map(p => {
          const perId = -1;
          const pId = {
            permissionId: perId
          };
          pId.permissionId = p.permissionId;
          permissionIds.push(pId);
        });
      }
    });

    const role = new Role({roleName: this.editForm.value.roleName, desc: this.editForm.value.desc});
    role.updatePartical({permissions: permissionIds});
    this.roleService.updateRole(role, this.roleId).subscribe(
      () => {
        const res =  this.translate.get('Message.success.editRole', {name: this.role.roleName});
        this.messageService.add({content: res, level: 'success'});
        this.router.navigate(['/management/system/role/list']);
      },
      error => {
        let res;
        if (error.status < 500) {
          res =  this.translate.get('Message.error.editRole', {name: this.role.roleName, errorMsg: error.errorMessage});
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
