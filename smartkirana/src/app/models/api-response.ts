export interface OrderResponse {
  order: {
    order: OrderItem[];
    unMatched: UnmatchedEntry[];
  };
}

export interface OrderItem {
  qty: number;
  item: ItemDetails;
  unit: UnitDetails;
}

export interface ItemDetails {
  id: string;
  canonical: string;
  english: string;
  price: number;
}

export interface UnitDetails {
  id: string;
  canonical: string;
  english: string;
}

export interface UnmatchedEntry {
  reason: string;
  text: string;
}