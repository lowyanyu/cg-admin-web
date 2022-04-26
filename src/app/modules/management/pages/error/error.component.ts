import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-error-page',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  httpStatus = 0;
  errorCode = 0;
  errorMessage = '';

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.httpStatus = +params.get('status');
      this.errorCode = +params.get('errorCode');
      this.errorMessage = params.get('errorMessage');
    });
  }
}
