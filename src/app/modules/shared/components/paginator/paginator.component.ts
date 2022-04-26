import { Component, EventEmitter, Input, OnInit, Output, AfterViewInit } from '@angular/core';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { LocalizationService } from '@cg/ng-localization';
import { PageChangeEvent } from '@shared/models/page-change-event.model';

@Component({
  selector: 'cg-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent implements OnInit, AfterViewInit {

  @Input() total: number;
  @Input() pagination: PageChangeEvent;

  @Output() pageChange = new EventEmitter<PageChangeEvent>();

  constructor(
    private matPaginatorIntl: MatPaginatorIntl,
    private translate: LocalizationService
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
  }

  ngAfterViewInit(): void {
    this.matPaginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
      if (length === 0 || pageSize === 0) {
        return this.translate.get('general.pageCount', {startIndex: 0, endIndex: 0, total: 0});
      }

      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
      return this.translate.get('general.pageCount', {startIndex: (startIndex + 1), endIndex: endIndex, total: length});
    };

    this.matPaginatorIntl.itemsPerPageLabel =  this.translate.get('general.perPage');
    this.matPaginatorIntl.nextPageLabel =  this.translate.get('general.previousPage');
    this.matPaginatorIntl.previousPageLabel =  this.translate.get('general.nextPage');
    this.matPaginatorIntl.firstPageLabel = this.translate.get('general.firstPage');
    this.matPaginatorIntl.lastPageLabel = this.translate.get('general.lastPage');
  }

  changePage(event: PageEvent): void {
    this.pageChange.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize
    })
  }

}
