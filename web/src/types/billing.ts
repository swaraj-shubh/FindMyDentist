export interface BillItem {
  description: string;
  qty: number;
  price: number;
}

export type BillStatus = "draft" | "pending" | "paid" | "overdue";

export interface Bill {
  id: string;
  patientId: string;
  clinicId: string;
  appointmentId: string;
  invoiceNumber: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: BillStatus;
  date: string;
  paidAt: string;
  paymentMethod: string;
}
