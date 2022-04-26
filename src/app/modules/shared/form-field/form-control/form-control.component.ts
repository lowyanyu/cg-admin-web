import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { LocalizationService } from '@cg/ng-localization';
import { ColorPickerService, Cmyk } from 'ngx-color-picker';
import { FormControlType } from '@shared/enums/form-control-type.enum';
import { Setting } from '@shared/models/setting.model';
import { FormControli18n } from '@shared/models/form-control-i18n.model';
import { SelectOption } from '@shared/models/select-option.model';
import { FormControlService } from '@shared/services/form-control.service';
import { UtilService } from '@shared/services/util.service';

@Component({
  selector: 'app-form-control',
  templateUrl: './form-control.component.html',
  styleUrls: ['./form-control.component.scss']
})
export class FormControlComponent implements OnInit, OnChanges {

  FORM_CONTROL_TYPE = FormControlType;


  @Input() control?: (FormArray | FormControl);
  @Input() option: Setting;
  @Input() value: any;
  @Input() i18n: FormControli18n;
  @Input() reloaded: boolean;

  /** For input text */
  disable = true;
  placeholder: string;

  /** For checkbox */
  checked = false;
  indeterminate = false;
  checkLabelPosition = 'after';
  disabled = false;
  selection = new SelectionModel<any>(true, []);

  /** For select */
  reloadUrl: string;

  /** For radio、checkbox、 select options */
  loadOption: SelectOption[] = [];

  constructor(
    private router: Router,
    private formService: FormControlService,
    private cpService: ColorPickerService,
    private util: UtilService,
    private translate: LocalizationService
  ) { }

  ngOnChanges() {
    this.placeholder = '';
    if (!this.util.isDefined(this.control)) {
      console.log('Error - [Form Control : ' + this.option.setName + ' ] Control is Null. ' +
                    'Please check your input[control] and confirm you have already add FormControl.');
    }

    if (!this.util.isDefined(this.value)) {
      this.value = this.control.value;
      if (!this.util.isDefined(this.value)) {
        console.log('Error - [Form Control : ' + this.option.setName + ' ] Value is Null. Please check your input[vaule] or set control value.');
      }
    }

    if (this.util.isDefined(this.i18n)) {
      this.i18n.label = (this.i18n.label) ? this.i18n.label : '';

      this.i18n.placeholder = (this.i18n.placeholder) ? this.i18n.placeholder : '';

      this.i18n.desc = (this.i18n.desc) ? this.i18n.desc : '';
    }

    if (this.util.isDefined(this.option)) {

      if (this.option.setType === this.FORM_CONTROL_TYPE.RADIO || this.option.setType === this.FORM_CONTROL_TYPE.SELECT) {
        if (typeof this.value !== 'string') {
          console.log('Debug - [Form Control : ' + this.option.setName + ' ] :' + this.value + ' - ' + typeof this.value);
          console.log('Warn - [Form Control : ' + this.option.setName + ' ] value type is not "string". ' +
                        'Radio、Checkbox or Select will not show default value.' +
           'Please change your value to "string" type.');
        }
      }

      /** Input Text PlaceHolder */
      if (this.option.setType === this.FORM_CONTROL_TYPE.INPUT_TEXT || this.option.setType === this.FORM_CONTROL_TYPE.INPUT_PASSWORD
          || this.option.setType === this.FORM_CONTROL_TYPE.TEXTAREA) {
        if (this.util.isDefined(this.i18n)) {
          this.placeholder = (this.util.isDefined(this.option.setOption) && this.util.isDefined(this.option.setOption.placeholder)
                                    && String(this.option.setOption.placeholder).length > 0) ?
                                String(this.option.setOption.placeholder) : this.translate.get(this.i18n.placeholder);
        }
      }


      /** Checkbox */
      if (this.option.setType === this.FORM_CONTROL_TYPE.CHECKBOX) {
        if (typeof this.value !== 'string' && typeof this.value !== 'object') {
          console.log('Debug - [Form Control : ' + this.option.setName + ' ]:' + this.value + ' - ' + typeof this.value);
          console.log('Warn - [Form Control : ' + this.option.setName + ' ] Value type is not "string". ' +
                        'Checkbox will not show default value. Please change your value to "string" or "[]" type.');
        }

        if (this.value.indexOf(',') >= 0) {
          this.value.split(',', this.value.length).forEach(
            (element, index) => {
              (this.control as FormArray).setControl(index, new FormControl(element));
              this.selection.select(element);
          });
        } else if (this.value.length > 0 ) {
          this.value.forEach((v, index) => {
            (this.control as FormArray).setControl(index, new FormControl(v));
            this.selection.select(v);
          });
        } else {
          (this.control as FormArray).setControl(0, new FormControl(this.value));
          this.selection.select(this.value);
        }

      /** Select */
      } else if (this.option.setType === this.FORM_CONTROL_TYPE.SELECT) {

        if (this.option.setOption.type === 'dynamic') {
          console.log('Debug - [Form Control : ' + this.option.setName + ' ] Select option is dynamic.');
          this.reloadUrl = this.option.setOption.url as string;
          this.reload();

        } else {
          this.loadOption = (this.option.setOption.selection as Array<SelectOption>).map(s => {
            return new SelectOption(s.label.toString(), s.value.toString());
          });
        }

        (this.control as FormControl).setValue(this.value, {onlySelf: true});

      /** Else */
      }  else {
        (this.control as FormControl).setValue(String(this.value));
      }

      this.addValidator();

    } else {
      console.log('Error - [Form Control : ' + this.option.setName + ' ] Option is Null. Please check your input[option].');
    }

  }

  ngOnInit() {
  }

  addValidator() {

    if (this.util.isDefined(this.option.setOption)) {
      if (this.option.setType === 0 || this.option.setType === this.FORM_CONTROL_TYPE.INPUT_TEXT ) {
        if ((this.option.setOption.type as string === 'text') ) {

          if ((this.option.setOption.required as boolean) === true) {
            this.control.setValidators([Validators.compose(
              [Validators.required, Validators.minLength( Number(this.option.setOption.min)),
              Validators.maxLength( Number(this.option.setOption.max)) ]
              )]);
          } else {
            this.control.setValidators([Validators.compose(
              [Validators.minLength( Number(this.option.setOption.min)),
              Validators.maxLength( Number(this.option.setOption.max)) ]
              )]);
          }

        } else if ((this.option.setOption.type as string === 'number')) {

          if ((this.option.setOption.required as boolean) === true) {
            this.control.setValidators([Validators.compose(
              [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{1,3})?$'), Validators.min( Number(this.option.setOption.min)),
              Validators.max( Number(this.option.setOption.max)) ]
              )]);
          } else {
            this.control.setValidators([Validators.compose(
              [Validators.pattern('^[0-9]+(.[0-9]{1,3})?$'), Validators.min( Number(this.option.setOption.min)),
              Validators.max( Number(this.option.setOption.max)) ]
              )]);
          }

        } else if ((this.option.setOption.type as string === 'url')) {

          if ((this.option.setOption.required as boolean) === true) {
            this.control.setValidators([Validators.compose(
              [ Validators.required,
                Validators.pattern('/^(((http|https|ftp):\/\/)?([[a-zA-Z0-9]\-\.])+(\.)([[a-zA-Z0-9]]){2,4}([[a-zA-Z0-9]\/+=%&_\.~?\-]*))*$/')]
              )]);
          } else {
            this.control.setValidators([Validators.compose(
              [ Validators.pattern('/^(((http|https|ftp):\/\/)?([[a-zA-Z0-9]\-\.])+(\.)([[a-zA-Z0-9]]){2,4}([[a-zA-Z0-9]\/+=%&_\.~?\-]*))*$/')]
              )]);
          }

        } else if ((this.option.setOption.type as string === 'email')) {

          if ((this.option.setOption.required as boolean) === true) {
            this.control.setValidators([Validators.compose(
              [ Validators.required,
                Validators.email]
              )]);
          } else {
            this.control.setValidators([Validators.compose(
              [ Validators.email ]
              )]);
          }

        }
      }
    }
  }

  onEventLog(event: string, data: any): void {
    console.log(event, data);
    if (event === 'cpSliderDragEnd' || event === 'cpInputChange ') {
      (this.control as FormControl).patchValue(data.color);
    }
    if (event === 'colorPickerClose') {
      (this.control as FormControl).patchValue(data);
    }

  }

  onChangeColorCmyk(color: string): Cmyk {
    const hsva = this.cpService.stringToHsva(color);

    if (hsva) {
      const rgba = this.cpService.hsvaToRgba(hsva);

      return this.cpService.rgbaToCmyk(rgba);
    }

    return new Cmyk(0, 0, 0, 0);
  }

  onChangeColorHex8(color: string): string {
    const hsva = this.cpService.stringToHsva(color, true);


    if (hsva) {
      return this.cpService.outputFormat(hsva, 'rgba', null);
    }

    return '';
  }

  getCheckValue(choose: any) {
    if (this.selection.isSelected(choose)) {
      this.selection.deselect(choose);
      (this.control as FormArray).removeAt(this.control.value.findIndex(c => c === choose));
    } else {
      this.selection.select(choose);
      (this.control as FormArray).push(new FormControl(choose));
    }
  }

  reload(): void {
    console.log('Debug - [Form Control : ' + this.option.setName + ' ] Dynamic reload select option.');
    console.log('Debug - [Form Control : ' + this.option.setName + ' ] Dynamic reload url : ' + this.reloadUrl);
    const loadLable = this.option.setOption.lableField as string;
    const loadValue = this.option.setOption.valueField as string;
    this.formService.getSelectOptionList(this.reloadUrl, loadLable, loadValue).subscribe(
      rst => {
        console.log(rst);
        this.loadOption = rst.result;
        console.log('Debug - [Form Control] Dynamic load option : ', this.loadOption);
      },
      error => {
        this.router.navigate(['/management/error', error]);
      }
    );
  }

}
