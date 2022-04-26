import { Injectable } from '@angular/core';

@Injectable()
export class UtilService {

  constructor() { }

  isDefined(value: any): boolean {
    return typeof value !== 'undefined' && value !== null;
  }

  isArray(item: any): boolean {
    return (item && typeof item === 'object' && Array.isArray(item));
  }
}
