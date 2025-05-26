// UIUpdater.js - Модуль динамического обновления интерфейса

class UIUpdater {
    constructor() {
        this.currentFavorite = null;
        this.currentViewMode = 'manual';
        this.useGeolocation = false;
        this.lastSearchedCity = null;
    }

    setCurrentState(currentFavorite, currentViewMode, useGeolocation, lastSearchedCity) {
        this.currentFavorite = currentFavorite;
        this.currentViewMode = currentViewMode;
        this.useGeolocation = useGeolocation;
        this.lastSearchedCity = lastSearchedCity;
    }

    updateSettingsUI(units, useGeolocation, notificationsEnabled) {
        // Обновляем кнопки единиц измерения
        document.querySelectorAll('.unit-option').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-unit') === units) {
                btn.classList.add('active');
            }
        });

        // Обновляем переключатель геолокации
        document.getElementById('geolocation').checked = useGeolocation;
        this.useGeolocation = useGeolocation;

        // Обновляем переключатель уведомлений
        document.getElementById('notifications').checked = notificationsEnabled;

        // Обновляем видимость панели рекомендаций
        const recommendationsPanel = document.querySelector('.recommendations-sidebar');
        if (recommendationsPanel) {
            recommendationsPanel.style.display = notificationsEnabled ? 'block' : 'none';
        }
    }

    updateGeolocationUI(useGeolocation) {
        document.getElementById('geolocation').checked = useGeolocation;
        this.useGeolocation = useGeolocation;
        this.updateLocationSwitcher();
    }

    updateNotificationsUI(notificationsEnabled) {
        document.getElementById('notifications').checked = notificationsEnabled;
        const recommendationsPanel = document.querySelector('.recommendations-sidebar');
        if (recommendationsPanel) {
            recommendationsPanel.style.display = notificationsEnabled ? 'block' : 'none';
        }
    }

    updateLocationSwitcher() {
        const switcher = document.getElementById('locationSwitcher');
        const favoriteBtn = document.getElementById('switchFavorite');
        const geoBtn = document.getElementById('switchGeolocation');

        if (this.currentFavorite && this.useGeolocation) {
            switcher.style.display = 'block';
            favoriteBtn.textContent = `🌟 ${this.currentFavorite}`;
            geoBtn.textContent = `🔍 ${this.lastSearchedCity || 'Последний поиск'}`;
            this.setActiveButton(this.currentViewMode === 'favorite' ? 'switchFavorite' : 'switchGeolocation');
        } else {
            switcher.style.display = 'none';
        }
    }

    updateHistoryList(history, getHistoryIcon, getHistoryTitle) {
        const list = document.getElementById('historyList');
        list.innerHTML = history.map(entry => `
            <li class="history-item ${entry.type}">
                <div class="history-icon">
                    ${getHistoryIcon(entry.type)}
                </div>
                <div class="history-content">
                    <div class="history-title">${getHistoryTitle(entry)}</div>
                    <small>${entry.date}</small>
                </div>
                <div class="history-actions">
                    <button class="delete-btn" onclick="deleteHistoryItem('${entry.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `).join('');
    }

    updateFavoritesList(favorites, currentFavorite) {
        this.currentFavorite = currentFavorite;
        const list = document.getElementById('favoritesList');
        list.innerHTML = favorites.map(fav => `
            <li class="favorite-item" data-city="${fav.city}">
                <div class="current-favorite ${currentFavorite === fav.city ? 'active' : ''}">
                    <i class="far ${currentFavorite === fav.city ? 'fa-heart' : 'fa-circle'}"></i>
                </div>
                <div class="favorite-content">
                    <div class="favorite-label">${fav.label}</div>
                    <div class="favorite-city">${fav.city}</div>
                </div>
                <div class="favorite-actions">
                    <button class="edit-btn" onclick="editFavorite('${fav.city}')">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteFavorite('${fav.city}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `).join('');
    }

    showError(message, isSuccess = false) {
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.style.background = isSuccess ? '#4CAF50' : '#ff4444';

        errorEl.innerHTML = `
            <i class="fas ${isSuccess ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
            ${message}
        `;

        document.body.appendChild(errorEl);
        setTimeout(() => errorEl.remove(), 3000);
    }

    setActiveButton(activeId) {
        document.querySelectorAll('.switch-option').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(activeId).classList.add('active');
    }
}

export default UIUpdater; 