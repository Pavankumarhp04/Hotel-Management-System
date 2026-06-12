import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'hotel.db');
const db = new Database(dbPath);

// Initialize database schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rooms (
      room_id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_number TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL, -- Single, Double, Deluxe, Suite
      price REAL NOT NULL,
      status TEXT DEFAULT 'Available' -- Available, Booked, Out of Service
    );

    CREATE TABLE IF NOT EXISTS customers (
      customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      id_proof TEXT
    );

    CREATE TABLE IF NOT EXISTS bookings (
      booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      check_in TEXT NOT NULL, -- ISO date string
      check_out TEXT NOT NULL, -- ISO date string
      status TEXT DEFAULT 'Confirmed', -- Confirmed, Checked-in, Checked-out, Cancelled
      total_amount REAL,
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
      FOREIGN KEY (room_id) REFERENCES rooms(room_id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_date TEXT NOT NULL,
      method TEXT NOT NULL, -- Cash, Card, Online
      FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
    );

    -- Insert default admin if not exists (username: admin, password: admin123)
    INSERT OR IGNORE INTO admin (username, password) VALUES ('admin', 'admin123');

    -- Insert some sample rooms if table is empty
    INSERT INTO rooms (room_number, type, price, status) 
    SELECT '101', 'Single', 100, 'Available' WHERE (SELECT COUNT(*) FROM rooms) = 0
    UNION ALL SELECT '102', 'Double', 150, 'Available' WHERE (SELECT COUNT(*) FROM rooms) = 0
    UNION ALL SELECT '201', 'Deluxe', 250, 'Available' WHERE (SELECT COUNT(*) FROM rooms) = 0
    UNION ALL SELECT '301', 'Suite', 500, 'Available' WHERE (SELECT COUNT(*) FROM rooms) = 0;

    -- Sample Customer
    INSERT INTO customers (name, phone, email)
    SELECT 'Guest One', '555-001', 'guest1@hotel.com' WHERE (SELECT COUNT(*) FROM customers) = 0;

    -- Sample Booking for Today (Occupancy demo)
    INSERT INTO bookings (customer_id, room_id, check_in, check_out, status, total_amount)
    SELECT 1, 1, date('now'), date('now', '+2 days'), 'Confirmed', 200
    WHERE (SELECT COUNT(*) FROM bookings) = 0;

    -- Sample Payment
    INSERT INTO payments (booking_id, amount, payment_date, method)
    SELECT 1, 200, date('now'), 'Cash' WHERE (SELECT COUNT(*) FROM payments) = 0;
  `);
}

export default db;
