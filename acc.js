// Tab switching functionality
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabId}-tab`).classList.add('active');
    });
});

// ---- MODAL SYSTEM ----
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Закрытие по клику на overlay или кнопку ✕
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.classList.contains('close-modal')) {
            overlay.classList.remove('active');
        }
    });
});

// ---------- 1. MY ORDERS: детали заказа (всплывающее окно) ----------
document.querySelectorAll('.view-order-details').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const orderId = btn.getAttribute('data-order');
        let detailsHtml = '';
        if (orderId === 'KW-2024-001') {
            detailsHtml = `
                <div class="modal-order-item">
                    <div class="modal-order-header"><strong>Order ID:</strong> <span style="color:#488165;">KW-2024-001</span></div>
                    <div><strong>Date:</strong> March 15, 2024</div>
                    <div><strong>Status:</strong> <span style="color:#488165;">DELIVERED</span></div>
                    <div><strong>Items:</strong> Kawasaki Ninja H2 (x1)</div>
                    <div><strong>Total:</strong> $32,500.00</div>
                    <div><strong>Shipping address:</strong> 123 Racer Lane, Los Angeles, CA</div>
                    <div><strong>Tracking #:</strong> KAW-987654321</div>
                </div>
                <p style="margin-top:8px;">Your order was delivered on March 20, 2024. Enjoy the ride!</p>
            `;
        } else if (orderId === 'KW-2024-002') {
            detailsHtml = `
                <div class="modal-order-item">
                    <div class="modal-order-header"><strong>Order ID:</strong> <span style="color:#488165;">KW-2024-002</span></div>
                    <div><strong>Date:</strong> February 28, 2024</div>
                    <div><strong>Status:</strong> <span style="color:#ffc107;">SHIPPED</span></div>
                    <div><strong>Items:</strong> Kawasaki ZX-10R (x1), Kawasaki Helmet (x1)</div>
                    <div><strong>Total:</strong> $19,499.00</div>
                    <div><strong>Est. Delivery:</strong> March 5-7, 2024</div>
                </div>
                <button class="edit-profile-btn" style="width:100%; margin-top:10px;" onclick="alert('Tracking: UPS 1Z999...')">TRACK PACKAGE</button>
            `;
        }
        document.getElementById('orderModalBody').innerHTML = detailsHtml;
        openModal('orderModal');
    });
});

// ---------- 2. WISHLIST: детали из вишлиста (всплывающее окно) ----------
document.querySelectorAll('.view-wishlist-details').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemName = btn.getAttribute('data-item');
        let content = '';
        if (itemName === 'Ninja H2') {
            content = `
                <div class="modal-order-item">
                    <h3>🏍️ Kawasaki Ninja H2</h3>
                    <p>Supercharged 998cc engine, 310hp, aerodynamic winglets.</p>
                    <p><strong>Price:</strong> $32,500</p>
                    <p><strong>Added to wishlist:</strong> February 10, 2024</p>
                    <button class="edit-profile-btn" style="margin-top:12px;" onclick="alert('Ninja H2 added to cart!')">MOVE TO CART</button>
                </div>
            `;
        } else {
            content = `
                <div class="modal-order-item">
                    <h3>🏁 Kawasaki ZX-10R</h3>
                    <p>Racing ready, 200+ hp, advanced electronics, WorldSBK heritage.</p>
                    <p><strong>Price:</strong> $18,999</p>
                    <p><strong>Added to wishlist:</strong> January 28, 2024</p>
                    <button class="edit-profile-btn" style="margin-top:12px;" onclick="alert('ZX-10R added to cart!')">MOVE TO CART</button>
                </div>
            `;
        }
        document.getElementById('wishlistModalBody').innerHTML = content;
        openModal('wishlistModal');
    });
});

// ---------- 3. SETTINGS (настройки) всплывающее окно через кнопку MY ORDERS? НЕТ, но добавим отдельную логику: при клике на вкладку SETTINGS открывать МОДАЛКУ? 
// По заданию: кнопки MY ORDERS, WISHLIST, SETTINGS, EDIT PROFILE – как всплывающие. 
// Для SETTINGS создадим модалку, которая вызывается кликом на иконку настроек или отдельную кнопку. 
// Сделаем так, чтобы клик по вкладке SETTINGS (или по кнопке в табе?) открывал модалку настроек, 
// но также оставим возможность видеть основной контент. Чтобы не дублировать, сделаем отдельную кнопку "⚙️ Settings" над табами? 
// Но по заданию имеются в виду именно кнопки: MY ORDERS (уже детали заказа), WISHLIST (уже детали), SETTINGS (откроем модалку настроек) и EDIT PROFILE.

// Добавим для вкладки SETTINGS кнопку "Открыть настройки" внутри модалки, но чтобы было удобно: при клике на кнопку "SAVE CHANGES" (из вкладки) 
// мы показываем всплывающее окно с настройками? Нет, по требованию: кнопка SETTINGS должна открыть попап. 
// Создадим дополнительную плавающую кнопку? Но лучше: на странице уже есть табы, добавим отдельную кнопку возле EDIT PROFILE? 
// Более элегантно: добавим в правый верхний угол блока контента кнопку "⚙️ Settings popup". 
// Но так как пользователь ожидает, что все 4 кнопки (MY ORDERS, WISHLIST, SETTINGS, EDIT PROFILE) открывают окна, 
// мы сделаем так: при клике на любой элемент "VIEW DETAILS" (Orders) уже модалка, при клике на любой элемент вишлиста (ADD TO CART) – модалка с информацией, 
// для SETTINGS добавим отдельную кнопку в шапке или в блоке настроек, а для EDIT PROFILE – кнопка снизу профиля.

// Добавим кнопку "⚙️ SETTINGS POPUP" над карточкой настроек для чистоты.
const settingsCard = document.querySelector('.settings-card');
if (settingsCard && !document.getElementById('openSettingsModalBtn')) {
    const settingsPopupBtn = document.createElement('button');
    settingsPopupBtn.textContent = '⚙️ OPEN SETTINGS MODAL';
    settingsPopupBtn.className = 'edit-profile-btn';
    settingsPopupBtn.style.marginBottom = '20px';
    settingsPopupBtn.style.width = '100%';
    settingsPopupBtn.id = 'openSettingsModalBtn';
    settingsPopupBtn.addEventListener('click', () => openModal('settingsModal'));
    settingsCard.parentNode.insertBefore(settingsPopupBtn, settingsCard);
}

// Также при клике на кнопку SAVE CHANGES в модалке настроек
document.getElementById('modalSettingsSave')?.addEventListener('click', () => {
    alert('Settings preferences saved!');
    closeAllModals();
});

// ---------- 4. EDIT PROFILE (всплывающее окно) ----------
document.getElementById('editProfileBtn')?.addEventListener('click', () => {
    // Заполняем актуальными данными
    document.getElementById('modalFullName').value = 'Alex Rider';
    document.getElementById('modalEmail').value = 'alex.rider@example.com';
    document.getElementById('modalPhone').value = '+1 (555) 123-4567';
    document.getElementById('modalLocation').value = 'Los Angeles, CA';
    openModal('profileModal');
});

document.getElementById('saveProfileChanges')?.addEventListener('click', () => {
    const newName = document.getElementById('modalFullName').value;
    const newEmail = document.getElementById('modalEmail').value;
    const newPhone = document.getElementById('modalPhone').value;
    const newLocation = document.getElementById('modalLocation').value;
    
    // Обновляем отображаемые данные на странице
    document.querySelector('.profile-title h3').textContent = newName;
    document.querySelector('.welcome-text h3').textContent = newName;
    const infoRows = document.querySelectorAll('.info-value');
    if (infoRows[0]) infoRows[0].textContent = newName;
    if (infoRows[1]) infoRows[1].textContent = newEmail;
    if (infoRows[2]) infoRows[2].textContent = newPhone;
    if (infoRows[4]) infoRows[4].textContent = newLocation;
    
    alert('Profile updated successfully!');
    closeAllModals();
});

// Дополнительно: чтобы MY ORDERS во вкладке также отображали модалку при клике на "VIEW DETAILS" в каждой карточке.
// Это уже реализовано через .view-order-details. Также для WISHLIST (при клике на ADD TO CART модалка) - .view-wishlist-details.

console.log('Dashboard modals ready: MY ORDERS, WISHLIST, SETTINGS, EDIT PROFILE popups styled.');