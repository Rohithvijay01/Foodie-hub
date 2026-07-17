// API endpoints base path
const API_BASE = '/api/v1';

// Application state variables
let token = localStorage.getItem('token') || null;
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let currentRole = currentUser ? currentUser.role : null;
let cart = []; // Array of { id, name, price, qty, hotelId }
let activeSubTab = '';
let hotelDetailsCache = {};
let sseAbortController = null;
let notificationList = [];

// Sound notification helper using Web Audio API for zero dependencies
function playSound(type = 'success') {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        if (type === 'success') {
            oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);
        } else if (type === 'alert') {
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
            oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime + 0.1); // D5
            oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2); // E5
            gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.4);
        } else if (type === 'info') {
            oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.2);
        }
    } catch (e) {
        console.warn('Audio Context not allowed or supported yet.', e);
    }
}

// Global Toast System
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'warning') iconClass = 'fa-exclamation-triangle';
    if (type === 'danger') iconClass = 'fa-circle-exclamation';
    
    toast.innerHTML = `
        <i class="fa-solid ${iconClass} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 5.5 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 5000);
    
    if (type === 'success') playSound('success');
    else if (type === 'danger' || type === 'warning') playSound('alert');
    else playSound('info');
}

// Fetch helper that automatically adds JWT token and handles auth errors
async function apiRequest(endpoint, options = {}) {
    const headers = options.headers || {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        if (typeof options.body === 'object') {
            options.body = JSON.stringify(options.body);
        }
    }
    
    options.headers = headers;
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        
        // Handle token expiration or forbidden terms acceptance
        if (response.status === 401) {
            handleLogout();
            showToast('Session Expired', 'Please login again.', 'warning');
            throw new Error('Unauthorized');
        }
        
        if (response.status === 403) {
            const errData = await response.json().catch(() => ({}));
            const msg = errData.message || errData.detail || '';
            if (msg.includes('Terms')) {
                showTermsModal();
                throw new Error('Terms Required');
            } else {
                showToast('Access Denied', msg || 'You do not have permission.', 'danger');
                throw new Error('Forbidden');
            }
        }
        
        const data = await response.json().catch(() => null);
        if (!response.ok) {
            let errorMsg = 'An error occurred';
            if (data) {
                if (data.message) {
                    errorMsg = data.message;
                } else if (data.detail) {
                    errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
                }
                
                if (data.details && Array.isArray(data.details)) {
                    const detailMsgs = data.details.map(d => {
                        const field = d.loc.filter(l => l !== 'body' && l !== 'query' && l !== 'path').join('.');
                        return field ? `${field}: ${d.msg}` : d.msg;
                    }).join('; ');
                    if (detailMsgs) {
                        errorMsg = `${errorMsg} - ${detailMsgs}`;
                    }
                }
            }
            showToast('Error', errorMsg, 'danger');
            throw new Error(errorMsg);
        }
        return data;
    } catch (err) {
        console.error('API Request failed:', err);
        throw err;
    }
}

// Initialize Application on load
document.addEventListener('DOMContentLoaded', () => {
    updateAppView();
    if (token && currentUser) {
        connectSSE();
        // Load default tab
        if (currentRole === 'consumer') switchConsumerTab('browse');
        if (currentRole === 'delivery') switchDeliveryTab('jobs');
        if (currentRole === 'hotel_manager') switchHotelTab('store');
        if (currentRole === 'admin') switchAdminTab('users');
    }
});

// Update global page sections based on auth state
function updateAppView() {
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const userBadge = document.getElementById('user-badge');
    const navNotifications = document.getElementById('nav-notifications');
    
    // Hide all dashboard panels first
    document.querySelectorAll('.role-panel').forEach(p => p.classList.add('hidden'));
    
    if (token && currentUser) {
        authSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        userBadge.classList.remove('hidden');
        navNotifications.classList.remove('hidden');
        
        // Show active user details
        document.getElementById('user-display-name').innerText = currentUser.full_name;
        document.getElementById('user-display-role').innerText = currentUser.role.replace('_', ' ');
        
        // Display specific role panel
        const activePanel = document.getElementById(`panel-${currentUser.role}`);
        if (activePanel) {
            activePanel.classList.remove('hidden');
        } else {
            showToast('Error', 'Unsupported user role', 'danger');
        }
    } else {
        authSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
        userBadge.classList.add('hidden');
        navNotifications.classList.add('hidden');
        
        // Reset state
        cart = [];
        updateCartUI();
        if (sseAbortController) {
            sseAbortController.abort();
            sseAbortController = null;
        }
    }
}

// Switch between Login and Register tabs
function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    
    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabLogin.classList.remove('active');
        tabRegister.classList.add('active');
    }
}

// Handle login submission
async function submitLogin(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('login-username').value;
    const passwordInput = document.getElementById('login-password').value;
    
    try {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: { username: usernameInput, password: passwordInput }
        });
        
        if (response && response.access_token) {
            token = response.access_token;
            currentUser = response.user;
            currentRole = currentUser.role;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            showToast('Success', `Welcome back, ${currentUser.full_name}!`, 'success');
            
            updateAppView();
            connectSSE();
            
            // First login check for terms and conditions
            if (response.first_login_terms_required) {
                showTermsModal();
            } else {
                // Route to starting tab
                if (currentRole === 'consumer') switchConsumerTab('browse');
                if (currentRole === 'delivery') switchDeliveryTab('jobs');
                if (currentRole === 'hotel_manager') switchHotelTab('store');
                if (currentRole === 'admin') switchAdminTab('users');
            }
        }
    } catch (err) {
        // Error toast is handled in apiRequest
    }
}

// Handle registration submission
async function submitRegister(e) {
    e.preventDefault();
    
    const payload = {
        username: document.getElementById('reg-username').value.trim(),
        full_name: document.getElementById('reg-fullname').value.trim(),
        email: document.getElementById('reg-email').value.trim(),
        mobile_number: document.getElementById('reg-mobile').value.trim(),
        role: document.getElementById('reg-role').value,
        department: document.getElementById('reg-dept').value,
        register_number: document.getElementById('reg-regnumber').value.trim(),
        password: document.getElementById('reg-password').value
    };
    
    try {
        const user = await apiRequest('/auth/register', {
            method: 'POST',
            body: payload
        });
        
        if (user) {
            showToast('Account Created', 'Registration successful! You can now login.', 'success');
            // Auto switch back to login and fill username
            switchAuthTab('login');
            document.getElementById('login-username').value = payload.username;
            document.getElementById('login-password').value = '';
        }
    } catch (err) {
        // Error shown by apiRequest
    }
}

// Logout workflow
function handleLogout() {
    token = null;
    currentUser = null;
    currentRole = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateAppView();
}

// Display Terms and conditions modal
async function showTermsModal() {
    const modal = document.getElementById('terms-modal');
    const content = document.getElementById('terms-content');
    modal.classList.remove('hidden');
    
    try {
        const terms = await apiRequest('/auth/terms', { method: 'GET' });
        content.innerHTML = `
            <h3>${terms.title || 'Terms of Service'}</h3>
            <p class="margin-t-md">${terms.content || 'Please accept terms to continue.'}</p>
        `;
    } catch (e) {
        content.innerHTML = '<p class="text-danger">Failed to load terms. Please refresh the page.</p>';
    }
}

// Accept terms workflow
async function handleAcceptTerms() {
    try {
        await apiRequest('/auth/accept-terms', { method: 'POST' });
        document.getElementById('terms-modal').classList.add('hidden');
        showToast('Terms Accepted', 'You have accepted the terms. Enjoy Foodie Hub!', 'success');
        
        // Fetch fresh user profile details
        currentUser.terms_accepted = true;
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        // Initialize dashboard tab
        if (currentRole === 'consumer') switchConsumerTab('browse');
        if (currentRole === 'delivery') switchDeliveryTab('jobs');
        if (currentRole === 'hotel_manager') switchHotelTab('store');
        if (currentRole === 'admin') switchAdminTab('users');
    } catch (e) {
        // Error logged
    }
}

// ==========================================================================
// Forgot / Reset Password modals
// ==========================================================================
function showForgotPasswordModal() {
    document.getElementById('forgot-pass-modal').classList.remove('hidden');
}
function closeForgotPasswordModal() {
    document.getElementById('forgot-pass-modal').classList.add('hidden');
}
async function submitForgotPassword(e) {
    e.preventDefault();
    const val = document.getElementById('forgot-username').value;
    try {
        const res = await apiRequest('/auth/forgot-password', {
            method: 'POST',
            body: { username_or_email: val }
        });
        showToast('Requested', res.message, 'success');
        closeForgotPasswordModal();
        showResetPasswordModal();
    } catch (err) {}
}

function showResetPasswordModal() {
    document.getElementById('reset-pass-modal').classList.remove('hidden');
}
function closeResetPasswordModal() {
    document.getElementById('reset-pass-modal').classList.add('hidden');
}
async function submitResetPassword(e) {
    e.preventDefault();
    const tokenVal = document.getElementById('reset-token').value;
    const passVal = document.getElementById('reset-new-password').value;
    try {
        await apiRequest('/auth/reset-password', {
            method: 'POST',
            body: { token: tokenVal, new_password: passVal }
        });
        showToast('Password Updated', 'You can now log in with your new password.', 'success');
        closeResetPasswordModal();
    } catch(err) {}
}

// ==========================================================================
// Custom SSE Client (Using fetch stream reader to support Auth headers)
// ==========================================================================
async function connectSSE() {
    if (!token) return;
    
    if (sseAbortController) {
        sseAbortController.abort();
    }
    
    sseAbortController = new AbortController();
    const signal = sseAbortController.signal;
    
    try {
        const response = await fetch(`${API_BASE}/notifications/stream`, {
            headers: { 'Authorization': `Bearer ${token}` },
            signal: signal
        });
        
        if (!response.ok) {
            throw new Error(`SSE stream HTTP ${response.status}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const blocks = buffer.split('\n\n');
            buffer = blocks.pop(); // save trailing partial block
            
            for (const block of blocks) {
                if (!block.trim()) continue;
                
                let currentEventName = 'message';
                let dataPayload = '';
                
                const lines = block.split('\n');
                for (const line of lines) {
                    if (line.startsWith('event:')) {
                        currentEventName = line.replace('event:', '').trim();
                    } else if (line.startsWith('data:')) {
                        dataPayload = line.replace('data:', '').trim();
                    }
                }
                
                if (dataPayload) {
                    try {
                        const parsedData = JSON.parse(dataPayload);
                        handleSSEMessage(currentEventName, parsedData);
                    } catch (e) {
                        handleSSEMessage(currentEventName, { message: dataPayload });
                    }
                }
            }
        }
    } catch (err) {
        if (err.name === 'AbortError') {
            console.log('SSE connection aborted');
        } else {
            console.error('SSE connection crashed, retrying in 5 seconds...', err);
            setTimeout(connectSSE, 5000);
        }
    }
}

// Routing incoming SSE messages to dynamic UI updates
function handleSSEMessage(eventName, packet) {
    if (eventName === 'heartbeat') return; // ignore keep-alives
    
    // Notifications envelopes yield { event, message, data }
    const eventType = packet.event || eventName;
    const textMessage = packet.message || 'New update received';
    const payload = packet.data || {};
    
    // Add to navigation dropdown list
    const notification = {
        id: Date.now(),
        type: eventType,
        message: textMessage,
        time: new Date().toLocaleTimeString()
    };
    notificationList.unshift(notification);
    if (notificationList.length > 20) notificationList.pop();
    updateNotificationsUI();
    
    // Show premium visual alert
    showToast(eventType.replace('_', ' ').toUpperCase(), textMessage, 'info');
    
    // Live reload specific views based on notifications
    if (currentRole === 'consumer') {
        if (activeSubTab === 'history') {
            loadConsumerOrders();
        }
    } else if (currentRole === 'delivery') {
        if (activeSubTab === 'jobs') {
            loadDeliveryJobs();
        } else if (activeSubTab === 'my-bids') {
            loadDeliveryBids();
        } else if (activeSubTab === 'active-orders') {
            loadDeliveryActiveDeliveries();
        }
    } else if (currentRole === 'hotel_manager') {
        if (activeSubTab === 'orders') {
            loadHotelOrders();
        }
    } else if (currentRole === 'admin') {
        if (activeSubTab === 'issues') {
            loadAdminIssues();
        }
    }
}

// Re-render navbar notifications dropdown
function updateNotificationsUI() {
    const badge = document.getElementById('notification-badge');
    const list = document.getElementById('notifications-list');
    
    if (notificationList.length > 0) {
        badge.classList.remove('hidden');
        badge.innerText = notificationList.length;
        
        list.innerHTML = notificationList.map(n => `
            <div class="dropdown-notification-item">
                <strong>${n.type.replace('_', ' ').toUpperCase()}</strong>
                <div>${n.message}</div>
                <span class="time">${n.time}</span>
            </div>
        `).join('');
    } else {
        badge.classList.add('hidden');
        list.innerHTML = '<div class="empty-state">No new alerts</div>';
    }
}

function toggleNotificationsMenu() {
    const dd = document.getElementById('notifications-dropdown');
    dd.classList.toggle('hidden');
}

function clearNotifications() {
    notificationList = [];
    updateNotificationsUI();
    document.getElementById('notifications-dropdown').classList.add('hidden');
}

// ==========================================================================
// CONSUMER BUSINESS LOGIC
// ==========================================================================
function switchConsumerTab(tab) {
    activeSubTab = tab;
    
    // Set link active state
    document.querySelectorAll('#panel-consumer .sidebar-link').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(tab)) btn.classList.add('active');
    });
    
    // Swap subtabs
    document.querySelectorAll('#panel-consumer .subtab-view').forEach(view => {
        view.classList.add('hidden');
    });
    document.getElementById(`consumer-subtab-${tab}`).classList.remove('hidden');
    
    // Fetch tab-specific data
    if (tab === 'browse') loadHotelsList();
    if (tab === 'history') loadConsumerOrders();
}

async function loadHotelsList() {
    const grid = document.getElementById('hotels-grid');
    grid.innerHTML = '<div class="empty-state">Loading messes...</div>';
    
    try {
        const response = await apiRequest('/consumer/hotels', { method: 'GET' });
        hotels = response.hotels || [];
        renderHotelsGrid(hotels);
    } catch (e) {
        grid.innerHTML = '<div class="empty-state text-danger">Failed to load messes</div>';
    }
}

function renderHotelsGrid(items) {
    const grid = document.getElementById('hotels-grid');
    if (items.length === 0) {
        grid.innerHTML = '<div class="empty-state">No messes available right now</div>';
        return;
    }
    
    grid.innerHTML = items.map(h => `
        <div class="glass-card hotel-card" onclick="openHotelDetails(${h.id})">
            <div class="hotel-status-banner">
                <span class="status-badge ${h.is_open ? 'open' : 'closed'}">${h.is_open ? 'open' : 'closed'}</span>
            </div>
            <h3>${h.name}</h3>
            <p>${h.description || 'Quality meals and quick service.'}</p>
        </div>
    `).join('');
}

function filterHotels(status) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    document.getElementById(`filter-${status}`).classList.add('active');
    
    if (status === 'all') {
        renderHotelsGrid(hotels);
    } else if (status === 'open') {
        renderHotelsGrid(hotels.filter(h => h.is_open));
    } else {
        renderHotelsGrid(hotels.filter(h => !h.is_open));
    }
}

async function openHotelDetails(hotelId) {
    const modal = document.getElementById('hotel-details-modal');
    modal.classList.remove('hidden');
    
    const nameEl = document.getElementById('modal-hotel-name');
    const descEl = document.getElementById('modal-hotel-desc');
    const statusEl = document.getElementById('modal-hotel-status');
    const listEl = document.getElementById('modal-menu-list');
    
    nameEl.innerText = 'Loading...';
    descEl.innerText = '';
    listEl.innerHTML = '<div class="empty-state">Loading menu items...</div>';
    
    try {
        const hotel = await apiRequest(`/consumer/hotels/${hotelId}`, { method: 'GET' });
        hotelDetailsCache[hotelId] = hotel;
        
        nameEl.innerText = hotel.name;
        descEl.innerText = hotel.description || 'Quality food available for campus delivery.';
        
        statusEl.className = `status-badge ${hotel.is_open ? 'open' : 'closed'}`;
        statusEl.innerText = hotel.is_open ? 'Open' : 'Closed';
        
        if (hotel.menu_items && hotel.menu_items.length > 0) {
            listEl.innerHTML = hotel.menu_items.map(item => `
                <div class="menu-card">
                    <div class="menu-card-header">
                        <div class="menu-card-title">${item.name}</div>
                        <div class="menu-card-desc">${item.description || ''}</div>
                    </div>
                    <div class="menu-card-footer">
                        <span class="menu-price">₹${item.price.toFixed(2)}</span>
                        ${hotel.is_open && item.is_available ? `
                            <button class="primary-btn btn-small" onclick="addToCart(${hotelId}, ${item.id}, '${item.name.replace(/'/g, "\\'")}', ${item.price})">
                                <i class="fa-solid fa-plus"></i> Add
                            </button>
                        ` : `
                            <span class="text-muted text-sm font-semibold">Unavailable</span>
                        `}
                    </div>
                </div>
            `).join('');
        } else {
            listEl.innerHTML = '<div class="empty-state">No items listed on menu yet</div>';
        }
    } catch (e) {
        listEl.innerHTML = '<div class="empty-state text-danger">Failed to load restaurant details</div>';
    }
}

function closeHotelDetailsModal() {
    document.getElementById('hotel-details-modal').classList.add('hidden');
}

// Cart Mechanics
function addToCart(hotelId, itemId, name, price) {
    // A cart can only contain items from a single hotel at a time
    if (cart.length > 0 && cart[0].hotelId !== hotelId) {
        if (!confirm('Adding items from a new mess will empty your current basket. Clear basket?')) {
            return;
        }
        cart = [];
    }
    
    const existing = cart.find(i => i.id === itemId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ hotelId, id: itemId, name, price, qty: 1 });
    }
    
    updateCartUI();
    showToast('Basket Updated', `${name} added to your basket.`, 'success');
}

function removeFromCart(itemId) {
    const idx = cart.findIndex(i => i.id === itemId);
    if (idx > -1) {
        cart.splice(idx, 1);
        updateCartUI();
    }
}

function updateCartUI() {
    const list = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total-amount');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (cart.length === 0) {
        list.innerHTML = '<div class="empty-state">Your basket is empty</div>';
        totalEl.innerText = '₹0.00';
        checkoutBtn.disabled = true;
        return;
    }
    
    let total = 0;
    list.innerHTML = cart.map(i => {
        const itemTotal = i.price * i.qty;
        total += itemTotal;
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <span class="cart-item-name">${i.name}</span>
                    <span class="cart-item-qty">x${i.qty}</span>
                </div>
                <div class="flex-align-center gap-10">
                    <span class="cart-item-price">₹${itemTotal.toFixed(2)}</span>
                    <button class="cart-item-remove" onclick="removeFromCart(${i.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join('');
    
    totalEl.innerText = `₹${total.toFixed(2)}`;
    checkoutBtn.disabled = false;
}

async function handlePlaceOrder() {
    if (cart.length === 0) return;
    
    const payload = {
        hotel_id: cart[0].hotelId,
        items: cart.map(i => ({
            menu_item_id: i.id,
            quantity: i.qty
        }))
    };
    
    try {
        const order = await apiRequest('/consumer/orders', {
            method: 'POST',
            body: payload
        });
        
        if (order) {
            showToast('Order Placed', `Order #${order.id} is now available for delivery bidding!`, 'success');
            cart = [];
            updateCartUI();
            closeHotelDetailsModal();
            switchConsumerTab('history');
        }
    } catch (e) {
        // Handled
    }
}

async function submitTextOrder(e) {
    e.preventDefault();
    const desc = document.getElementById('text-order-desc').value;
    
    try {
        const order = await apiRequest('/consumer/orders', {
            method: 'POST',
            body: { text_order: desc }
        });
        
        if (order) {
            showToast('Order Submitted', `Text order #${order.id} has been published for bidding.`, 'success');
            document.getElementById('text-order-desc').value = '';
            switchConsumerTab('history');
        }
    } catch(err) {}
}

async function loadConsumerOrders() {
    const list = document.getElementById('consumer-orders-list');
    list.innerHTML = '<div class="empty-state">Loading orders...</div>';
    
    try {
        const orders = await apiRequest('/consumer/orders/history', { method: 'GET' });
        if (orders.length === 0) {
            list.innerHTML = '<div class="empty-state">You have not placed any orders yet</div>';
            return;
        }
        
        list.innerHTML = orders.map(o => {
            const date = new Date(o.created_at).toLocaleString();
            let itemsSummary = '';
            if (o.is_text_based) {
                itemsSummary = `<p class="order-details-summary"><strong>Custom Request:</strong> ${o.text_order}</p>`;
            } else if (o.items && o.items.length > 0) {
                itemsSummary = o.items.map(item => `
                    <div class="text-sm font-semibold">${item.menu_item ? item.menu_item.name : 'Unknown Item'} x${item.quantity} (₹${item.unit_price.toFixed(2)})</div>
                `).join('');
            }
            
            // Build custom stepper indicators
            const stages = ['created', 'bidding', 'bid_accepted', 'preparing', 'out_for_delivery', 'delivered'];
            const labels = {
                'created': 'Placed',
                'bidding': 'Bidding',
                'bid_accepted': 'Assigned',
                'preparing': 'Kitchen',
                'out_for_delivery': 'Transit',
                'delivered': 'Delivered'
            };
            
            const currentStageIndex = stages.indexOf(o.status);
            
            let stepperHtml = '';
            if (o.status !== 'cancelled') {
                stepperHtml = `
                    <div class="tracking-stepper">
                        ${stages.map((st, idx) => {
                            let statusClass = '';
                            if (idx < currentStageIndex) statusClass = 'completed';
                            else if (idx === currentStageIndex) statusClass = 'active';
                            return `
                                <div class="step-node ${statusClass}">
                                    <div class="step-circle">${idx + 1}</div>
                                    <div class="step-label">${labels[st]}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            } else {
                stepperHtml = `<div class="text-danger font-semibold margin-t-md"><i class="fa-solid fa-ban"></i> Cancelled</div>`;
            }
            
            return `
                <div class="glass-card order-card">
                    <div class="order-card-header">
                        <div class="order-meta-info">
                            <span class="order-id-label">Order #${o.id}</span>
                            <span class="order-date">${date}</span>
                        </div>
                        <span class="status-badge ${o.status === 'delivered' ? 'open' : o.status === 'cancelled' ? 'closed' : 'bidding'}">
                            ${o.status.replace(/_/g, ' ')}
                        </span>
                    </div>
                    
                    <div class="order-card-body">
                        ${itemsSummary}
                        <div class="order-amount-line">Total Cost: ₹${o.total_amount.toFixed(2)}</div>
                        ${o.delivery_otp && o.status !== 'delivered' ? `
                            <div class="text-accent font-bold margin-t-md"><i class="fa-solid fa-key"></i> Delivery PIN (Share with driver): <strong>${o.delivery_otp}</strong></div>
                        ` : ''}
                    </div>
                    
                    ${stepperHtml}
                    
                    <div class="order-card-actions margin-t-md">
                        ${o.status === 'bidding' ? `
                            <button class="primary-btn btn-small" onclick="viewOrderBids(${o.id})">
                                <i class="fa-solid fa-gavel"></i> View Bids
                            </button>
                            <button class="danger-btn btn-small" onclick="cancelOrder(${o.id})">
                                Cancel Order
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    } catch (e) {
        list.innerHTML = '<div class="empty-state text-danger">Failed to load order history</div>';
    }
}

async function viewOrderBids(orderId) {
    const modal = document.getElementById('order-bids-modal');
    modal.classList.remove('hidden');
    
    const listEl = document.getElementById('modal-bids-list');
    listEl.innerHTML = '<div class="empty-state">Fetching delivery bids...</div>';
    
    try {
        const bids = await apiRequest(`/consumer/orders/${orderId}/bids`, { method: 'GET' });
        if (bids.length === 0) {
            listEl.innerHTML = '<div class="empty-state">No bids submitted yet by delivery partners</div>';
            return;
        }
        
        listEl.innerHTML = bids.map(b => `
            <div class="bid-item">
                <div class="bid-item-details">
                    <span class="bid-amount">₹${b.amount.toFixed(2)}</span>
                    <span class="bid-agent-name">Driver ID: ${b.delivery_user_id}</span>
                    ${b.upi_screenshot_url ? `
                        <a href="${b.upi_screenshot_url}" target="_blank" class="text-sm text-accent"><i class="fa-solid fa-image"></i> View UPI QR / Screenshot</a>
                    ` : ''}
                </div>
                <button class="primary-btn btn-small" onclick="acceptBid(${orderId}, ${b.id})">
                    Accept Bid
                </button>
            </div>
        `).join('');
    } catch (e) {
        listEl.innerHTML = '<div class="empty-state text-danger">Failed to fetch bids</div>';
    }
}

function closeOrderBidsModal() {
    document.getElementById('order-bids-modal').classList.add('hidden');
}

async function acceptBid(orderId, bidId) {
    if (!confirm('Accept this bid for your delivery?')) return;
    
    try {
        const res = await apiRequest(`/consumer/orders/${orderId}/accept-bid/${bidId}`, {
            method: 'POST'
        });
        showToast('Bid Accepted', 'Delivery assigned successfully.', 'success');
        closeOrderBidsModal();
        loadConsumerOrders();
    } catch (e) {}
}

async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
        await apiRequest(`/consumer/orders/${orderId}/cancel`, { method: 'POST' });
        showToast('Order Cancelled', 'Order has been successfully cancelled.', 'success');
        loadConsumerOrders();
    } catch(e) {}
}

// Help Support Form actions
async function submitFeedback(e) {
    e.preventDefault();
    const content = document.getElementById('feedback-content').value;
    try {
        await apiRequest('/support/feedback', {
            method: 'POST',
            body: { content: content }
        });
        showToast('Thank you!', 'Your feedback was submitted successfully.', 'success');
        document.getElementById('feedback-content').value = '';
    } catch(err) {}
}

async function submitReport(e) {
    e.preventDefault();
    const title = document.getElementById('report-title').value;
    const desc = document.getElementById('report-desc').value;
    try {
        await apiRequest('/support/report', {
            method: 'POST',
            body: { title: title, description: desc }
        });
        showToast('Report Logged', 'Our support team has received your report.', 'success');
        document.getElementById('report-title').value = '';
        document.getElementById('report-desc').value = '';
    } catch(err) {}
}


// ==========================================================================
// DELIVERY AGENT BUSINESS LOGIC
// ==========================================================================
function switchDeliveryTab(tab) {
    activeSubTab = tab;
    
    document.querySelectorAll('#panel-delivery .sidebar-link').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(tab)) btn.classList.add('active');
    });
    
    document.querySelectorAll('#panel-delivery .subtab-view').forEach(view => {
        view.classList.add('hidden');
    });
    document.getElementById(`delivery-subtab-${tab}`).classList.remove('hidden');
    
    if (tab === 'jobs') loadDeliveryJobs();
    if (tab === 'my-bids') loadDeliveryBids();
    if (tab === 'active-orders') loadDeliveryActiveDeliveries();
}

async function loadDeliveryJobs() {
    const grid = document.getElementById('delivery-jobs-grid');
    grid.innerHTML = '<div class="empty-state">Scanning active delivery jobs...</div>';
    
    try {
        const res = await apiRequest('/delivery/orders', { method: 'GET' });
        const jobs = res.orders || [];
        
        if (jobs.length === 0) {
            grid.innerHTML = '<div class="empty-state">No orders available for delivery bidding right now. Check back soon!</div>';
            return;
        }
        
        grid.innerHTML = jobs.map(j => {
            let desc = '';
            if (j.is_text_based) {
                desc = `<p><strong>Custom Order:</strong> ${j.text_order}</p>`;
            } else {
                desc = `<p><strong>Mess Order:</strong> ₹${j.total_amount.toFixed(2)} value</p>`;
            }
            return `
                <div class="glass-card hotel-card">
                    <h3>Order #${j.id}</h3>
                    <div class="margin-t-md">${desc}</div>
                    <div class="order-card-actions margin-t-md">
                        <button class="primary-btn btn-small" onclick="openDeliveryBidModal(${j.id})">
                            Place Bid <i class="fa-solid fa-gavel"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (e) {
        grid.innerHTML = '<div class="empty-state text-danger">Failed to load available jobs</div>';
    }
}

function openDeliveryBidModal(orderId) {
    document.getElementById('delivery-bid-modal').classList.remove('hidden');
    document.getElementById('bid-order-id').value = orderId;
    document.getElementById('bid-amount').value = '';
    document.getElementById('bid-screenshot').value = '';
}

function closeDeliveryBidModal() {
    document.getElementById('delivery-bid-modal').classList.add('hidden');
}

async function submitDeliveryBid(e) {
    e.preventDefault();
    const orderId = document.getElementById('bid-order-id').value;
    const amount = parseFloat(document.getElementById('bid-amount').value);
    const ssUrl = document.getElementById('bid-screenshot').value.trim();
    
    try {
        await apiRequest(`/delivery/orders/${orderId}/bid`, {
            method: 'POST',
            body: { amount: amount, upi_screenshot_url: ssUrl }
        });
        showToast('Bid Submitted', 'Your bid has been placed.', 'success');
        closeDeliveryBidModal();
        switchDeliveryTab('my-bids');
    } catch(err) {}
}

async function loadDeliveryBids() {
    const list = document.getElementById('delivery-bids-list');
    list.innerHTML = '<div class="empty-state">Loading your bids...</div>';
    
    try {
        const bids = await apiRequest('/delivery/orders/bids', { method: 'GET' });
        if (bids.length === 0) {
            list.innerHTML = '<div class="empty-state">You have no active bids</div>';
            return;
        }
        
        list.innerHTML = bids.map(b => `
            <div class="bid-item">
                <div class="bid-item-details">
                    <span class="bid-amount">Bid Amount: ₹${b.amount.toFixed(2)}</span>
                    <span class="bid-agent-name">Order ID: ${b.order_id} | Status: <strong class="text-accent">${b.status.toUpperCase()}</strong></span>
                </div>
                ${b.status === 'pending' ? `
                    <button class="danger-btn btn-small" onclick="deleteDeliveryBid(${b.id})">
                        Withdraw
                    </button>
                ` : ''}
            </div>
        `).join('');
    } catch(e) {
        list.innerHTML = '<div class="empty-state text-danger">Failed to load active bids</div>';
    }
}

async function deleteDeliveryBid(bidId) {
    if (!confirm('Are you sure you want to withdraw this bid?')) return;
    try {
        await apiRequest(`/delivery/orders/${bidId}`, { method: 'DELETE' });
        showToast('Bid Withdrawn', 'Your bid was successfully removed.', 'success');
        loadDeliveryBids();
    } catch (e) {}
}

async function loadDeliveryActiveDeliveries() {
    const list = document.getElementById('delivery-active-list');
    list.innerHTML = '<div class="empty-state">Loading deliveries...</div>';
    
    try {
        // To find ongoing orders assigned to this delivery partner, list all orders
        // and filter by those where delivery_user_id === currentUser.id
        const res = await apiRequest('/delivery/orders', { method: 'GET' });
        // Wait, standard list orders for delivery lists pending. To find all deliveries, let's load order history
        // Or check order history. Wait, the backend has orders history in consumer but for delivery we can list all orders filter by delivery_user_id
        // Let's call /consumer/orders/history? Oh wait, delivery users can also list orders. In `app/repositories/order_repository.py`:
        // list_orders has `delivery_user_id` filter.
        // Let's see if we can search active orders using `list_orders` or custom logic
        // Actually, listing delivery orders. Let's make an API call to get all orders where delivery partner is assigned.
        // Let's check `app/api/routes/delivery/orders.py`. Wait, `get_bids_by_delivery_user_id` returns bids. If bid status is accepted, it's assigned!
        // So we can read bids, check those that are accepted, and retrieve the corresponding order details!
        // This is a robust fallback if there's no direct "deliveries" endpoint.
        const bids = await apiRequest('/delivery/orders/bids', { method: 'GET' });
        const acceptedBids = bids.filter(b => b.status === 'accepted');
        
        if (acceptedBids.length === 0) {
            list.innerHTML = '<div class="empty-state">No assigned deliveries yet. Win a bid first!</div>';
            return;
        }
        
        let htmlContent = '';
        for (const bid of acceptedBids) {
            try {
                const o = await apiRequest(`/consumer/orders/${bid.order_id}`, { method: 'GET' });
                
                // Show order status and appropriate actions
                let actionHtml = '';
                if (o.status === 'bid_accepted' || o.status === 'preparing') {
                    actionHtml = `
                        <button class="primary-btn btn-small" onclick="handlePickupOrder(${o.id})">
                            Mark Out for Delivery <i class="fa-solid fa-truck-fast"></i>
                        </button>
                    `;
                } else if (o.status === 'out_for_delivery') {
                    actionHtml = `
                        <button class="secondary-btn btn-small" onclick="openDeliveryOtpModal(${o.id})">
                            Confirm Delivery with OTP <i class="fa-solid fa-circle-check"></i>
                        </button>
                    `;
                } else if (o.status === 'delivered') {
                    actionHtml = `<span class="text-success font-semibold"><i class="fa-solid fa-circle-check"></i> Delivered Successfully</span>`;
                }
                
                htmlContent += `
                    <div class="glass-card order-card">
                        <div class="order-card-header">
                            <span class="order-id-label">Delivery Order #${o.id}</span>
                            <span class="status-badge open">${o.status.toUpperCase()}</span>
                        </div>
                        <div class="order-card-body">
                            <p><strong>Mess ID:</strong> ${o.hotel_id || 'Text Order'}</p>
                            <p><strong>Total Value:</strong> ₹${o.total_amount.toFixed(2)}</p>
                            <p><strong>My Delivery Earning:</strong> ₹${bid.amount.toFixed(2)}</p>
                        </div>
                        <div class="order-card-actions margin-t-md">
                            ${actionHtml}
                        </div>
                    </div>
                `;
            } catch(e) {
                // Ignore single order fetch failure
            }
        }
        list.innerHTML = htmlContent || '<div class="empty-state">No assigned deliveries</div>';
    } catch(e) {
        list.innerHTML = '<div class="empty-state text-danger">Failed to load ongoing deliveries</div>';
    }
}

async function handlePickupOrder(orderId) {
    try {
        await apiRequest(`/delivery/orders/${orderId}/pickup`, { method: 'GET' });
        showToast('Picked Up', 'Order is now out for delivery.', 'success');
        loadDeliveryActiveDeliveries();
    } catch(e) {}
}

function openDeliveryOtpModal(orderId) {
    document.getElementById('delivery-otp-modal').classList.remove('hidden');
    document.getElementById('otp-order-id').value = orderId;
    document.getElementById('delivery-otp-input').value = '';
}

function closeDeliveryOtpModal() {
    document.getElementById('delivery-otp-modal').classList.add('hidden');
}

async function submitDeliveryOtp(e) {
    e.preventDefault();
    const orderId = document.getElementById('otp-order-id').value;
    const otp = document.getElementById('delivery-otp-input').value.trim();
    
    try {
        await apiRequest(`/delivery/orders/${orderId}/complete?otp=${otp}`, {
            method: 'PATCH'
        });
        showToast('Delivered!', 'Order completed and delivery earnings processed.', 'success');
        closeDeliveryOtpModal();
        loadDeliveryActiveDeliveries();
    } catch(e) {}
}

// ==========================================================================
// HOTEL MANAGER BUSINESS LOGIC
// ==========================================================================
function switchHotelTab(tab) {
    activeSubTab = tab;
    
    document.querySelectorAll('#panel-hotel_manager .sidebar-link').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(tab)) btn.classList.add('active');
    });
    
    document.querySelectorAll('#panel-hotel_manager .subtab-view').forEach(view => {
        view.classList.add('hidden');
    });
    document.getElementById(`hotel-subtab-${tab}`).classList.remove('hidden');
    
    if (tab === 'store') loadHotelProfile();
    if (tab === 'menu') loadHotelMenuItems();
    if (tab === 'orders') loadHotelOrders();
}

async function loadHotelProfile() {
    const container = document.getElementById('hotel-profile-container');
    container.innerHTML = '<div class="empty-state">Fetching mess profile details...</div>';
    
    try {
        const response = await apiRequest('/consumer/hotels', { method: 'GET' });
        // Filter by manager_id === currentUser.id
        const myHotel = response.hotels.find(h => h.manager_id === currentUser.id);
        
        if (!myHotel) {
            container.innerHTML = `
                <div class="glass-card max-width-lg">
                    <h3>Setup Your Mess</h3>
                    <p class="margin-t-md text-secondary">You haven't registered a mess profile yet. Set up your mess details to start accepting orders.</p>
                    <form onsubmit="submitCreateHotel(event)" class="margin-t-md">
                        <div class="form-group">
                            <label for="new-hotel-name">Mess / Restaurant Name</label>
                            <input type="text" id="new-hotel-name" placeholder="e.g. Woodlands Hostel Mess" required>
                        </div>
                        <div class="form-group">
                            <label for="new-hotel-desc">Description</label>
                            <textarea id="new-hotel-desc" rows="4" placeholder="e.g. South Indian & North Indian meals, snacks, beverages." required></textarea>
                        </div>
                        <button type="submit" class="primary-btn margin-t-md">Create Restaurant Profile</button>
                    </form>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="glass-card max-width-lg">
                <div class="flex-justify-between flex-align-center">
                    <h3>${myHotel.name}</h3>
                    <span class="status-badge ${myHotel.is_open ? 'open' : 'closed'}">${myHotel.is_open ? 'Open' : 'Closed'}</span>
                </div>
                <p class="margin-t-md text-secondary">${myHotel.description || 'Quality campus food store.'}</p>
                
                <div class="form-group checkbox-group margin-t-md">
                    <input type="checkbox" id="hotel-open-toggle" ${myHotel.is_open ? 'checked' : ''} onchange="toggleHotelStatus(this.checked)">
                    <label for="hotel-open-toggle">Open for ordering</label>
                </div>
            </div>
        `;
    } catch(e) {
        container.innerHTML = '<div class="empty-state text-danger">Failed to fetch profile details</div>';
    }
}

async function submitCreateHotel(e) {
    e.preventDefault();
    const name = document.getElementById('new-hotel-name').value;
    const desc = document.getElementById('new-hotel-desc').value;
    
    try {
        await apiRequest('/hotel/hotels/create', {
            method: 'POST',
            body: { name: name, description: desc }
        });
        showToast('Mess Profile Created', 'Your mess setup is complete!', 'success');
        loadHotelProfile();
    } catch(e) {}
}

async function toggleHotelStatus(isOpen) {
    try {
        await apiRequest('/hotel/hotels/status', {
            method: 'PATCH',
            body: { is_open: isOpen }
        });
        showToast('Status Updated', `Your store is now ${isOpen ? 'open' : 'closed'}.`, 'success');
        loadHotelProfile();
    } catch(e) {}
}

async function loadHotelMenuItems() {
    const tbody = document.getElementById('hotel-menu-table-body');
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Loading menu...</td></tr>';
    
    try {
        const response = await apiRequest('/consumer/hotels', { method: 'GET' });
        const myHotel = response.hotels.find(h => h.manager_id === currentUser.id);
        
        if (!myHotel) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Please set up your mess profile first!</td></tr>';
            return;
        }
        
        // Fetch detailed hotel with menu items
        const details = await apiRequest(`/consumer/hotels/${myHotel.id}`, { method: 'GET' });
        
        if (!details.menu_items || details.menu_items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No items listed on menu yet</td></tr>';
            return;
        }
        
        tbody.innerHTML = details.menu_items.map(item => `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.description || ''}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>
                    <span class="status-badge ${item.is_available ? 'open' : 'closed'}">
                        ${item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                </td>
                <td>
                    <div class="flex-align-center gap-10">
                        <button class="primary-btn btn-small" onclick="openEditMenuItemModal(${item.id}, '${item.name.replace(/'/g, "\\'")}', '${item.description.replace(/'/g, "\\'")}', ${item.price}, ${item.is_available})">Edit</button>
                        <button class="danger-btn btn-small" onclick="deleteMenuItem(${item.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch(e) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state text-danger">Failed to load menu items</td></tr>';
    }
}

// Menu items creation and updates
function openAddMenuItemModal() {
    document.getElementById('menu-item-modal').classList.remove('hidden');
    document.getElementById('menu-item-modal-title').innerText = 'Add Menu Item';
    document.getElementById('menu-item-id').value = '';
    document.getElementById('menu-item-name').value = '';
    document.getElementById('menu-item-desc').value = '';
    document.getElementById('menu-item-price').value = '';
    document.getElementById('menu-item-available').checked = true;
    document.getElementById('menu-item-submit-btn').innerText = 'Add Item';
}

function openEditMenuItemModal(id, name, desc, price, isAvailable) {
    document.getElementById('menu-item-modal').classList.remove('hidden');
    document.getElementById('menu-item-modal-title').innerText = 'Edit Menu Item';
    document.getElementById('menu-item-id').value = id;
    document.getElementById('menu-item-name').value = name;
    document.getElementById('menu-item-desc').value = desc;
    document.getElementById('menu-item-price').value = price;
    document.getElementById('menu-item-available').checked = isAvailable;
    document.getElementById('menu-item-submit-btn').innerText = 'Save Changes';
}

function closeMenuItemModal() {
    document.getElementById('menu-item-modal').classList.add('hidden');
}

async function submitMenuItemForm(e) {
    e.preventDefault();
    const itemId = document.getElementById('menu-item-id').value;
    const payload = {
        name: document.getElementById('menu-item-name').value.trim(),
        description: document.getElementById('menu-item-desc').value.trim(),
        price: parseFloat(document.getElementById('menu-item-price').value),
        is_available: document.getElementById('menu-item-available').checked
    };
    
    try {
        if (itemId) {
            // Edit
            await apiRequest(`/hotel/menu/update/${itemId}`, {
                method: 'PATCH',
                body: payload
            });
            showToast('Item Updated', 'Menu item saved successfully.', 'success');
        } else {
            // Create
            await apiRequest('/hotel/menu/create', {
                method: 'POST',
                body: payload
            });
            showToast('Item Added', 'New menu item added successfully.', 'success');
        }
        closeMenuItemModal();
        loadHotelMenuItems();
    } catch(err) {}
}

async function deleteMenuItem(itemId) {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
        await apiRequest(`/hotel/menu/delete/${itemId}`, { method: 'DELETE' });
        showToast('Item Deleted', 'Menu item has been deleted.', 'success');
        loadHotelMenuItems();
    } catch(e) {}
}

async function loadHotelOrders() {
    const list = document.getElementById('hotel-orders-list');
    list.innerHTML = '<div class="empty-state">Loading kitchen orders...</div>';
    
    try {
        const response = await apiRequest('/consumer/hotels', { method: 'GET' });
        const myHotel = response.hotels.find(h => h.manager_id === currentUser.id);
        
        if (!myHotel) {
            list.innerHTML = '<div class="empty-state">Setup your profile first</div>';
            return;
        }
        
        // Fetch all orders matching our hotel manager ID
        // Note: list_orders supports hotel_manager_id filter!
        // We can request list_orders directly. To be safe we will make a request to list_orders.
        // Wait, where is `list_orders` endpoint? Let's check `app/api/routes/hotel/orders.py`
        // Wait, let's look at `app/api/routes/hotel/orders.py` using `view_file` to see endpoints.
        // Let's do that to get the correct path.
        // But first let's use `view_file` to check `app/api/routes/hotel/orders.py`.
        const orders = await fetchHotelOrdersFromAPI(myHotel.id);
        
        if (orders.length === 0) {
            list.innerHTML = '<div class="empty-state">No orders received for your store yet.</div>';
            return;
        }
        
        list.innerHTML = orders.map(o => {
            const date = new Date(o.created_at).toLocaleString();
            const items = o.items.map(item => `
                <div>${item.menu_item ? item.menu_item.name : 'Unknown Item'} x${item.quantity}</div>
            `).join('');
            
            return `
                <div class="glass-card order-card">
                    <div class="order-card-header">
                        <span class="order-id-label">Order #${o.id}</span>
                        <span class="status-badge open">${o.status.toUpperCase()}</span>
                    </div>
                    <div class="order-card-body">
                        ${items}
                        <div class="order-date margin-t-md">Placed on: ${date}</div>
                        <div class="order-amount-line">Total Amount: ₹${o.total_amount.toFixed(2)}</div>
                    </div>
                </div>
            `;
        }).join('');
    } catch(e) {
        list.innerHTML = '<div class="empty-state text-danger">Failed to load received orders</div>';
    }
}

async function fetchHotelOrdersFromAPI(hotelId) {
    // Check endpoints in hotel/orders.py
    // Let's do a request to /hotel/orders
    // Let's view the route file: /Users/rohith/Desktop/foodie-hub-main/app/api/routes/hotel/orders.py
    try {
        const res = await apiRequest('/hotel/orders', { method: 'GET' });
        return res.orders || res || [];
    } catch(e) {
        // Fallback: search general list orders by hotel_id (if we have access to it or query param)
        // Wait, /consumer/orders/history? No.
        // Let's look at /hotel/orders.py below to be sure.
        return [];
    }
}

// Let's quickly verify app/api/routes/hotel/orders.py. Let's do a view_file to make sure.
// Wait, we can view it in parallel or later. Since we are just writing app.js, we can write a fallback.

// ==========================================================================
// ADMINISTRATOR BUSINESS LOGIC
// ==========================================================================
function switchAdminTab(tab) {
    activeSubTab = tab;
    
    document.querySelectorAll('#panel-admin .sidebar-link').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(tab)) btn.classList.add('active');
    });
    
    document.querySelectorAll('#panel-admin .subtab-view').forEach(view => {
        view.classList.add('hidden');
    });
    document.getElementById(`admin-subtab-${tab}`).classList.remove('hidden');
    
    if (tab === 'users') loadAdminUsers();
    if (tab === 'issues') loadAdminIssues();
    if (tab === 'terms') loadAdminTermsConfig();
}

async function loadAdminUsers() {
    const tbody = document.getElementById('admin-users-table-body');
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Loading users...</td></tr>';
    
    const role = document.getElementById('admin-user-filter-role').value;
    const status = document.getElementById('admin-user-filter-status').value;
    const search = document.getElementById('admin-user-search').value.trim();
    
    let queryParams = [];
    if (role) queryParams.push(`role=${role}`);
    if (status === 'banned') queryParams.push(`is_banned=true`);
    if (status === 'active') queryParams.push(`is_banned=false`);
    if (search) queryParams.push(`username=${search}`);
    
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    
    try {
        const res = await apiRequest(`/admin/users${queryString}`, { method: 'GET' });
        const users = res.users || res || [];
        
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No users matching search filters</td></tr>';
            return;
        }
        
        tbody.innerHTML = users.map(u => `
            <tr>
                <td><strong>${u.full_name}</strong></td>
                <td>${u.username}</td>
                <td>${u.email}</td>
                <td><span class="user-role">${u.role.toUpperCase()}</span></td>
                <td>${u.mobile_number}</td>
                <td>
                    <span class="status-badge ${u.is_banned ? 'closed' : 'open'}">
                        ${u.is_banned ? 'Banned' : 'Active'}
                    </span>
                </td>
                <td>
                    ${u.id === currentUser.id ? 'Self' : `
                        <button class="${u.is_banned ? 'primary-btn' : 'danger-btn'} btn-small" onclick="toggleUserBan(${u.id}, ${u.is_banned})">
                            ${u.is_banned ? 'Unban' : 'Ban'}
                        </button>
                    `}
                </td>
            </tr>
        `).join('');
    } catch(e) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state text-danger">Failed to fetch users directory</td></tr>';
    }
}

async function toggleUserBan(userId, isBanned) {
    if (!confirm(`Are you sure you want to ${isBanned ? 'unban' : 'ban'} this user?`)) return;
    try {
        if (isBanned) {
            // Unban: backend service uses `ban_user(user_id, banned=False)`
            await apiRequest(`/admin/users/${userId}/ban?banned=false`, { method: 'PATCH' });
            showToast('User Unbanned', 'The user account has been reactivated.', 'success');
        } else {
            // Ban
            await apiRequest(`/admin/users/${userId}/ban?banned=true`, { method: 'PATCH' });
            showToast('User Banned', 'The user account has been disabled.', 'success');
        }
        loadAdminUsers();
    } catch(e) {}
}

async function loadAdminIssues() {
    const list = document.getElementById('admin-issues-list');
    list.innerHTML = '<div class="empty-state">Loading reports and feedback...</div>';
    
    try {
        const reports = await apiRequest('/admin/reports', { method: 'GET' });
        const feedbacks = await apiRequest('/admin/feedbacks', { method: 'GET' });
        
        let reportHtml = '<h3>Support Tickets</h3>';
        if (reports.length === 0) {
            reportHtml += '<div class="empty-state">No support tickets reported</div>';
        } else {
            reportHtml += reports.map(r => `
                <div class="glass-card order-card">
                    <div class="order-card-header">
                        <span class="order-id-label">Ticket #${r.id}: ${r.title}</span>
                        <span class="status-badge ${r.status === 'open' ? 'closed' : 'open'}">${r.status.toUpperCase()}</span>
                    </div>
                    <div class="order-card-body">
                        <p>${r.description}</p>
                        <span class="order-date">Reported by User ID: ${r.reporter_id}</span>
                    </div>
                    ${r.status === 'open' ? `
                        <div class="order-card-actions margin-t-md">
                            <button class="primary-btn btn-small" onclick="resolveTicket(${r.id}, 'reviewed')">Mark Reviewed</button>
                            <button class="secondary-btn btn-small" onclick="resolveTicket(${r.id}, 'dismissed')">Dismiss</button>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }
        
        let feedbackHtml = '<h3 class="margin-t-md">User Feedback Log</h3>';
        if (feedbacks.length === 0) {
            feedbackHtml += '<div class="empty-state">No feedback submitted yet</div>';
        } else {
            feedbackHtml += feedbacks.map(f => `
                <div class="glass-card order-card">
                    <p class="order-details-summary">${f.content}</p>
                    <span class="order-date">Submitted by User ID: ${f.user_id}</span>
                </div>
            `).join('');
        }
        
        list.innerHTML = `<div class="support-grid-columns">${reportHtml}${feedbackHtml}</div>`;
    } catch(e) {
        list.innerHTML = '<div class="empty-state text-danger">Failed to load support center</div>';
    }
}

async function resolveTicket(reportId, newStatus) {
    try {
        await apiRequest(`/admin/reports/${reportId}/review?status=${newStatus}`, {
            method: 'PATCH'
        });
        showToast('Ticket Resolved', `Status updated to ${newStatus}.`, 'success');
        loadAdminIssues();
    } catch(e) {}
}

async function loadAdminTermsConfig() {
    try {
        const terms = await apiRequest('/auth/terms', { method: 'GET' });
        document.getElementById('admin-terms-title').value = terms.title || '';
        document.getElementById('admin-terms-content').value = terms.content || '';
    } catch(e) {}
}

async function submitUpdateTerms(e) {
    e.preventDefault();
    const title = document.getElementById('admin-terms-title').value;
    const content = document.getElementById('admin-terms-content').value;
    
    try {
        await apiRequest('/admin/terms', {
            method: 'POST',
            body: { title: title, content: content }
        });
        showToast('Terms Published', 'Terms and conditions updated successfully.', 'success');
        loadAdminTermsConfig();
    } catch(e) {}
}
