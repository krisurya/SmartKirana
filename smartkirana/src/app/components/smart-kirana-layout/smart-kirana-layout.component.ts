import { Component, inject, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-smart-kirana-layout',
  templateUrl: './smart-kirana-layout.component.html',
  styleUrls: ['./smart-kirana-layout.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    PanelMenuModule,
    ButtonModule,
    SplitButtonModule,
  ],
})
export class SmartKiranaLayoutComponent {
  sidebarCollapsed = false;
  screenWidth = window.innerWidth;

  authService = inject(AuthService);
  user$ = this.authService.user$;

  constructor(private router: Router) {}

  @HostListener('window:resize', [])
  onResize() {
    this.screenWidth = window.innerWidth;
  }

  menuItems = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/dashboard'] },
    { label: 'Items', icon: 'pi pi-list', routerLink: ['/items'] },
    { label: 'Units', icon: 'pi pi-tag', routerLink: ['/units'] },
    { label: 'Voice Order', icon: 'pi pi-microphone', routerLink: ['/voice-order'] },
    { label: 'Customers', icon: 'pi pi-users', routerLink: ['/customers'] },
  ];

  userMenu = [
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.authService.logout()
    }
  ];

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  navigate(route: any) {
    if (route) {
      this.router.navigate(route);
    }
  }
}
