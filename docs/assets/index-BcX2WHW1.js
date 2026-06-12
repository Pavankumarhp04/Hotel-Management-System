(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))t(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const d of s.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&t(d)}).observe(document,{childList:!0,subtree:!0});function o(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function t(n){if(n.ep)return;n.ep=!0;const s=o(n);fetch(n.href,s)}})();document.addEventListener("DOMContentLoaded",()=>{h(),f(),S(),lucide.createIcons()});function h(){document.cookie.includes("admin_session=logged_in")?u():b(),document.getElementById("login-form").addEventListener("submit",async o=>{o.preventDefault();const t=document.getElementById("username").value,n=document.getElementById("password").value;try{(await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:t,password:n})})).ok?u():document.getElementById("login-error").textContent="INVALID ACCESS CODE"}catch(s){console.error(s)}}),document.getElementById("logout-btn").addEventListener("click",async()=>{await fetch("/api/auth/logout",{method:"POST"}),location.reload()})}function b(){document.getElementById("login-overlay").classList.remove("hidden"),document.getElementById("app-container").classList.add("hidden")}function u(){document.getElementById("login-overlay").classList.add("hidden"),document.getElementById("app-container").classList.remove("hidden"),i("dashboard")}function f(){const a=document.querySelectorAll(".nav-btn");a.forEach(e=>{e.addEventListener("click",()=>{const o=e.getAttribute("data-tab");a.forEach(t=>t.classList.remove("active")),e.classList.add("active"),i(o)})})}async function i(a){const e=document.getElementById("tab-content"),o=document.getElementById("page-title");switch(e.innerHTML='<p class="loading">SYNCING DATA...</p>',a){case"dashboard":o.textContent="OVERVIEW",await y(e);break;case"rooms":o.textContent="INVENTORY",await g(e);break;case"bookings":o.textContent="RESERVATIONS",await T(e);break;case"customers":o.textContent="GUESTS",await O(e);break}}async function y(a){const e=await fetch("/api/reports/dashboard").then(o=>o.json());a.innerHTML=`
        <div class="stats-grid">
            <div class="stat-card">
                <span class="label">Total Rooms</span>
                <div class="value">${e.totalRooms}</div>
            </div>
            <div class="stat-card dark">
                <span class="label">Current Occupancy</span>
                <div class="value">${e.bookedRooms}</div>
            </div>
            <div class="stat-card">
                <span class="label">Available Now</span>
                <div class="value">${e.availableRooms}</div>
            </div>
            <div class="stat-card">
                <span class="label">Total Revenue</span>
                <div class="value">$${e.totalRevenue.toLocaleString()}</div>
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
                <div class="value" style="font-size: 1.5rem;">${e.totalCustomers} <span style="font-size: 0.8rem; color: var(--muted); font-weight: 600;">ACTIVE GUESTS</span></div>
            </div>
        </div>
    `}async function g(a){const e=await fetch("/api/rooms").then(t=>t.json());let o=`
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
    `;e.length===0&&(o+='<tr><td colspan="5" style="text-align:center; padding: 3rem; opacity: 0.5;">INVENTORY EMPTY</td></tr>'),e.forEach(t=>{t.room_id||console.warn("Room object missing room_id:",t),o+=`
            <tr>
                <td class="room-id">#${t.room_number}</td>
                <td class="italic uppercase font-bold">${t.type}</td>
                <td>$${t.price}</td>
                <td>
                    <span class="badge ${t.status==="Available"?"badge-success":""}">${t.status}</span>
                </td>
                <td>
                    <button class="btn-outline" style="color: #e11d48; border-color: #fecaca;" onclick="deleteRoom(${t.room_id||"null"})">REMOVE</button>
                </td>
            </tr>
        `}),o+="</tbody></table></div>",a.innerHTML=o}function v(){m(`
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
    `),document.getElementById("room-form").addEventListener("submit",async a=>{a.preventDefault();const e={room_number:document.getElementById("r-number").value,type:document.getElementById("r-type").value,price:parseFloat(document.getElementById("r-price").value),status:"Available"};(await fetch("/api/rooms",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})).ok?(r(),i("rooms")):alert("ENTRY FAILED: ROOM NUMBER MIGHT ALREADY EXIST")})}window.showAddRoomModal=v;async function E(a){if(!a||a==="null"){alert("ERROR: Invalid Room ID reference.");return}if(confirm(`Are you sure you want to PERMANENTLY REMOVE this room from the inventory?

This will also delete all associated bookings and payments.`))try{const e=await fetch(`/api/rooms/${a}`,{method:"DELETE"}),o=await e.json();e.ok?i("rooms"):alert(`ACTION DENIED: ${o.error||"System operation failed."}`)}catch(e){console.error("Room removal error:",e),alert("COMMUNICATION ERROR: The terminal lost connection to the management server.")}}async function T(a){const e=await fetch("/api/bookings").then(t=>t.json());let o=`
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
    `;e.forEach(t=>{o+=`
            <tr>
                <td>${t.customer_name}</td>
                <td><span class="badge">#${t.room_number}</span></td>
                <td>${t.check_in} — ${t.check_out}</td>
                <td>$${t.total_amount}</td>
                <td><span class="badge ${t.status==="Checked-in"?"badge-success":""}">${t.status}</span></td>
                <td>
                    ${t.status==="Confirmed"?`<button class="btn-primary" style="padding: 0.5rem;" onclick="updateBooking(${t.booking_id}, 'Checked-in')">IN</button>`:""}
                    ${t.status==="Checked-in"?`<button class="btn-primary" style="padding: 0.5rem;" onclick="updateBooking(${t.booking_id}, 'Checked-out')">OUT</button>`:""}
                </td>
            </tr>
        `}),o+="</tbody></table></div>",a.innerHTML=o}async function I(a,e){await fetch(`/api/bookings/${a}/status`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:e})}),i("bookings")}async function O(a){const e=await fetch("/api/customers").then(t=>t.json());let o=`
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
    `;e.length===0&&(o+='<tr><td colspan="3" style="text-align:center; padding: 3rem; opacity: 0.5;">NO GUESTS REGISTERED IN SYSTEM</td></tr>'),e.forEach(t=>{o+=`
            <tr>
                <td class="font-bold uppercase italic">${t.name}</td>
                <td>${t.email}<br/><small>${t.phone}</small></td>
                <td><span class="badge">${t.id_proof||"NOT PROVIDED"}</span></td>
            </tr>
        `}),o+="</tbody></table></div>",a.innerHTML=o}function R(){m(`
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
    `),document.getElementById("customer-form").addEventListener("submit",async a=>{a.preventDefault();const e={name:document.getElementById("c-name").value,email:document.getElementById("c-email").value,phone:document.getElementById("c-phone").value,id_proof:document.getElementById("c-id").value};(await fetch("/api/customers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})).ok?(r(),i("customers")):alert("REGISTRATION FAILED: EMAIL MIGHT BE DUPLICATE")})}window.showRegisterGuestModal=R;function S(){const a=document.getElementById("global-new-booking");document.getElementById("modal-container"),a.addEventListener("click",async()=>{const e=await fetch("/api/rooms").then(n=>n.json()),o=await fetch("/api/customers").then(n=>n.json()),t=e.filter(n=>n.status!=="Out of Service");m(`
            <div class="modal-header">
                <h2>NEW RESERVATION</h2>
            </div>
            <form id="booking-form">
                <div class="form-group">
                    <label>GUEST</label>
                    <select id="b-customer" required>
                        <option value="">SELECT GUEST</option>
                        ${o.map(n=>`<option value="${n.customer_id}">${n.name}</option>`).join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label>ROOM</label>
                    <select id="b-room" required>
                        <option value="">SELECT ROOM</option>
                        ${t.map(n=>`
                            <option value="${n.room_id}">
                                #${n.room_number} - ${n.type} ($${n.price})
                            </option>
                        `).join("")}
                    </select>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                    <div class="form-group">
                        <label>CHECK-IN</label>
                        <input type="date" id="b-in" required value="${new Date().toISOString().split("T")[0]}">
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
        `),document.getElementById("booking-form").addEventListener("submit",async n=>{n.preventDefault();const s={customer_id:document.getElementById("b-customer").value,room_id:document.getElementById("b-room").value,check_in:document.getElementById("b-in").value,check_out:document.getElementById("b-out").value},d=e.find(l=>l.room_id==s.room_id),p=Math.ceil((new Date(s.check_out)-new Date(s.check_in))/(1e3*60*60*24))||1;s.total_amount=d.price*p;const c=await fetch("/api/bookings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});if(c.ok){const l=await c.json();await fetch("/api/payments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({booking_id:l.id,amount:s.total_amount,method:"Cash"})}),r(),i("bookings")}else{const l=await c.json();alert(l.error)}})})}function m(a){const e=document.getElementById("modal-container"),o=document.getElementById("modal-content");o.innerHTML=a,e.classList.remove("hidden")}function r(){document.getElementById("modal-container").classList.add("hidden")}window.closeModal=r;window.deleteRoom=E;window.updateBooking=I;
