import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgConfigService } from '@cg/ng-config';
import { NgCryptoService } from '@cg/ng-crypto';
import { LocalizationService } from '@cg/ng-localization';
import { CgValidators } from '@cg/ng-validator';
import { RadioValue } from '@shared/enums/radio-value.enum';
import { MessageService } from '@shared/services/message.service';
import { UtilService } from '@shared/services/util.service';
import { User } from '@user/models/user.model';
import { UserService } from '@user/services/user.service';

@Component({
  selector: 'app-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.scss']
})
export class UserAddComponent implements OnInit, AfterContentChecked {
  RADIO_VALUE_TYPE = RadioValue;

  addForm: FormGroup;
  errorMsg = '';
  roles: Array<{ roleId: number, roleName: string }>;
  hide = true;
  hide2 = true;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private location: Location,
    private router: Router,
    private translate: LocalizationService,
    private messageService: MessageService,
    private configService: NgConfigService,
    private util: UtilService,
    private cgcrypto: NgCryptoService
  ) {
    this.addForm = this.fb.group({
      userAccount: ['', Validators.required],
      userName: ['', Validators.required],
      userPwd: ['', Validators.required],
      certainPwd: [''],
      email: ['', Validators.email],
      phone: [''],
      desc: [''],
      roles: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.addForm.controls.userPwd.setValidators(this.userService.getPwdRuleControl(this.addForm.controls.userName));
    this.addForm.controls.certainPwd.setValidators(
      Validators.compose([Validators.required, CgValidators.equalTo(this.addForm.controls.userPwd)]));
    this.getRoleList();
  }

  ngAfterContentChecked() {
    if (this.addForm.controls.userPwd.hasError('minlength') || this.addForm.controls.userPwd.hasError('maxlength')) {
      this.errorMsg = this.translate.get('Message.warn.password',
                        {min: this.configService.get('pwd_min_length'), max: this.configService.get('pwd_max_length')});
    }
    if (this.util.isDefined(this.addForm.controls.userPwd.errors)) {
      if (this.addForm.controls.userPwd.errors.pattern) {
        this.errorMsg = this.translate.get('Message.warn.pwd_not_allow_chinese_and_space');
      }
      if (this.addForm.controls.userPwd.errors.alphaNumeric) {
        this.errorMsg = this.translate.get('Message.warn.pwd_must_be_alphanumeric');
      }
      if (this.addForm.controls.userPwd.errors.notEqualTo) {
        this.errorMsg = this.translate.get('Message.warn.pwd_not_allow_as_same_as_account');
      }
      if (this.addForm.controls.userPwd.errors.limitFullwidth) {
        this.errorMsg = this.translate.get('Message.warn.pwd_not_allow_fullwidth');
      }
      if (this.addForm.controls.userPwd.errors.limitSymbol) {
        this.errorMsg = this.translate.get('Message.warn.pwd_not_allow_special_symbol', {symbol: '<>\'";'});
      }
      if (this.addForm.controls.userPwd.errors.limitConAlphaNumeric) {
        this.errorMsg = this.translate.get('Message.warn.pwd_not_allow_continous_char', {max: this.configService.get('pwd_non_continuous_char')});
      }
      if (this.addForm.controls.userPwd.errors.limitRepcontAlphaNumeric) {
        this.errorMsg = this.translate.get('Message.warn.pwd_not_allow_repeat_and_continous_char', {max: this.configService.get('pwd_non_repeat_char')});
      }
    }
  }

  goBack(): void {
    this.location.back();
  }

  submit() {
    if (this.addForm.invalid) {
      return;
    }

    const user = new User ({userAccount: this.addForm.value.userAccount, userPwd: this.cgcrypto.sha256(this.addForm.value.userPwd),
      userName: this.addForm.value.userName, email: this.addForm.value.email, phone: this.addForm.value.phone,
      roles: [this.addForm.value.roles], desc: this.addForm.value.desc});

    this.userService.addUser(user).subscribe(
      () => {
        const res =  this.translate.get('Message.success.addAccount', {name: user.userName});
        this.messageService.add({content: res, level: 'success'});
        this.router.navigate(['/management/system/user/list']);
      },
      error => {
        let res;
        if (error.status < 500) {
          res =  this.translate.get('Message.error.addAccount', {name: user.userName, errorMsg: error.errorMessage});
          this.messageService.add({content: res, level: 'error'});
        } else {
          res =  this.translate.get('Message.error.serverErrorMsg');
          this.messageService.add({content: res, level: 'error'});
          this.router.navigate(['/management/system/user/list']);
        }
      }
    );
  }

  getRoleList(): void {
    this.userService.getRoleList().subscribe(
      rst => {
        this.roles = rst;
      },
      error => {
        const res =  this.translate.get('Message.error.serverErrorMsg');
        this.messageService.add({content: res, level: 'error'});
        this.roles = [];
      }
    );
  }

}
