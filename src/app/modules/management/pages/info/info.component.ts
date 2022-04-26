import { Component, OnInit } from '@angular/core';
import { ServerInfo } from '@system/models/server-info.model';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {
  serverInfo: ServerInfo;

  constructor() { }

  ngOnInit(): void {
  }

}
