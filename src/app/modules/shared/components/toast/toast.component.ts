import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { Message } from '@shared/models/message.model';
import { MessageService } from '@shared/services/message.service';

@Component({
  selector: 'cg-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, OnDestroy {

  @Input() position = 'bottom-right';

  messageSubscription: Subscription;

  messages: Message[];

  constructor(public messageService: MessageService) { }

  ngOnInit() {
    this.messageSubscription = this.messageService.messageObserver.subscribe(messages => {
      if (messages) {
        if (messages instanceof Array) {
          this.messages = this.messages ? [...this.messages, ...messages] : [...messages];
        } else {
          this.messages = this.messages ? [...this.messages, ...[messages]] : [messages];
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
  }

  onMessageClose(event) {
    this.messages.splice(event.index, 1);
  }

}
