import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieListCardComponent } from './movie-list-card.component';

describe('MovieListCardComponent', () => {
  let component: MovieListCardComponent;
  let fixture: ComponentFixture<MovieListCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MovieListCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieListCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
