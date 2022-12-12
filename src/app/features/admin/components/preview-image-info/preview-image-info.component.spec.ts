import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewImageInfoComponent } from './preview-image-info.component';

describe('PreviewImageInfoComponent', () => {
  let component: PreviewImageInfoComponent;
  let fixture: ComponentFixture<PreviewImageInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewImageInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewImageInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
