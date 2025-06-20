import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ButtonModule } from 'primeng/button';

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
  ],
})
export class SmartKiranaLayoutComponent {
  menuItems = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      routerLink: ['/dashboard']
    },
    {
      label: 'Items',
      icon: 'pi pi-list',
      routerLink: ['/items']
    },
    {
      label: 'Units',
      icon: 'pi pi-tag',
      routerLink: ['/units']
    },
    {
      label: 'Voice Order',
      icon: 'pi pi-microphone',
      routerLink: ['/voice-order']
    },
    {
      label: 'Customers',
      icon: 'pi pi-users',
      routerLink: ['/customers']
    }
  ];
}
