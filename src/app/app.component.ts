import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { LocalizationService } from '@cg/ng-localization';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BreadcrumbService } from './services/breadcrumb.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'cg-admin-web';

  routerSubscription: Subscription;

  constructor(
    private breadCrumbService: BreadcrumbService,
    private translate: LocalizationService,
    private router: Router,
  ) {
    this.translate.setDefaultLang('zh-TW');
  }

  ngOnInit() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      this.breadCrumbService.setRouterChange(true);
    });
  }

}
