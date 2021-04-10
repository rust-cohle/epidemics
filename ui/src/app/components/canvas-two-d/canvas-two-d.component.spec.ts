import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasTwoDComponent } from './canvas-two-d.component';

describe('CanvasTwoDComponent', () => {
  let component: CanvasTwoDComponent;
  let fixture: ComponentFixture<CanvasTwoDComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CanvasTwoDComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasTwoDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
