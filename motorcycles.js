document.addEventListener('DOMContentLoaded', async () => {
    // Global state
    let hierarchy = { groups: [], series: [], categories: [] };
    let filters = { group: '', series: '', category: '', search: '', sort: 'name-asc', page: 1 };
    let allMotos = [];
    let currentMotos = [];

    // DOM Elements
    const grid = document.getElementById('motorcyclesGrid');
    const paginationDiv = document.getElementById('pagination');
    const emptyState = document.getElementById('emptyState');
    const resultsSpan = document.getElementById('resultsCount');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const sortSelect = document.getElementById('sortSelect');
    const resetAllBtn = document.getElementById('resetAllBtn');
    const resetEmptyBtn = document.getElementById('resetEmptyBtn');

    // ============================================
    // API FUNCTIONS - Fetch from Flask Backend
    // ============================================

    // Получить иерархию (группы → серии → категории)
    async function fetchHierarchy() {
        try {
            const response = await fetch('/api/motorcycles/hierarchy');
            if (!response.ok) throw new Error('Failed to fetch hierarchy');
            return await response.json();
        } catch (error) {
            console.error('Error fetching hierarchy:', error);
            return { groups: [], series: [], categories: [] };
        }
    }

    // Получить мотоциклы с фильтрацией, сортировкой и пагинацией
    async function fetchMotorcycles(params = {}) {
        try {
            const queryParams = new URLSearchParams({
                group: params.group || '',
                series: params.series || '',
                category: params.category || '',
                search: params.search || '',
                sort: params.sort || 'name-asc',
                page: params.page || 1,
                per_page: 12
            });
            
            const response = await fetch(`/api/motorcycles/list?${queryParams}`);
            if (!response.ok) throw new Error('Failed to fetch motorcycles');
            return await response.json();
        } catch (error) {
            console.error('Error fetching motorcycles:', error);
            return { motorcycles: [], total: 0, page: 1, pages: 1 };
        }
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    // Функция для генерации пути к изображению мотоцикла
    window.getMotorcycleImageUrl = function(motorcycle) {
        const name = typeof motorcycle === 'object' ? motorcycle.name : motorcycle;
        
        // Создаём "чистый" имя файла из названия мотоцикла
        let filename = name
            .toLowerCase()
            .replace(/\s+/g, '_')           // пробелы → подчёркивания
            .replace(/[^a-z0-9_]/g, '')     // удаляем спецсимволы
            .replace(/_+/g, '_');           // убираем дубли подчёркиваний
        
        return `/static/img/motorcycles/${filename}.png`;
    };

    // Рендер кнопок типов (групп)
    function renderGroups() {
        const container = document.getElementById('groupsList');
        if (!container) return;
        
        container.innerHTML = `<button class="h-btn active" data-type="group" data-value="">ALL TYPES</button>`;
        
        hierarchy.groups.forEach(group => {
            const btn = document.createElement('button');
            btn.className = 'h-btn';
            btn.dataset.type = 'group';
            btn.dataset.value = group.slug;
            btn.textContent = group.name;
            container.appendChild(btn);
        });
        
        attachFilterEvents();
    }

    // Рендер кнопок серий (на основе выбранной группы)
    function renderSeries(groupSlug) {
        const container = document.getElementById('seriesList');
        if (!container) return;
        
        container.innerHTML = `<button class="h-btn" data-type="series" data-value="">ALL SERIES</button>`;
        
        let filteredSeries = hierarchy.series;
        if (groupSlug) {
            const selectedGroup = hierarchy.groups.find(g => g.slug === groupSlug);
            if (selectedGroup) {
                filteredSeries = hierarchy.series.filter(s => s.group_id === selectedGroup.id);
            }
        }
        
        filteredSeries.forEach(series => {
            const btn = document.createElement('button');
            btn.className = 'h-btn';
            btn.dataset.type = 'series';
            btn.dataset.value = series.slug;
            btn.textContent = series.name;
            container.appendChild(btn);
        });
        
        const levelSeries = document.getElementById('level-series');
        if (levelSeries) levelSeries.classList.remove('hidden');
        
        attachFilterEvents();
    }

    // Рендер кнопок категорий (на основе выбранной серии)
    function renderCategories(seriesSlug) {
        const container = document.getElementById('categoriesList');
        if (!container) return;
        
        container.innerHTML = `<button class="h-btn" data-type="category" data-value="">ALL CATEGORIES</button>`;
        
        let filteredCategories = hierarchy.categories;
        if (seriesSlug) {
            const selectedSeries = hierarchy.series.find(s => s.slug === seriesSlug);
            if (selectedSeries) {
                filteredCategories = hierarchy.categories.filter(c => c.series_id === selectedSeries.id);
            }
        }
        
        filteredCategories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'h-btn';
            btn.dataset.type = 'category';
            btn.dataset.value = category.name;
            btn.textContent = category.name;
            container.appendChild(btn);
        });
        
        const levelCategories = document.getElementById('level-categories');
        if (levelCategories) levelCategories.classList.remove('hidden');
        
        attachFilterEvents();
    }

    function attachFilterEvents() {
        document.querySelectorAll('.h-btn').forEach(btn => {
            btn.removeEventListener('click', handleFilterClick);
            btn.addEventListener('click', handleFilterClick);
        });
    }

    function handleFilterClick(e) {
        const btn = e.currentTarget;
        const type = btn.dataset.type;
        const value = btn.dataset.value;

        if (type === 'group') {
            filters.group = value;
            filters.series = '';
            filters.category = '';
            
            const levelSeries = document.getElementById('level-series');
            const levelCategories = document.getElementById('level-categories');
            
            if (value) {
                renderSeries(value);
            } else {
                if (levelSeries) levelSeries.classList.add('hidden');
                if (levelCategories) levelCategories.classList.add('hidden');
            }
            if (levelCategories) levelCategories.classList.add('hidden');
        }
        
        if (type === 'series') {
            filters.series = value;
            filters.category = '';
            
            const levelCategories = document.getElementById('level-categories');
            if (value) {
                renderCategories(value);
            } else {
                if (levelCategories) levelCategories.classList.add('hidden');
            }
        }
        
        if (type === 'category') {
            filters.category = value;
        }
        
        // Обновляем активную кнопку
        document.querySelectorAll(`[data-type="${type}"]`).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        filters.page = 1;
        loadMotorcycles();
    }

    // ============================================
    // MAIN FUNCTIONS
    // ============================================

    async function loadMotorcycles() {
        if (grid) grid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading masterpieces...</p></div>';
        if (emptyState) emptyState.style.display = 'none';
        
        // Загружаем данные с сервера
        const data = await fetchMotorcycles(filters);
        const { motorcycles, total, page, pages } = data;
        
        if (resultsSpan) resultsSpan.innerText = total;
        
        if (motorcycles.length === 0) {
            if (grid) grid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            if (paginationDiv) paginationDiv.innerHTML = '';
            return;
        }
        
        if (grid) {
            grid.style.display = 'grid';
            renderMotorcycleCards(motorcycles);
        }
        if (emptyState) emptyState.style.display = 'none';
        renderPagination(page, pages);
    }

    function renderMotorcycleCards(motos) {
        if (!grid) return;
        grid.innerHTML = '';
        
        motos.forEach(m => {
            const card = document.createElement('div');
            card.className = 'moto-card';
            const imgUrl = window.getMotorcycleImageUrl(m);
            
            card.innerHTML = `
                <div class="moto-img">
                    <img src="${imgUrl}" alt="${m.name}" onerror="this.src='/static/img/motorcycles/placeholder.png'; this.onerror=null;">
                </div>
                <div class="moto-info">
                    <h3>${m.name}</h3>
                    <p class="moto-series">${m.series?.name || 'Kawasaki'} • ${m.category?.name || ''}</p>
                    <p class="moto-price">$${(m.price || 0).toLocaleString()}</p>
                    <p class="moto-year">${m.year || '2025'}</p>
                </div>
            `;
            
            card.addEventListener('click', () => showModal(m));
            grid.appendChild(card);
        });
    }

    function renderPagination(page, pages) {
        if (!paginationDiv) return;
        paginationDiv.innerHTML = '';
        if (!pages || pages <= 1) return;
        
        const prev = document.createElement('button');
        prev.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prev.disabled = page === 1;
        prev.onclick = () => { filters.page--; loadMotorcycles(); };
        paginationDiv.appendChild(prev);
        
        for (let i = 1; i <= pages; i++) {
            if (i === 1 || i === pages || (i >= page - 1 && i <= page + 1)) {
                const btn = document.createElement('button');
                btn.innerText = i;
                if (i === page) btn.classList.add('active');
                btn.onclick = () => { filters.page = i; loadMotorcycles(); };
                paginationDiv.appendChild(btn);
            } else if (i === page - 2 || i === page + 2) {
                const span = document.createElement('span');
                span.innerText = '...';
                span.style.padding = '0 5px';
                span.style.color = '#a0b0c0';
                paginationDiv.appendChild(span);
            }
        }
        
        const next = document.createElement('button');
        next.innerHTML = '<i class="fas fa-chevron-right"></i>';
        next.disabled = page === pages;
        next.onclick = () => { filters.page++; loadMotorcycles(); };
        paginationDiv.appendChild(next);
    }

    function showModal(moto) {
        const modal = document.getElementById('motoModal');
        const modalBody = document.getElementById('modalBody');
        if (!modal || !modalBody) return;
        
        const imgUrl = window.getMotorcycleImageUrl(moto);
        
        // Формируем спецификации для отображения
        let specsHtml = '';
        if (moto.specs) {
            const specsOrder = [
                ['engine_type', 'Engine Type'],
                ['displacement_cc', 'Displacement'],
                ['horsepower', 'Horsepower'],
                ['torque', 'Torque'],
                ['transmission', 'Transmission'],
                ['seat_height', 'Seat Height'],
                ['fuel_capacity', 'Fuel Capacity'],
                ['weight', 'Weight']
            ];
            
            specsOrder.forEach(([key, label]) => {
                const val = moto.specs[key];
                if (val) {
                    specsHtml += `<div class="spec-item"><span>${label}</span><strong>${val}</strong></div>`;
                }
            });
        }
        
        modalBody.innerHTML = `
            <div class="modal-detail">
                <img src="${imgUrl}" alt="${moto.name}" onerror="this.src='/static/img/motorcycles/placeholder.png'">
                <h2>${moto.name}</h2>
                <p><i class="fas fa-tag"></i> ${moto.series?.name || 'Kawasaki'} • ${moto.category?.name || 'Sport'}</p>
                <div class="modal-price">$${(moto.price || 0).toLocaleString()}</div>
                <div class="modal-specs-grid">
                    ${specsHtml || '<div class="spec-item"><span>Full specs</span><strong>Available on request</strong></div>'}
                </div>
                <div class="modal-actions">
                    <button class="add-to-cart-modal"><i class="fas fa-cart-plus"></i> Add to Cart</button>
                    <button class="close-modal-btn">Close</button>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
        
        // Закрытие модального окна
        const closeBtn = modalBody.querySelector('.close-modal-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => modal.style.display = 'none');
        }
        
        // Добавление в корзину
        const addToCartBtn = modalBody.querySelector('.add-to-cart-modal');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                alert(`${moto.name} added to cart!`);
                // Здесь можно добавить реальный вызов API для добавления в корзину
            });
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    if (searchBtn) {
        searchBtn.onclick = () => { 
            filters.search = searchInput.value; 
            filters.page = 1; 
            loadMotorcycles(); 
        };
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') { 
                filters.search = searchInput.value; 
                filters.page = 1; 
                loadMotorcycles(); 
            } 
        });
    }
    
    if (sortSelect) {
        sortSelect.onchange = (e) => { 
            filters.sort = e.target.value; 
            filters.page = 1; 
            loadMotorcycles(); 
        };
    }
    
    function resetAllFilters() {
        filters = { group: '', series: '', category: '', search: '', sort: 'name-asc', page: 1 };
        if (searchInput) searchInput.value = '';
        
        // Сбрасываем активные кнопки
        document.querySelectorAll('.h-btn').forEach(b => b.classList.remove('active'));
        const allGroupsBtn = document.querySelector('[data-type="group"][data-value=""]');
        if (allGroupsBtn) allGroupsBtn.classList.add('active');
        
        // Скрываем уровни
        const levelSeries = document.getElementById('level-series');
        const levelCategories = document.getElementById('level-categories');
        if (levelSeries) levelSeries.classList.add('hidden');
        if (levelCategories) levelCategories.classList.add('hidden');
        
        loadMotorcycles();
    }
    
    if (resetAllBtn) resetAllBtn.onclick = resetAllFilters;
    if (resetEmptyBtn) resetEmptyBtn.onclick = resetAllFilters;
    
    // Закрытие модального окна по крестику
    const closeModalSpan = document.querySelector('.close-modal');
    if (closeModalSpan) {
        closeModalSpan.addEventListener('click', () => {
            const motoModal = document.getElementById('motoModal');
            if (motoModal) motoModal.style.display = 'none';
        });
    }
    
    // Закрытие модального окна по клику вне контента
    window.onclick = (e) => { 
        if (e.target.classList && e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    };
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    // 1. Загружаем иерархию
    const hierarchyData = await fetchHierarchy();
    hierarchy = hierarchyData;
    
    // 2. Рендерим кнопки групп
    renderGroups();
    
    // 3. Загружаем мотоциклы
    await loadMotorcycles();
    
    // 4. Показываем контент после загрузки
    const wrapper = document.querySelector('.wrapper');
    if (wrapper) wrapper.classList.add('page-loaded');
    function applyDashboardImages() {
        document.querySelectorAll('.order-bike-img, .wishlist-bike-img').forEach(img => {
            const bikeName = img.getAttribute('data-bike-name');
            if (bikeName && window.getMotorcycleImageUrl) {
                img.src = window.getMotorcycleImageUrl(bikeName);
                img.onerror = () => { img.src = '/static/img/motorcycles/placeholder.png'; };
            }
        });
    }
    applyDashboardImages();
});