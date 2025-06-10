import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskApprovalComponent } from './task-approval.component';

describe('TaskApprovalComponent', () => {
  let component: TaskApprovalComponent;
  let fixture: ComponentFixture<TaskApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
