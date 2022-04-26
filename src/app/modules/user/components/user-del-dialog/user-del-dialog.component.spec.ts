import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDelDialogComponent } from './user-del-dialog.component';

describe('UserDelDialogComponent', () => {
  let component: UserDelDialogComponent;
  let fixture: ComponentFixture<UserDelDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserDelDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
