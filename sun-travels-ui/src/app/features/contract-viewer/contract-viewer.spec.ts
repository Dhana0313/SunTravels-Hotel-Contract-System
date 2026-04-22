import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractViewer } from './contract-viewer';

describe('ContractViewer', () => {
  let component: ContractViewer;
  let fixture: ComponentFixture<ContractViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractViewer],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
