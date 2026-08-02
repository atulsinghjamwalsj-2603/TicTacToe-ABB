import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Cell } from './cell';

describe('Cell', () => {
  let component: Cell;
  let fixture: ComponentFixture<Cell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cell],
    }).compileComponents();

    fixture = TestBed.createComponent(Cell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render empty when value is null', async () => {
    fixture.componentRef.setInput('value', null);
    await fixture.whenStable();
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button.cell'))
      .nativeElement as HTMLButtonElement;

    expect(button.textContent?.trim()).toBe('');
    expect(button.disabled).toBe(false);
  });

  it('should emit cellClick when an empty cell is clicked', async () => {
    fixture.componentRef.setInput('value', null);
    await fixture.whenStable();
    fixture.detectChanges();

    const emitSpy = vi.fn();
    component.cellClick.subscribe(emitSpy);

    const button = fixture.debugElement.query(By.css('button.cell'))
      .nativeElement as HTMLButtonElement;

    button.click();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('should be disabled and not emit cellClick when already filled', async () => {
    fixture.componentRef.setInput('value', 'X');
    await fixture.whenStable();
    fixture.detectChanges();

    const emitSpy = vi.fn();
    component.cellClick.subscribe(emitSpy);

    const button = fixture.debugElement.query(By.css('button.cell'))
      .nativeElement as HTMLButtonElement;

    expect(button.disabled).toBe(true);

    button.click();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should apply the correct class for X and O', async () => {
    fixture.componentRef.setInput('value', 'X');
    await fixture.whenStable();
    fixture.detectChanges();

    let button = fixture.debugElement.query(By.css('button.cell'))
      .nativeElement as HTMLButtonElement;

    expect(button.classList.contains('x')).toBe(true);
    expect(button.classList.contains('o')).toBe(false);

    fixture.componentRef.setInput('value', 'O');
    await fixture.whenStable();
    fixture.detectChanges();

    button = fixture.debugElement.query(By.css('button.cell'))
      .nativeElement as HTMLButtonElement;

    expect(button.classList.contains('o')).toBe(true);
    expect(button.classList.contains('x')).toBe(false);
  });

  it('should apply the winner class when highlight is true', async () => {
    fixture.componentRef.setInput('value', 'X');
    fixture.componentRef.setInput('highlight', true);

    await fixture.whenStable();
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button.cell'))
      .nativeElement as HTMLButtonElement;

    expect(button.classList.contains('winner')).toBe(true);
  });
});