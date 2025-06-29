import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class GlobalToastService {
  constructor(private messageService: MessageService) {}

  success(summary: string, detail: string, life: number = 3000) {
    this.messageService.add({ severity: 'success', summary, detail, life });
  }

  error(summary: string, detail: string) {
    this.messageService.add({ severity: 'error', summary, detail });
  }

  info(summary: string, detail: string) {
    this.messageService.add({ severity: 'info', summary, detail });
  }

  warn(summary: string, detail: string) {
    this.messageService.add({ severity: 'warn', summary, detail });
  }

  clear() {
    this.messageService.clear();
  }
}
