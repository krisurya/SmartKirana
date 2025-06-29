import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-print-slip',
  templateUrl: './print-slip.component.html',
  styleUrls: ['./print-slip.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class PrintSlipComponent {
  @Input() items: any[] = [];
  @Input() paidAmount?: number;
  @Input() remainingAmount?: number;
  @Input() paymentMode?: string;
  @Input() customer: { name: string; phone: string } = { name: '', phone: '' };
  @Input() workerVersion = false; // true = no payment info

  language: 'en' | 'hi' = 'en';

  ngOnInit(){
    const savedLang = localStorage.getItem('printLanguage');
    if (savedLang === 'hi' || savedLang === 'en') {
      this.language = savedLang;
    }
  }

  onLanguageChange(newLang: 'en' | 'hi') {
    this.language = newLang;
    localStorage.setItem('printLanguage', newLang);
  }

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

  printSlip(id: string) {
    const printContent = document.getElementById(id)?.innerHTML;

    if (printContent) {
      const printWindow = window.open('', '_blank', 'width=240,height=600');

      printWindow?.document.write(`
        <html>
          <head>
            <title>Print Slip</title>
            <style>
              @media print {
                @page {
                  size: 58mm auto;
                  margin: 0;
                }
              }

              body {
                font-family: monospace;
                font-size: 11px;
                width: 58mm;
                padding: 4mm;
                margin: 0;
                background: #fff;
                color: #000;
              }

              .header {
                text-align: center;
                margin-bottom: 6px;
              }

              .header h3 {
                margin: 0;
                font-size: 14px;
              }

              .header h4 {
                margin: 0;
                font-size: 11px;
                font-weight: normal;
              }

              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 6px;
              }

              td {
                padding: 2px 0;
                vertical-align: top;
                font-size: 11px;
              }

              td:first-child {
                width: 45%;
              }

              td:nth-child(2),
              td:nth-child(3) {
                width: 27.5%;
                text-align: right;
              }

              .total {
                font-weight: bold;
                border-top: 1px dashed #000;
                margin-top: 6px;
                padding-top: 3px;
                text-align: right;
                font-size: 12px;
              }

              .payment-summary {
                border-top: 1px dashed #000;
                margin-top: 5px;
                padding-top: 3px;
                font-size: 11px;
              }

              .payment-summary p {
                margin: 2px 0;
                display: flex;
                justify-content: space-between;
              }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${printContent}
          </body>
        </html>
      `);

      printWindow?.document.close();
      printWindow?.focus();
      printWindow?.print();
    }
  }

}
