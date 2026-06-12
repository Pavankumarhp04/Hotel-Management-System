/**
 * Grand Horizon Management System
 * Plain JS Implementation
 */

// --- App State ---
const state = {
    activeTab: 'dashboard',
    stats: null,
    rooms: [],
    bookings: [],
    customers: [],
    isAuthenticated: false
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initNavigation();
    initGlobalEvents();
    lucide.createIcons();
});

function initAuth() {
    const isLogged = document.cookie.includes('admin_session=logged_in');
    if (isLogged) {
        showApp();
    } else {
        showLogin();
    }

    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                showApp();
            } else {
                document.getElementById('login-error').textContent = 'INVALID ACCESS CODE';
            }
        } catch (err) {
            console.error(err);
        }
    });

    document.getElementById('logout-btn').addEventListener('click', async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        location.reload();
    });
}

function showLogin() {
    document.getElementById('login-overlay').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
}

function showApp() {
    document.getElementById('login-overlay').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    state.isAuthenticated = true;
    loadTabContent('dashboard');
}

// --- Navigation ---
function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadTabContent(tab);
        });
    });
}

async function loadTabContent(tab) {
    state.activeTab = tab;
    const container = document.getElementById('tab-content');
    const title = document.getElementById('page-title');
    
    // Reset view
    container.innerHTML = '<p class="loading">SYNCING DATA...</p>';

    switch(tab) {
        case 'dashboard':
            title.textContent = 'OVERVIEW';
            await renderDashboard(container);
            break;
        case 'rooms':
            title.textContent = 'INVENTORY';
            await renderRooms(container);
            break;
        case 'bookings':
            title.textContent = 'RESERVATIONS';
            await renderBookings(container);
            break;
        case 'customers':
            title.textContent = 'GUESTS';
            await renderCustomers(container);
            break;
    }
}

// --- Dashboard ---
async function renderDashboard(container) {
    const stats = await fetch('/api/reports/dashboard').then(res => res.json());
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <span class="label">Total Rooms</span>
                <div class="value">${stats.totalRooms}</div>
            </div>
            <div class="stat-card dark">
                <span class="label">Current Occupancy</span>
                <div class="value">${stats.bookedRooms}</div>
            </div>
            <div class="stat-card">
                <span class="label">Available Now</span>
                <div class="value">${stats.availableRooms}</div>
            </div>
            <div class="stat-card">
                <span class="label">Total Revenue</span>
                <div class="value">$${stats.totalRevenue.toLocaleString()}</div>
            </div>
        </div>
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
            <div class="stat-card">
                <span class="label">System Performance</span>
                <div style="margin-top: 1rem; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden;">
                    <div style="width: 85%; height: 100%; background: var(--accent);"></div>
                </div>
                <div style="margin-top: 0.5rem; font-size: 0.75rem; font-weight: 600; color: var(--muted);">85% THROUGHPUT EFFICIENCY</div>
            </div>
            <div class="stat-card">
                <span class="label">Customer Base</span>
                <div class="value" style="font-size: 1.5rem;">${stats.totalCustomers} <span style="font-size: 0.8rem; color: var(--muted); font-weight: 600;">ACTIVE GUESTS</span></div>
            </div>
        </div>
    `;
}// --- Room Management ---
async function renderRooms(container) {
    const rooms = await fetch('/api/rooms').then(res => res.json());
    
    let html = `
        <div style="margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: center;">
            <h3 class="font-black italic uppercase">Inventory Catalog</h3>
            <button class="btn-primary" onclick="showAddRoomModal()">+ NEW ROOM</button>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>CATEGORY</th>
                        <th>RATE</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (rooms.length === 0) {
        html += `<tr><td colspan="5" style="text-align:center; padding: 3rem; opacity: 0.5;">INVENTORY EMPTY</td></tr>`;
    }

    rooms.forEach(room => {
        if (!room.room_id) {
            console.warn('Room object missing room_id:', room);
        }
        html += `
            <tr>
                <td class="room-id">#${room.room_number}</td>
                <td class="italic uppercase font-bold">${room.type}</td>
                <td>$${room.price}</td>
                <td>
                    <span class="badge ${room.status === 'Available' ? 'badge-success' : ''}">${room.status}</span>
                </td>
                <td>
                    <button class="btn-outline" style="color: #e11d48; border-color: #fecaca;" onclick="deleteRoom(${room.room_id || 'null'})">REMOVE</button>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

function showAddRoomModal() {
    showModal(`
        <div class="modal-header">
            <h2>NEW INVENTORY ENTRY</h2>
        </div>
        <form id="room-form">
            <div class="form-group">
                <label>ROOM NUMBER / ID</label>
                <input type="text" id="r-number" placeholder="e.g. 405" required>
            </div>
            <div class="form-group">
                <label>CATEGORY</label>
                <select id="r-type" required>
                    <option value="Single">SINGLE</option>
                    <option value="Double">DOUBLE</option>
                    <option value="Deluxe">DELUXE</option>
                    <option value="Suite">SUITE</option>
                </select>
            </div>
            <div class="form-group">
                <label>NIGHTLY RATE ($)</label>
                <input type="number" id="r-price" placeholder="100" required min="1">
            </div>
            <div style="display:flex; gap:1rem; margin-top:2rem;">
                <button type="button" class="btn-primary" style="background:#fff; color:#000; border:2px solid #000;" onclick="closeModal()">CANCEL</button>
                <button type="submit" class="btn-primary full-width">CREATE ROOM</button>
            </div>
        </form>
    `);

    document.getElementById('room-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            room_number: document.getElementById('r-number').value,
            type: document.getElementById('r-type').value,
            price: parseFloat(document.getElementById('r-price').value),
            status: 'Available'
        };

        const res = await fetch('/api/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            closeModal();
            loadTabContent('rooms');
        } else {
            alert('ENTRY FAILED: ROOM NUMBER MIGHT ALREADY EXIST');
        }
    });
}
window.showAddRoomModal = showAddRoomModal;

async function deleteRoom(id) {
    if (!id || id === 'null') {
        alert('ERROR: Invalid Room ID reference.');
        return;
    }
    
    if (!confirm('Are you sure you want to PERMANENTLY REMOVE this room from the inventory?\n\nThis will also delete all associated bookings and payments.')) return;
    
    try {
        const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
        const data = await res.json();
        
        if (res.ok) {
            loadTabContent('rooms');
        } else {
            alert(`ACTION DENIED: ${data.error || 'System operation failed.'}`);
        }
    } catch (err) {
        console.error('Room removal error:', err);
        alert('COMMUNICATION ERROR: The terminal lost connection to the management server.');
    }
}

// --- Bookings ---
async function renderBookings(container) {
    const bookings = await fetch('/api/bookings').then(res => res.json());
    
    let html = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>GUEST</th>
                        <th>ROOM</th>
                        <th>DATES</th>
                        <th>AMOUNT</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                    </tr>
                </thead>
                <tbody>
    `;

    bookings.forEach(b => {
        html += `
            <tr>
                <td>${b.customer_name}</td>
                <td><span class="badge">#${b.room_number}</span></td>
                <td>${b.check_in} — ${b.check_out}</td>
                <td>$${b.total_amount}</td>
                <td><span class="badge ${b.status === 'Checked-in' ? 'badge-success' : ''}">${b.status}</span></td>
                <td>
                    ${b.status === 'Confirmed' ? `<button class="btn-primary" style="padding: 0.5rem;" onclick="updateBooking(${b.booking_id}, 'Checked-in')">IN</button>` : ''}
                    ${b.status === 'Checked-in' ? `<button class="btn-primary" style="padding: 0.5rem;" onclick="updateBooking(${b.booking_id}, 'Checked-out')">OUT</button>` : ''}
                </td>
            </tr>
        `;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

async function updateBooking(id, status) {
    await fetch(`/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    loadTabContent('bookings');
}

// --- Customers ---
async function renderCustomers(container) {
    const customers = await fetch('/api/customers').then(res => res.json());
    
    let html = `
        <div style="margin-bottom: 2.5rem;">
            <button class="btn-primary" onclick="showRegisterGuestModal()">+ REGISTER NEW GUEST</button>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>NAME</th>
                        <th>CONTACT</th>
                        <th>ID PROOF</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (customers.length === 0) {
        html += `<tr><td colspan="3" style="text-align:center; padding: 3rem; opacity: 0.5;">NO GUESTS REGISTERED IN SYSTEM</td></tr>`;
    }

    customers.forEach(c => {
        html += `
            <tr>
                <td class="font-bold uppercase italic">${c.name}</td>
                <td>${c.email}<br/><small>${c.phone}</small></td>
                <td><span class="badge">${c.id_proof || 'NOT PROVIDED'}</span></td>
            </tr>
        `;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

function showRegisterGuestModal() {
    showModal(`
        <div class="modal-header">
            <h2>GUEST REGISTRATION</h2>
        </div>
        <form id="customer-form">
            <div class="form-group">
                <label>FULL NAME</label>
                <input type="text" id="c-name" placeholder="JOHN DOE" required>
            </div>
            <div class="form-group">
                <label>EMAIL ADDRESS</label>
                <input type="email" id="c-email" placeholder="john@example.com" required>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                <div class="form-group">
                    <label>PHONE</label>
                    <input type="text" id="c-phone" placeholder="+1..." required>
                </div>
                <div class="form-group">
                    <label>ID PROOF</label>
                    <input type="text" id="c-id" placeholder="PASSPORT/SSN">
                </div>
            </div>
            <div style="display:flex; gap:1rem; margin-top:2rem;">
                <button type="button" class="btn-primary" style="background:#fff; color:#000; border:2px solid #000;" onclick="closeModal()">CANCEL</button>
                <button type="submit" class="btn-primary full-width">REGISTER</button>
            </div>
        </form>
    `);

    document.getElementById('customer-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('c-name').value,
            email: document.getElementById('c-email').value,
            phone: document.getElementById('c-phone').value,
            id_proof: document.getElementById('c-id').value
        };

        const res = await fetch('/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            closeModal();
            loadTabContent('customers');
        } else {
            alert('REGISTRATION FAILED: EMAIL MIGHT BE DUPLICATE');
        }
    });
}
window.showRegisterGuestModal = showRegisterGuestModal;

// --- Global Modals & Forms ---
function initGlobalEvents() {
    const newBookingBtn = document.getElementById('global-new-booking');
    const modal = document.getElementById('modal-container');
    
    newBookingBtn.addEventListener('click', async () => {
        const rooms = await fetch('/api/rooms').then(res => res.json());
        const customers = await fetch('/api/customers').then(res => res.json());
        // Show all rooms that are not 'Out of Service'
        const operationalRooms = rooms.filter(r => r.status !== 'Out of Service');

        showModal(`
            <div class="modal-header">
                <h2>NEW RESERVATION</h2>
            </div>
            <form id="booking-form">
                <div class="form-group">
                    <label>GUEST</label>
                    <select id="b-customer" required>
                        <option value="">SELECT GUEST</option>
                        ${customers.map(c => `<option value="${c.customer_id}">${c.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>ROOM</label>
                    <select id="b-room" required>
                        <option value="">SELECT ROOM</option>
                        ${operationalRooms.map(r => `
                            <option value="${r.room_id}">
                                #${r.room_number} - ${r.type} ($${r.price})
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                    <div class="form-group">
                        <label>CHECK-IN</label>
                        <input type="date" id="b-in" required value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label>CHECK-OUT</label>
                        <input type="date" id="b-out" required>
                    </div>
                </div>
                <div style="display:flex; gap:1rem; margin-top:2rem;">
                    <button type="button" class="btn-primary" style="background:#fff; color:#000; border:2px solid #000;" onclick="closeModal()">CANCEL</button>
                    <button type="submit" class="btn-primary full-width">CONFIRM</button>
                </div>
            </form>
        `);

        document.getElementById('booking-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                customer_id: document.getElementById('b-customer').value,
                room_id: document.getElementById('b-room').value,
                check_in: document.getElementById('b-in').value,
                check_out: document.getElementById('b-out').value
            };
            
            // Calculate total (simulated simple logic)
            const room = rooms.find(r => r.room_id == data.room_id);
            const days = Math.ceil((new Date(data.check_out) - new Date(data.check_in)) / (1000*60*60*24)) || 1;
            data.total_amount = room.price * days;

            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                const bRes = await res.json();
                // Auto Payment
                await fetch('/api/payments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ booking_id: bRes.id, amount: data.total_amount, method: 'Cash' })
                });
                closeModal();
                loadTabContent('bookings');
            } else {
                const err = await res.json();
                alert(err.error);
            }
        });
    });
}

function showModal(html) {
    const modal = document.getElementById('modal-container');
    const content = document.getElementById('modal-content');
    content.innerHTML = html;
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-container').classList.add('hidden');
}
window.closeModal = closeModal;
window.deleteRoom = deleteRoom;
window.updateBooking = updateBooking;
