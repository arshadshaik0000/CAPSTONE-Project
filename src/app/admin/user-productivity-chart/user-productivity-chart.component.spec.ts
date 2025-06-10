// src/app/admin/user-productivity-chart/user-productivity.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserProductivityChartComponent } from './user-productivity-chart.component';


describe('UserProductivityComponent', () => {
  let component: UserProductivityChartComponent;
  let fixture: ComponentFixture<UserProductivityChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,   // ⬅ enables TaskService without hitting the network
        UserProductivityChartComponent  // ⬅ standalone component under test
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserProductivityChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
