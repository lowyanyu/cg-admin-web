import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LocalizationService } from '@cg/ng-localization';
import { BehaviorSubject, timer } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent implements OnInit, OnDestroy {

  seconds$ = new BehaviorSubject<number>(3);
  alertMsg$ = this.seconds$.pipe(
    map(sec => this.translate.get('general.unauthorizedAlert', {sec: sec}))
  );

  timerSeconds$ = timer(1000, 1000).pipe(
    map(idx => 1)
  ).subscribe({
    next: (sec: number) => {
      const s = this.seconds$.value - sec;
      if (s === 0) {
        this.backToLogin();
      } else {
        this.seconds$.next(s);
      }
    }
  })

  constructor(private router: Router, private translate: LocalizationService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.timerSeconds$.unsubscribe();
  }

  backToLogin(): void {
    this.router.navigate(['/home/login']);
  }

}
