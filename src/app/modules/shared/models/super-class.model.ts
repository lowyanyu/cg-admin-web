import { SuperSubClass } from '@shared/models/super-sub-class.model';

export class SuperClass {
  superClass: number;
  subClasses: SuperSubClass[];

  constructor(init: Partial<SuperClass>) {
    Object.assign(this, init);
  }
}
