import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleDelDialogComponent } from './role-del-dialog.component';

describe('RoleDelDialogComponent', () => {
  let component: RoleDelDialogComponent;
  let fixture: ComponentFixture<RoleDelDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoleDelDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleDelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
