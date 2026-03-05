import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-avatar',
  template: `
    @if (imageUrl()) {
      <img [src]="imageUrl()" [alt]="name()" class="rounded-full object-cover" [class]="sizeClass()" />
    } @else {
      <div class="rounded-full flex items-center justify-center font-semibold text-white" [class]="sizeClass() + ' ' + bgClass()">
        {{ initials() }}
      </div>
    }
  `,
})
export class AvatarComponent {
  name = input.required<string>();
  imageUrl = input<string>();
  size = input<'sm' | 'md' | 'lg'>('md');
  bgClass = input('bg-accent-500');

  initials = computed(() => {
    return this.name().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  });

  sizeClass = computed(() => {
    const map = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };
    return map[this.size()];
  });
}
