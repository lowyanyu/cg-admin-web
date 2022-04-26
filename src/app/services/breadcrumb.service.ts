import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class BreadcrumbService {

  isRouterChange = new BehaviorSubject<boolean>(false);

  constructor() { }

  public setRouterChange(isRouterChange: boolean) {
    this.isRouterChange.next(isRouterChange);
  }

}

