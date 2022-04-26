import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LocalizationService } from '@cg/ng-localization';
import { FormControlType } from '@shared/enums/form-control-type.enum';
import { RadioValue } from '@shared/enums/radio-value.enum';
import { SelectOption } from '@shared/models/select-option.model';
import { SuperClass } from '@shared/models/super-class.model';
import { Setting } from '@shared/models/setting.model';
import { UtilService } from '@shared/services/util.service';
import { MessageService } from '@shared/services/message.service';
import { SettingDef } from '@system/enums/setting.def.enum';
import { SettingService } from '@system/services/setting.service';

@Component({
  selector: 'app-setting-list',
  templateUrl: './setting-list.component.html',
  styleUrls: ['./setting-list.component.scss']
})
export class SettingListComponent implements OnInit {

  FORM_CONTROL_TYPE = FormControlType;
  SETTINGDEF = SettingDef;
  RADIO_VALUE = RadioValue;

  allSettingClass: SuperClass[];

  updateForm: FormGroup;

  constructor(
    private router: Router,
    private messageService: MessageService,
    private settingService: SettingService,
    private translate: LocalizationService,
    private fb: FormBuilder,
    private util: UtilService
  ) {
    this.updateForm = this.fb.group({});
  }

  ngOnInit() {
    this.getSettingList();
  }

  getSettingList() {
    this.settingService.getSettingClassList().subscribe(
      rst => {
        console.log(rst.result);
        this.allSettingClass = rst.result.map(superClass => {
          superClass.subClasses = superClass.subClasses.map(sub => {

            sub.settings = sub.settings.filter(s => !s.hidden);
            if (this.util.isDefined(sub.settings) && sub.settings.length > 0) {

              sub.settings = sub.settings.map(s => {
                let extraForm;
                if (s.hasExtra === this.SETTINGDEF.HASEXTRA_NO) {
                  this.updateForm.addControl(s.setName, new FormControl([s.setValue]));
                }
                if (s.hasExtra === this.SETTINGDEF.HASEXTRA_YES) {
                  extraForm = this.fb.group({});
                  this.updateForm.addControl(s.setName, extraForm);
                  if (this.util.isDefined(s.setOption)) {
                    if (this.util.isDefined(s.setOption.selection) && this.util.isArray(s.setOption.selection)) {
                      s.setOption.selection = (s.setOption.selection as Array<SelectOption>).map(sel => {
                        if (this.util.isDefined(sel.ext)) {
                          if (s.setType === this.FORM_CONTROL_TYPE.RADIO) {
                            const radioValue = JSON.parse(s.setValue).selected;
                            extraForm.addControl(s.setName + '_' + s.setType, new FormControl([]));
                            extraForm.controls[s.setName + '_' + s.setType].setValue(radioValue);

                            // hasExtra && setType === Input text
                            if (sel.ext.setType === this.FORM_CONTROL_TYPE.INPUT_TEXT) {
                              extraForm.addControl(sel.ext.setName, new FormControl([]));
                              const inputValue = JSON.parse(s.setValue).value;
                              extraForm.controls[sel.ext.setName].setValue(inputValue);

                              switch (sel.ext.setOption.type) {
                                case 'number' :
                                  extraForm.controls[sel.ext.setName].setValidators([Validators.compose(
                                    [Validators.pattern('^[0-9]+(.[0-9]{1,3})?$'), Validators.min( Number(sel.ext.setOption.min)),
                                    Validators.max( Number(sel.ext.setOption.max)) ]
                                    )]);
                                  break;
                              }
                            // setType === Select
                            } else if (sel.ext.setType === this.FORM_CONTROL_TYPE.SELECT) {
                              extraForm.addControl(sel.ext.setName, new FormControl([]));
                              const inputValue = JSON.parse(s.setValue).value;
                              extraForm.controls[sel.ext.setName].setValue(inputValue);
                            }

                          }
                        }
                        return sel;
                      });
                    }
                  }
                }
                return s;
              });
            }
            return sub;
          }).filter(sub => sub.settings.length > 0);
          return superClass;
        }).filter(sc => sc.subClasses.length > 0);
      },
      error => {
        const res =  this.translate.get('Message.error.serverErrorMsg');
        this.messageService.add({content: res, level: 'error'});
        this.router.navigate(['/management/error', error]);
      }
    );
  }

  isReadOnly(optionName: string, controlName: string): boolean {
    const selected = (this.updateForm.controls[optionName] as FormGroup).controls[controlName].value;
    return selected === this.RADIO_VALUE.USED;
  }

  hasError(optionName: string, controlName: string, errorName: string): boolean {
    return (this.updateForm.controls[optionName] as FormGroup).controls[controlName].hasError(errorName);
  }

  save() {
    this.updateForm.markAllAsTouched();
    if (!this.updateForm.valid) {
      return;
    }
    let updateOptions = new Array<Setting>();
    const updateValue = this.updateForm.value;
    this.allSettingClass.forEach(sc => {
      sc.subClasses.forEach(sub => {
        sub.settings.forEach(s => {
          if (s.hasExtra) {
            let uValue;
            if (this.util.isDefined(s.setOption)) {
              if (this.util.isDefined(s.setOption.selection) && this.util.isArray(s.setOption.selection)) {
                (s.setOption.selection as Array<SelectOption>).forEach(sel => {
                  if (this.util.isDefined(sel.ext)) {
                    uValue = (this.updateForm.controls[s.setName] as FormGroup).controls[sel.ext.setName].value;
                    console.log(uValue);
                    s.hasExtra = this.SETTINGDEF.HASEXTRA_YES;
                  }
                });
              }
            }
            const uSelected = (this.updateForm.controls[s.setName] as FormGroup).controls[s.setName + '_' + s.setType].value;
            updateValue[s.setName] = JSON.stringify({selected: uSelected, value: uValue});
          }
        });

        const us = sub.settings.filter(s => s.originValue !== updateValue[s.setName]).map(s => {
          return new Setting(s.setName, updateValue[s.setName]);
        });
        updateOptions = updateOptions.concat(us);
      });
    });
    if (updateOptions.length > 0) {
      this.settingService.updateSettings(updateOptions).subscribe(
        () => {
          const res =  this.translate.get('Message.success.editSetting');
          this.messageService.add({content: res, level: 'success'});
          this.getSettingList();
        },
        error => {
          let res;
          if (error.status < 500) {
            res =  this.translate.get('Message.error.editSetting', {errorMsg: error.errorMessage});
          } else {
            res =  this.translate.get('Message.error.serverErrorMsg');
          }
          this.messageService.add({content: res, level: 'error'});
          this.getSettingList();
        }
      );
    } else {
      const res =  this.translate.get('Message.notify.noChange');
      this.messageService.add({content: res, level: 'success'});
    }
  }
}
