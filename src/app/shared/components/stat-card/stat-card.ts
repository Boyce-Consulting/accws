import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  template: `
    <div class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm font-medium text-gray-500">{{ label() }}</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ value() }}</p>
        </div>
        <div class="w-10 h-10 rounded-lg flex items-center justify-center" [class]="iconBgClass()">
          <ng-content select="[icon]" />
        </div>
      </div>
      @if (trend() !== undefined) {
        <div class="mt-3 flex items-center gap-1">
          @if (trend()! > 0) {
            <svg class="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
            <span class="text-sm font-medium text-success">+{{ trend() }}%</span>
          } @else {
            <svg class="w-4 h-4 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.986l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
            </svg>
            <span class="text-sm font-medium text-danger">{{ trend() }}%</span>
          }
          <span class="text-xs text-gray-400">vs last period</span>
        </div>
      }
    </div>
  `,
})
export class StatCardComponent {
  label = input.required<string>();
  value = input.required<string | number>();
  trend = input<number>();
  iconBgClass = input<string>('bg-accent-100 text-accent-600');
}
