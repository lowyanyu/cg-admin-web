import { SelectOption } from '@shared/models/select-option.model';

export class Setting {
  subClass: number;
  setId: number;
  setName: string;
  defaultValue: string;
  originValue: string;
  hasExtra: number;
  setType: number;
  setValue: string;
  hidden: number;
  setOrder: number;
  setOption: { [key: string]: string | number | any[] | boolean | SelectOption[]};

  constructor(setName: string, setValue: string) {
    this.setName = setName;
    this.setValue = setValue;
  }

}
