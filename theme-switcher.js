// theme-switcher.js - универсальный переключатель темы для всех страниц

// Функция для установки темы
function setTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('theme-light');
        localStorage.setItem('kawasaki-theme', 'light');
    } else {
        document.body.classList.remove('theme-light');
        localStorage.setItem('kawasaki-theme', 'dark');
    }
}

// Функция для переключения темы
function toggleTheme() {
    const isLight = document.body.classList.contains('theme-light');
    setTheme(isLight ? 'dark' : 'light');
    updateThemeIcon();
}

// Функция обновления иконки кнопки
function updateThemeIcon() {
    const themeBtn = document.getElementById('themeToggleBtn');
    if (!themeBtn) return;
    
    const isLight = document.body.classList.contains('theme-light');
    
    if (isLight) {
        themeBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3V4M12 20V21M21 12H20M4 12H3M18.364 5.636L17.657 6.343M6.343 17.657L5.636 18.364M18.364 18.364L17.657 17.657M6.343 6.343L5.636 5.636" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8C9.79 8 8 9.79 8 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
        `;
        themeBtn.title = "Switch to Dark Mode";
    } else {
        themeBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79C20.8427 14.4922 20.2039 16.1144 19.1583 17.4668C18.1127 18.8192 16.7035 19.8458 15.0957 20.4265C13.4879 21.0073 11.748 21.1181 10.0795 20.7461C8.41104 20.3741 6.88299 19.5345 5.67422 18.3258C4.46545 17.117 3.62588 15.589 3.2539 13.9205C2.88192 12.252 2.99274 10.5121 3.57348 8.9043C4.15422 7.29651 5.18081 5.88734 6.53322 4.84175C7.88562 3.79615 9.50779 3.15731 11.21 3C10.2134 4.34827 9.73386 6.00945 9.85853 7.68141C9.9832 9.35338 10.7039 10.9251 11.8894 12.1106C13.0749 13.2961 14.6466 14.0168 16.3186 14.1415C17.9906 14.2661 19.6517 13.7866 21 12.79Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        themeBtn.title = "Switch to Light Mode";
    }
}

// Создание и вставка кнопки темы в навигацию
function injectThemeButton() {
    // Ищем все навигационные меню на странице
    const navMenus = document.querySelectorAll('header nav ul');
    
    navMenus.forEach(navUl => {
        // Проверяем, не добавлена ли уже кнопка
        if (navUl.querySelector('.theme-switcher-item')) return;
        
        // Создаем элемент кнопки
        const li = document.createElement('li');
        li.className = 'theme-switcher-item';
        
        const button = document.createElement('button');
        button.id = 'themeToggleBtn';
        button.className = 'theme-toggle-btn';
        button.setAttribute('aria-label', 'Switch theme');
        button.onclick = toggleTheme;
        
        li.appendChild(button);
        
        // Вставляем кнопку в начало навигации (слева от домашней ссылки)
        const firstItem = navUl.children[0];
        if (firstItem) {
            navUl.insertBefore(li, firstItem);
        } else {
            navUl.appendChild(li);
        }
    });
    
    updateThemeIcon();
}

// Инициализация темы при загрузке страницы
function initTheme() {
    // Получаем сохраненную тему или используем dark как значение по умолчанию
    const savedTheme = localStorage.getItem('kawasaki-theme');
    
    if (savedTheme === 'light') {
        document.body.classList.add('theme-light');
    } else {
        document.body.classList.remove('theme-light');
        // Если тема не сохранена, устанавливаем темную по умолчанию
        if (!savedTheme) {
            localStorage.setItem('kawasaki-theme', 'dark');
        }
    }
    
    injectThemeButton();
}

// Запускаем инициализацию после загрузки DOM
document.addEventListener('DOMContentLoaded', initTheme);