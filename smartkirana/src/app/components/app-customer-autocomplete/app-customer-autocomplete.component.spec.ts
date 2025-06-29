import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppCustomerAutocompleteComponent } from './app-customer-autocomplete.component';

describe('AppCustomerAutocompleteComponent', () => {
  let component: AppCustomerAutocompleteComponent;
  let fixture: ComponentFixture<AppCustomerAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppCustomerAutocompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppCustomerAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
