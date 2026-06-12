export interface Room {
  room_id: number;
  room_number: string;
  type: 'Single' | 'Double' | 'Deluxe' | 'Suite';
  price: number;
  status: 'Available' | 'Booked' | 'Out of Service';
}

export interface Customer {
  customer_id: number;
  name: string;
  phone: string;
  email: string;
  id_proof?: string;
}

export interface Booking {
  booking_id: number;
  customer_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  status: 'Confirmed' | 'Checked-in' | 'Checked-out' | 'Cancelled';
  total_amount: number;
  customer_name?: string;
  room_number?: string;
}

export interface Payment {
  payment_id: number;
  booking_id: number;
  amount: number;
  payment_date: string;
  method: 'Cash' | 'Card' | 'Online';
}

export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  bookedRooms: number;
  totalCustomers: number;
  totalRevenue: number;
}
