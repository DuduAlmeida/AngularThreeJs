import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebxrApplicationComponent } from './webxr-application.component';

describe('WebxrApplicationComponent', () => {
  let component: WebxrApplicationComponent;
  let fixture: ComponentFixture<WebxrApplicationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebxrApplicationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebxrApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
