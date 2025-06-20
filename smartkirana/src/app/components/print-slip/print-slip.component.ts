import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-print-slip',
  templateUrl: './print-slip.component.html',
  styleUrls: ['./print-slip.component.scss'],
  imports: [CommonModule],
})
export class PrintSlipComponent {
  @Input() items: any[] = [];

  get total(): number {
    return this.items.reduce((sum, item) => sum + ((item.price * item.quantity) || 0), 0);
  }

  get now(): string {
    return new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'short',
      timeStyle: 'short',
      hour12: true,
    });
  }

  printSlip() {
    const printContents = document.getElementById('slip')?.innerHTML;
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    printWindow?.document.write(`
      <html>
        <head>
          <title>Print Slip</title>
          <style>
            body { font-family: monospace; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 2px 0; }
            .header { text-align: center; margin-bottom: 10px; }
            .total { font-weight: bold; border-top: 1px dashed #000; margin-top: 5px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${printContents}
        </body>
      </html>
    `);
    printWindow?.document.close();
  }
}
