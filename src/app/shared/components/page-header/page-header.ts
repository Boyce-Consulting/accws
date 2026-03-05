import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl lg:text-2xl font-bold text-gray-900">{{ title() }}</h1>
          @if (subtitle()) {
            <p class="text-sm text-gray-500 mt-1">{{ subtitle() }}</p>
          }
        </div>
        <div class="flex items-center gap-2">
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>();
}
