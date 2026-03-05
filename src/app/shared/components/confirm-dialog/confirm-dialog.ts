import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="cancelled.emit()">
      <div class="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-semibold text-gray-900">{{ title() }}</h3>
        <p class="text-sm text-gray-500 mt-2">{{ message() }}</p>
        <div class="flex justify-end gap-3 mt-6">
          <button
            (click)="cancelled.emit()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            (click)="confirmed.emit()"
            class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            [class]="variant() === 'danger' ? 'bg-danger hover:bg-red-700' : 'bg-accent-500 hover:bg-accent-600'">
            {{ confirmLabel() }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  title = input('Confirm Action');
  message = input('Are you sure you want to proceed?');
  confirmLabel = input('Confirm');
  variant = input<'default' | 'danger'>('default');

  confirmed = output<void>();
  cancelled = output<void>();
}
