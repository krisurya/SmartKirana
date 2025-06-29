import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { collection, collectionData, Firestore, query, where, orderBy } from '@angular/fire/firestore';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule, TableModule, DialogModule, ButtonModule],
  templateUrl: './customer-orders.component.html',
  styleUrls: ['./customer-orders.component.scss']
})
export class CustomerOrdersComponent implements OnInit {
  phone: string = '';
  orders: any[] = [];
  selectedOrder: any = null;
  orderDialogVisible = false;

  constructor(private route: ActivatedRoute, private firestore: Firestore) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.phone = params.get('phone') || '';
      if (this.phone) {
        this.fetchOrders();
      }
    });
  }

  fetchOrders() {
    const ordersRef = collection(this.firestore, 'orders');
    const q = query(ordersRef, where('customerId', '==', this.phone), orderBy('createdAt', 'desc'));

    collectionData(q, { idField: 'id' }).subscribe(data => {
      this.orders = data;
    });
  }

  get totalRemaining(): number {
    return this.orders.reduce((sum, order) => sum + (order.remainingAmount || 0), 0);
  }


  showOrderDetails(order: any) {
    this.selectedOrder = order;
    this.orderDialogVisible = true;
  }

  formatDate(ts: any): string {
    if (ts?.toDate) {
      return formatDate(ts.toDate(), 'short', 'en-IN');
    } else if (ts instanceof Date) {
      return formatDate(ts, 'short', 'en-IN');
    } else {
      return 'Invalid Date';
    }
  }
}
