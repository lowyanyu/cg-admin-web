import { Setting } from '@shared/models/setting.model';

export class SuperSubClass {
  subClass: number;
  settings: Setting[];

  constructor(init: Partial<SuperSubClass>) {
    Object.assign(this, init);
  }

}
