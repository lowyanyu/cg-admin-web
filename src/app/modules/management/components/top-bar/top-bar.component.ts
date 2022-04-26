import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, PRIMARY_OUTLET } from '@angular/router';
import { NgAuthService } from '@cg/ng-auth';
import { LocalizationService } from '@cg/ng-localization';
import { UtilService } from '@shared/services/util.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { Breadcrumb } from '@management/models/breadcrumb.model';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit {
  public title: string;
  public breadcrumbs: Breadcrumb[];

  userId: number;
  userName: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private util: UtilService,
    private breadCrumbService: BreadcrumbService,
    private authService: NgAuthService,
    private translate: LocalizationService,
  ) {
    this.userName = this.authService.getPrincipal().getProperty('userName');
    this.userId = this.authService.getPrincipal().getProperty('userId');
  }

  ngOnInit(): void {
    const isRouterChange = this.breadCrumbService.isRouterChange.subscribe(rst => {
      const root: ActivatedRoute = this.activatedRoute.root;
      this.title = null;
      this.breadcrumbs = this.getBreadcrumbs(root);
    });
  }

  private getBreadcrumbs(route: ActivatedRoute, url: string = '/management', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const ROUTE_DATA_BREADCRUMB = 'title' ;
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      if (child.outlet !== PRIMARY_OUTLET) {
        continue;
      }

      if (!child.snapshot.data.hasOwnProperty(ROUTE_DATA_BREADCRUMB)) {
        return this.getBreadcrumbs(child, url, breadcrumbs);
      }

      if (this.util.isDefined(child.snapshot.data[ROUTE_DATA_BREADCRUMB])) {
        // this.title = child.snapshot.data[ROUTE_DATA_BREADCRUMB];
        this.title = this.translate.get(child.snapshot.data[ROUTE_DATA_BREADCRUMB]);
      }

      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');

      url += `/${routeURL}`;

      const breadcrumb: Breadcrumb = {
        label: this.title,
        params: child.snapshot.params,
        url: `${url}`
      };
      breadcrumbs.push(breadcrumb);
      return this.getBreadcrumbs(child, url, breadcrumbs);
    }
    return breadcrumbs;
  }

  editCurrentUser() {
    this.router.navigate(['/management/system/user/info', {userId: this.userId, mode: 'info'}]);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/home/login']);
      }
    })
  }
}
