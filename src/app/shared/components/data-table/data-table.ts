import { Component, input, output, signal, computed } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-data-table',
  template: `
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              @for (col of columns(); track col.key) {
                <th
                  class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  [class.cursor-pointer]="col.sortable"
                  [class.text-left]="col.align !== 'center' && col.align !== 'right'"
                  [class.text-center]="col.align === 'center'"
                  [class.text-right]="col.align === 'right'"
                  [style.width]="col.width"
                  (click)="col.sortable && toggleSort(col.key)">
                  <span class="inline-flex items-center gap-1">
                    {{ col.label }}
                    @if (col.sortable && sortKey() === col.key) {
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        @if (sortDir() === 'asc') {
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        } @else {
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        }
                      </svg>
                    }
                  </span>
                </th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <ng-content />
          </tbody>
        </table>
      </div>
      @if (rows().length === 0) {
        <div class="p-8 text-center text-gray-400">
          <p class="text-sm">{{ emptyMessage() }}</p>
        </div>
      }
    </div>
  `,
})
export class DataTableComponent {
  columns = input.required<TableColumn[]>();
  rows = input<any[]>([]);
  emptyMessage = input('No data available');

  sortKey = signal<string>('');
  sortDir = signal<'asc' | 'desc'>('asc');

  sortChange = output<{ key: string; dir: 'asc' | 'desc' }>();

  toggleSort(key: string): void {
    if (this.sortKey() === key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
    this.sortChange.emit({ key: this.sortKey(), dir: this.sortDir() });
  }
}
