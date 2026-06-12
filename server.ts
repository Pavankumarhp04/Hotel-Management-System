import express from "express";
import path from "path";
import db, { initDb } from "./src/lib/db.ts";
import cookieParser from "cookie-parser";

// Note: In development, .js imports from ./src might need to be resolved by Vite
// But better-sqlite3 needs to run in Node.

async function startServer() {
  const app = express();
  const PORT = 3001;

  // Initialize DB
  initDb();

  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  
  // Auth
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const admin = db.prepare("SELECT * FROM admin WHERE username = ? AND password = ?").get(username, password);
    if (admin) {
      res.cookie("admin_session", "logged_in", { httpOnly: true, maxAge: 3600000 });
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("admin_session");
    res.json({ success: true });
  });

  // Serve static files from webapp
  app.use(express.static(path.join(process.cwd(), 'webapp')));

  // Fallback to index.html for any other routes (SPA-like behavior if needed)
  app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'webapp', 'index.html'));
  });

  // Rooms CRUD
  app.get("/api/rooms", (req, res) => {
    const rooms = db.prepare("SELECT * FROM rooms").all();
    res.json(rooms);
  });

  app.post("/api/rooms", (req, res) => {
    const { room_number, type, price, status } = req.body;
    const info = db.prepare("INSERT INTO rooms (room_number, type, price, status) VALUES (?, ?, ?, ?)")
      .run(room_number, type, price, status || 'Available');
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/rooms/:id", (req, res) => {
    const { room_number, type, price, status } = req.body;
    db.prepare("UPDATE rooms SET room_number = ?, type = ?, price = ?, status = ? WHERE room_id = ?")
      .run(room_number, type, price, status, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/rooms/:id", (req, res) => {
    const roomId = parseInt(req.params.id);
    if (isNaN(roomId)) {
      return res.status(400).json({ error: "Invalid room identifier." });
    }
    
    try {
      const deleteProcess = db.transaction(() => {
        // Get all booking IDs for this room to purge payments
        const bookings = db.prepare("SELECT booking_id FROM bookings WHERE room_id = ?").all(roomId) as any[];
        const bookingIds = bookings.map(b => b.booking_id);

        if (bookingIds.length > 0) {
          const placeholders = bookingIds.map(() => "?").join(",");
          db.prepare(`DELETE FROM payments WHERE booking_id IN (${placeholders})`).run(...bookingIds);
        }
        
        // Purge bookings
        db.prepare("DELETE FROM bookings WHERE room_id = ?").run(roomId);

        // Purge the room
        const result = db.prepare("DELETE FROM rooms WHERE room_id = ?").run(roomId);
        return result.changes;
      });

      const changes = deleteProcess();
      if (changes === 0) {
        return res.status(404).json({ error: "Room not found in inventory." });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Critical: Room removal failed:", error);
      res.status(500).json({ error: "Database lock or integrity failure. " + (error instanceof Error ? error.message : "") });
    }
  });

  // Customers
  app.get("/api/customers", (req, res) => {
    const customers = db.prepare("SELECT * FROM customers").all();
    res.json(customers);
  });

  app.post("/api/customers", (req, res) => {
    const { name, phone, email, id_proof } = req.body;
    const info = db.prepare("INSERT INTO customers (name, phone, email, id_proof) VALUES (?, ?, ?, ?)")
      .run(name, phone, email, id_proof);
    res.json({ id: info.lastInsertRowid });
  });

  // Bookings
  app.get("/api/bookings", (req, res) => {
    const bookings = db.prepare(`
      SELECT b.*, c.name as customer_name, r.room_number 
      FROM bookings b
      JOIN customers c ON b.customer_id = c.customer_id
      JOIN rooms r ON b.room_id = r.room_id
    `).all();
    res.json(bookings);
  });

  app.post("/api/bookings", (req, res) => {
    const { customer_id, room_id, check_in, check_out, total_amount } = req.body;
    
    // Check availability
    const existing = db.prepare(`
      SELECT * FROM bookings 
      WHERE room_id = ? 
      AND status NOT IN ('Cancelled', 'Checked-out')
      AND (
        (check_in BETWEEN ? AND ?) OR 
        (check_out BETWEEN ? AND ?) OR
        (? BETWEEN check_in AND check_out)
      )
    `).get(room_id, check_in, check_out, check_in, check_out, check_in);

    if (existing) {
      return res.status(400).json({ error: "Room already booked for these dates" });
    }

    const info = db.prepare(`
      INSERT INTO bookings (customer_id, room_id, check_in, check_out, status, total_amount) 
      VALUES (?, ?, ?, ?, 'Confirmed', ?)
    `).run(customer_id, room_id, check_in, check_out, total_amount);
    
    // Note: We no longer mark the room as permanently 'Booked' in the rooms table.
    // Availability is determined by checking the bookings table for overlaps.

    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/bookings/:id/status", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE bookings SET status = ? WHERE booking_id = ?").run(status, req.params.id);
    
    // Room status in 'rooms' table is primarily for 'Out of Service' or global maintenance.
    // The dashboard now calculates real-time occupancy.
    res.json({ success: true });
  });

  // Payments
  app.post("/api/payments", (req, res) => {
    const { booking_id, amount, method } = req.body;
    const info = db.prepare("INSERT INTO payments (booking_id, amount, payment_date, method) VALUES (?, ?, ?, ?)")
      .run(booking_id, amount, new Date().toISOString(), method);
    res.json({ id: info.lastInsertRowid });
  });

  // Reports
  app.get("/api/reports/dashboard", (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const totalRooms = db.prepare("SELECT COUNT(*) as count FROM rooms").get() as any;
      const activeBookings = db.prepare(`
        SELECT COUNT(DISTINCT room_id) as count 
        FROM bookings 
        WHERE status IN ('Confirmed', 'Checked-in') 
        AND (date(?) BETWEEN date(check_in) AND date(check_out))
      `).get(today) as any;
      
      const totalCustomers = db.prepare("SELECT COUNT(*) as count FROM customers").get() as any;
      const totalRevenue = db.prepare("SELECT SUM(amount) as sum FROM payments").get() as any;

      res.json({
        totalRooms: totalRooms.count,
        bookedRooms: activeBookings?.count || 0,
        availableRooms: Math.max(0, totalRooms.count - (activeBookings?.count || 0)),
        totalCustomers: totalCustomers.count,
        totalRevenue: totalRevenue.sum || 0
      });
    } catch (e) {
      console.error("Dashboard calculation error:", e);
      res.status(500).json({ error: "Failed to calculate dashboard stats" });
    }
  });

  app.get("/api/reports/revenue", (req, res) => {
    const revenue = db.prepare(`
      SELECT strftime('%Y-%m-%d', payment_date) as date, SUM(amount) as total
      FROM payments
      GROUP BY date
      ORDER BY date DESC
      LIMIT 30
    `).all();
    res.json(revenue);
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
