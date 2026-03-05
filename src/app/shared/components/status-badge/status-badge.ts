import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  template: `
    <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      [class]="colorClasses()">
      {{ label() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  label = input.required<string>();
  color = input<'green' | 'yellow' | 'red' | 'blue' | 'gray'>('gray');

  colorClasses = computed(() => {
    const map: Record<string, string> = {
      green: 'bg-green-100 text-green-700',
      yellow: 'bg-amber-100 text-amber-700',
      red: 'bg-red-100 text-red-700',
      blue: 'bg-blue-100 text-blue-700',
      gray: 'bg-gray-100 text-gray-600',
    };
    return map[this.color()] ?? map['gray'];
  });
}
