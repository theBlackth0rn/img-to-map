import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Editor2New } from './editor2-new';

describe('Editor2New', () => {
  let component: Editor2New;
  let fixture: ComponentFixture<Editor2New>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Editor2New]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Editor2New);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
