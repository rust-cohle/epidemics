import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CannonBallComponent } from './cannon-ball.component';

describe('CannonBallComponent', () => {
  let component: CannonBallComponent;
  let fixture: ComponentFixture<CannonBallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CannonBallComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CannonBallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
