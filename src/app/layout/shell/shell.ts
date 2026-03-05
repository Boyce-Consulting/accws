import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopBarComponent } from '../top-bar/top-bar';
import { SidebarComponent } from '../sidebar/sidebar';
import { BottomNavComponent } from '../bottom-nav/bottom-nav';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, TopBarComponent, SidebarComponent, BottomNavComponent],
  template: `
    <div class="h-screen flex flex-col lg:flex-row bg-gray-50">
      <!-- Sidebar (desktop only) -->
      <app-sidebar class="hidden lg:block" />

      <!-- Main content area -->
      <div class="flex-1 flex flex-col min-h-0 lg:ml-64">
        <app-top-bar />
        <main class="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          <router-outlet />
        </main>
      </div>

      <!-- Bottom nav (mobile only) -->
      <app-bottom-nav class="lg:hidden" />
    </div>
  `,
})
export class ShellComponent {}
