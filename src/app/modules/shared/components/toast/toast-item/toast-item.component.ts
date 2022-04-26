import { Component, OnInit, AfterViewInit, EventEmitter, Input, Output } from '@angular/core';
import { Message } from '@shared/models/message.model';

@Component({
  selector: 'cg-toast-item',
  templateUrl: './toast-item.component.html',
  styleUrls: ['./toast-item.component.scss']
})
export class ToastItemComponent implements OnInit, AfterViewInit {

  @Input() message: Message;

  @Input() index: number;

  @Output() onclose: EventEmitter<any> = new EventEmitter();

  timeout: any;

  constructor() {}

  ngOnInit() {
    console.log('toast item message: ' + this.message);
  }

  ngAfterViewInit() {
   this.initTimeout();
  }

  initTimeout() {
    this.timeout = setTimeout(() => {
        this.onclose.emit({
          index: this.index,
          message: this.message
        });
    }, this.message.timeout || 3000);
  }

  onCloseIconClick(event) {
    this.clearTimeout();
    this.onclose.emit({
        index: this.index,
        message: this.message
    });
    event.preventDefault();
  }

  clearTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

}
