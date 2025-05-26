// SettingsManager.js - Модуль управления настройками

class SettingsManager {
    constructor(localStorageManager, historyManager, uiUpdater) {
        this.localStorageManager = localStorageManager;
        this.historyManager = historyManager;
        this.uiUpdater = uiUpdater;
        this.units = 'metric';
        this.useGeolocation = false;
        this.notificationsEnabled = false;
    }

    loadSettings() {
        // Загружаем единицы измерения
        this.units = this.localStorageManager.getUnits();
        
        // Загружаем состояние геолокации
        this.useGeolocation = this.localStorageManager.getGeolocationState();
        
        // Загружаем состояние уведомлений
        this.notificationsEnabled = this.localStorageManager.getNotificationsState();

        // Обновляем UI
        this.uiUpdater.updateSettingsUI(this.units, this.useGeolocation, this.notificationsEnabled);
    }

    updateUnits(newUnits) {
        this.units = newUnits;
        this.localStorageManager.setUnits(newUnits);

        this.historyManager.addToHistory('settings', {
            action: 'units',
            units: newUnits
        });

        return this.units;
    }

    toggleGeolocation() {
        // Проверяем, есть ли выбранное избранное перед включением переключателя
        if (!this.useGeolocation && !this.localStorageManager.getCurrentFavorite()) {
            throw new Error('Сначала выберите город в избранном как текущий');
        }

        this.useGeolocation = !this.useGeolocation;
        this.localStorageManager.setGeolocationState(this.useGeolocation);
        
        this.historyManager.addToHistory('settings', {
            action: 'geolocation',
            status: this.useGeolocation ? 'enabled' : 'disabled'
        });

        this.uiUpdater.updateGeolocationUI(this.useGeolocation);
        return this.useGeolocation;
    }

    toggleNotifications() {
        this.notificationsEnabled = !this.notificationsEnabled;
        this.localStorageManager.setNotificationsState(this.notificationsEnabled);

        this.historyManager.addToHistory('settings', {
            action: 'recommendations',
            status: this.notificationsEnabled ? 'enabled' : 'disabled'
        });

        this.uiUpdater.updateNotificationsUI(this.notificationsEnabled);
        return this.notificationsEnabled;
    }

    resetAll() {
        // Сброс единиц измерения
        this.units = 'metric';
        this.localStorageManager.setUnits('metric');
        
        // Выключение геолокации
        this.useGeolocation = false;
        this.localStorageManager.setGeolocationState(false);
        
        // Отключение рекомендаций
        this.notificationsEnabled = false;
        this.localStorageManager.setNotificationsState(false);
        
        // Очистка истории
        this.localStorageManager.clearHistory();
        
        // Очистка избранного
        this.localStorageManager.clearFavorites();
        this.localStorageManager.setCurrentFavorite(null);
        
        // Очистка последнего поиска
        this.localStorageManager.setLastSearchedCity('');
        
        // Обновление UI
        this.uiUpdater.updateSettingsUI(this.units, this.useGeolocation, this.notificationsEnabled);
        
        // Добавляем запись в историю о сбросе
        this.historyManager.addToHistory('settings', {
            action: 'reset_all',
            status: 'complete'
        });
    }

    getUnits() {
        return this.units;
    }

    getGeolocationState() {
        return this.useGeolocation;
    }

    getNotificationsState() {
        return this.notificationsEnabled;
    }
}

export default SettingsManager; 