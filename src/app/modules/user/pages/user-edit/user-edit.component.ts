import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgConfigService } from '@cg/ng-config';
import { NgCryptoService } from '@cg/ng-crypto';
import { LocalizationService } from '@cg/ng-localization';
import { CgValidators } from '@cg/ng-validator';
import { forkJoin } from 'rxjs';
import { MessageService } from '@shared/services/message.service';
import { UtilService } from '@shared/services/util.service';
import { User } from '@user/models/user.model';
import { UserService } from '@user/services/user.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit, AfterContentChecked {
  editForm: FormGroup;
  userId: number;
  mode: string;
  disabled: boolean;
  user: User;
  defRole: { roleId: number, roleName: string };
  roles: Array<{ roleId: number, roleName: string }>;
  hide = true;
  hide2 = true;

  errorMsg = '';

  constructor(
    private configService: NgConfigService,
    private messageService: MessageService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    private util: UtilService,
    private translate: LocalizationService,
    private cgcrypto: NgCryptoService
  ) {
    this.editForm = this.fb.group({
      userAccount: ['', Validators.required],
      userName: ['', Validators.required],
      userPwd: [''],
      certainPwd: [''],
      email: ['', Validators.email],
      phone: [''],
      desc: [''],
      roles: [Validators.required]
    });
  }

  ngOnInit(): void {
    this.editForm.controls.userPwd.setValidators(this.userService.getPwdRuleControl(this.editForm.controls.userName));
    this.editForm.controls.certainPwd.setValidators(
      Validators.compose([CgValidators.equalTo(this.editForm.controls.userPwd)]));

    this.userId = +this.route.snapshot.paramMap.get('userId');
    this.mode = this.route.snapshot.paramMap.get('mode');

    // if (this.mode === 'info') {
    //   this.disabled = true;
    // }

    if (this.userId && this.userId !== undefined) {
      const userData = forkJoin([
        this.userService.getUser(this.userId),
        this.userService.getRoleList()
      ]);
      userData.subscribe(
        data => {
          this.user = data[0];
          this.roles = data[1];
          this.defRole = this.roles.find(r => (this.user.roles[0].roleId === r.roleId));
          this.editForm.patchValue(this.user);
          this.editForm.controls.roles.patchValue(this.defRole);
          if (this.user.userId === this.userId) {
            this.disabled = true;
          }
        },
        error => {
          let res;
          if (error.status < 500) {
            res =  this.translate.get('Message.error.getAccount', {name: this.user.userName, errorMsg: error.errorMessage});
          } else {
            res =  this.translate.get('Message.error.serverErrorMsg');
          }
          this.messageService.add({content: res, level: 'error'});
        }
      );
    }
  }

  ngAfterContentChecked() {
    if (this.editForm.controls.userPwd.hasError('minlength') || this.editForm.controls.userPwd.hasError('maxlength')) {
      this.errorMsg = this.translate.get('Message.warn.password',
                        {min: this.configService.get('pwd_min_length'), max: this.configService.get('pwd_max_length')});
    }
    if (this.util.isDefined(this.editForm.controls.userPwd.errors)) {
      if (this.editForm.controls.userPwd.errors.pattern) {
        this.errorMsg = this.translate.get('Message.warn.pwd_not_allow_chinese_and_space');
      }
      if (this.editForm.controls.userPwd.errors.alphaNumeric) {
        this.errorMsg = this.translate.get('Message.warn.pwd_must_be_alphanumeric');
      }
      if (this.editForm.controls.userPwd.errors.notEqualTo) {
        this.errorMsg = this.translate.get('Message.warn.pwd_not_allow_as_same_as_account');
      }
      if (this.editForm.controls.userPwd.errors.limitFullwidth) {
        this.errorMsg = this.translate.get('Message.warn.pwd_not_allow_fullwidth');
      }
      if (this.editForm.controls.userPwd.errors.limitSymbol) {
        this.errorMsg = this.translate.get('Message.warn.pwd_not_allow_special_symbol', {symbol: '<>\'";'});
      }
      if (this.editForm.controls.userPwd.errors.limitConAlphaNumeric) {
        this.errorMsg = this.translate.get('Message.warn.pwd_not_allow_continous_char', {max: this.configService.get('pwd_non_continuous_char')});
      }
      if (this.editForm.controls.userPwd.errors.limitRepcontAlphaNumeric) {
        this.errorMsg = this.translate.get('Message.warn.pwd_not_allow_repeat_and_continous_char', {max: this.configService.get('pwd_non_repeat_char')});
      }
    }
  }

  goBack(): void {
    this.location.back();
  }

  submit() {
    if (this.editForm.invalid) {
      return;
    }

    const user = new User({userAccount: this.editForm.value.userAccount,
      userName: this.editForm.value.userName, email: this.editForm.value.email, phone: this.editForm.value.phone,
      desc: this.editForm.value.desc, roles: [this.editForm.value.roles]});

    if (this.editForm.value.userPwd.length > 0) {
      user.updatePartical({userPwd: this.cgcrypto.sha256(this.editForm.value.userPwd)});
    }

    this.userService.updateUser(user, this.userId).subscribe(
      () => {
        const res =  this.translate.get('Message.success.editAccount', {name: user.userName});
        this.messageService.add({content: res, level: 'success'});
        if (this.mode === 'edit') {
          this.router.navigate(['/management/system/user/list']);
        } else if (this.mode === 'info') {
          this.goBack();
        }
      },
      error => {
        let res;
        if (error.status < 500) {
          res =  this.translate.get('Message.error.editAccount', {name: user.userName, errorMsg: error.errorMessage});
          this.messageService.add({content: res, level: 'error'});
        } else {
          res =  this.translate.get('Message.error.serverErrorMsg');
          this.messageService.add({content: res, level: 'error'});
          this.router.navigate(['/management/system/user/list']);
        }
      }
    );
  }
}
