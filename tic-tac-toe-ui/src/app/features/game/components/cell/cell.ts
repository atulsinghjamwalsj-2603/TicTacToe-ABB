import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-cell',
  standalone: true,
  imports: [CommonModule],
  template: `
<button
  class="cell"
  [class.winner]="isWinner"
  [disabled]="value"
  [ngClass]="{
    'x': value === 'X',
    'o': value === 'O'
  }"
  (click)="onClick()">
  {{ value }}
</button>
  `,
  styles: [`
 .cell {
  width: 100px;
  height: 100px;
  font-size: 42px;
  font-weight: bold;
  border: none;
  border-radius: 10px;

  background: rgba(255,255,255,0.15);
  color: white;

  cursor: pointer;
  transition: all 0.25s ease;
}

.cell:hover {
  background: rgba(255,255,255,0.25);
  transform: scale(1.08);
}

.cell:active {
  transform: scale(0.95);
}
  .cell.x {
  color: #ff4d4d;
  text-shadow: 0 0 12px #ff4d4d;
}

.cell.o {
  color: #4da6ff;
  text-shadow: 0 0 12px #4da6ff;
}
.cell.winner {
  background: #00ffcc;
  color: black;
  box-shadow: 0 0 15px #00ffcc;
}
`]
})
export class Cell {
  @Input() value: 'X' | 'O' | null = null;
  @Output() cellClick = new EventEmitter<void>();
  @Input() isWinner = false;
  onClick() {
    this.cellClick.emit();
  }
}