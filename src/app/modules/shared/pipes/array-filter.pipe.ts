import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrayfilter',
  pure: false
})
export class MyFilterPipe implements PipeTransform {
  transform(items: any[], filter: any): any {
    if (!items || !filter) {
      return items;
    }
    return items.filter(item => item.permissionClass.indexOf(filter) !== -1 && item.permissionClass === filter);
  }
}
