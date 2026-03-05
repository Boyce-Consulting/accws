import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string; // SVG path d attribute
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="fixed left-0 top-0 bottom-0 w-64 bg-primary-800 text-white flex flex-col z-40">
      <!-- Logo -->
      <div class="h-14 flex items-center gap-3 px-5 border-b border-primary-700">
        <div class="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-xs">ACC</span>
        </div>
        <div>
          <div class="font-semibold text-sm leading-tight">ACCWS</div>
          <div class="text-primary-300 text-[10px] leading-tight">Wastewater Solutions</div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-4 px-3">
        <ul class="space-y-1">
          @for (item of navItems; track item.route) {
            <li>
              <a
                [routerLink]="item.route"
                routerLinkActive="bg-primary-700/60 text-white"
                [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-primary-200 hover:bg-primary-700/40 hover:text-white transition-colors">
                <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="item.icon" />
                </svg>
                {{ item.label }}
              </a>
            </li>
          }
        </ul>
      </nav>

      <!-- User section at bottom -->
      <div class="p-4 border-t border-primary-700">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center text-xs font-semibold">
            {{ getInitials() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ auth.currentUser()?.name }}</p>
            <p class="text-xs text-primary-300 truncate">{{ auth.isAdmin() ? 'Administrator' : 'Client' }}</p>
          </div>
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  auth = inject(AuthService);

  private adminNav: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' },
    { label: 'Map', route: '/map', icon: 'M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c-.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z' },
    { label: 'Clients', route: '/clients', icon: 'M18 18.72a9.094 9.094 0 0 0 3.741-2.106 9.093 9.093 0 0 0-3.741-2.106m0 4.212a9.12 9.12 0 0 1-.162-.034m.162.034a9.025 9.025 0 0 1-3.84-.778m3.84.778-1.14-3.422a9.003 9.003 0 0 0-3.18-4.074M18 18.72A9.118 9.118 0 0 0 21 12c0-4.97-4.03-9-9-9s-9 4.03-9 9a9.118 9.118 0 0 0 3 6.72m0 0a9.025 9.025 0 0 0 3.84.778M6 18.72l1.14-3.422a9.003 9.003 0 0 1 3.18-4.074M12 6.75a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5Z' },
    { label: 'Systems', route: '/systems', icon: 'M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.653-4.655m5.976-.814L17.09 8.03c.252-.504.307-1.085.168-1.633a3.776 3.776 0 0 0-.84-1.68L12.2 0 8.065 4.134a3.78 3.78 0 0 0-.84 1.68 1.886 1.886 0 0 0 .168 1.633l2.28 3.764' },
    { label: 'Sampling', route: '/sampling', icon: 'M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5' },
    { label: 'Treatments', route: '/treatments', icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
    { label: 'Products', route: '/products', icon: 'm21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9' },
    { label: 'Proposals', route: '/proposals', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z' },
    { label: 'Reports', route: '/reports', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z' },
    { label: 'Case Studies', route: '/case-studies', icon: 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25' },
  ];

  private clientNav: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' },
    { label: 'Systems', route: '/systems', icon: 'M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.653-4.655m5.976-.814L17.09 8.03c.252-.504.307-1.085.168-1.633a3.776 3.776 0 0 0-.84-1.68L12.2 0 8.065 4.134a3.78 3.78 0 0 0-.84 1.68 1.886 1.886 0 0 0 .168 1.633l2.28 3.764' },
    { label: 'Sampling', route: '/sampling', icon: 'M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5' },
    { label: 'Treatments', route: '/treatments', icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
    { label: 'Products', route: '/products', icon: 'm21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9' },
    { label: 'Reports', route: '/reports', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z' },
    { label: 'Account', route: '/account', icon: 'M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' },
  ];

  get navItems(): NavItem[] {
    return this.auth.isAdmin() ? this.adminNav : this.clientNav;
  }

  getInitials(): string {
    const name = this.auth.currentUser()?.name ?? '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
