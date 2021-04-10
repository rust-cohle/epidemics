import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollisionOneDComponent } from './collision-one-d.component';

describe('CollisionOneDComponent', () => {
  let component: CollisionOneDComponent;
  let fixture: ComponentFixture<CollisionOneDComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollisionOneDComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollisionOneDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
