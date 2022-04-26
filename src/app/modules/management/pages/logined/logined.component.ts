import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { ManagementPermission } from '@shared/enums/management-permission.enum';
import { Observable } from 'rxjs';
import { CgSidenavOpenState } from '@management/enums/cg-sidenav.enum';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-logined',
  templateUrl: './logined.component.html',
  styleUrls: ['./logined.component.scss']
})
export class LoginedComponent implements OnInit {
  MANAGEMENT_PERMISSION: typeof ManagementPermission = ManagementPermission;

  CGSIDENAV_OPEN_STATE: typeof CgSidenavOpenState = CgSidenavOpenState;
  cgSidenavOpenState = this.CGSIDENAV_OPEN_STATE.MAX;

  isHandset: Observable<BreakpointState> = this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]);
  uiVersion: string;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.uiVersion = environment.version;
  }

  ngOnInit(): void {
    // this.isHandset.subscribe(data => {
    //   !data.matches ? this.cgSidenavOpenState = this.CGSIDENAV_OPEN_STATE.MAX :
    //      this.cgSidenavOpenState = this.CGSIDENAV_OPEN_STATE.MINI;
    // });
  }

  toggleSidenav(): void {
    if (this.cgSidenavOpenState === this.CGSIDENAV_OPEN_STATE.MAX) {
      this.cgSidenavOpenState = this.CGSIDENAV_OPEN_STATE.MINI;
    } else {
      this.cgSidenavOpenState = this.CGSIDENAV_OPEN_STATE.MAX;
    }
  }
}
