import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.css'],
})
export class ConfirmModalComponent {
  @Input() message: string = 'Are you sure?';
  @Input() modalId: string = 'confirmModal';
  @Output() onConfirm = new EventEmitter<void>();

  confirm() {
    this.onConfirm.emit();
    const modal = document.getElementById(this.modalId);
    if (modal) (modal as any).classList.remove('show');
  }
}
