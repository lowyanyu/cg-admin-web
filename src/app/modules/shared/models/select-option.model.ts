import { Setting } from '@shared/models/setting.model';

export class SelectOption {
  label: string;
  value: string;
  ext: Setting;
  constructor(setLabel: string, setValue: string) {
    this.label = setLabel;
    this.value = setValue;
  }
}
