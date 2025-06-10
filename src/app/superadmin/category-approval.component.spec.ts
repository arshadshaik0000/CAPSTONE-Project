import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryApprovalComponent } from './category-approval.component';

describe('CategoryApprovalComponent', () => {
  let component: CategoryApprovalComponent;
  let fixture: ComponentFixture<CategoryApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
