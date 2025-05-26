// LocalStorageManager.js - Модуль работы с локальным хранилищем

class LocalStorageManager {
    // Методы для работы с единицами измерения
    getUnits() {
        return localStorage.getItem('units') || 'metric';
    }

    setUnits(units) {
        localStorage.setItem('units', units);
    }

    // Методы для работы с геолокацией
    getGeolocationState() {
        return localStorage.getItem('geolocation') === 'true';
    }

    setGeolocationState(state) {
        localStorage.setItem('geolocation', state);
    }

    // Методы для работы с уведомлениями
    getNotificationsState() {
        return localStorage.getItem('notifications') === 'true';
    }

    setNotificationsState(state) {
        localStorage.setItem('notifications', state);
    }

    // Методы для работы с избранным
    getFavorites() {
        return JSON.parse(localStorage.getItem('favorites') || '[]');
    }

    setFavorites(favorites) {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    getCurrentFavorite() {
        return localStorage.getItem('currentFavorite') || null;
    }

    setCurrentFavorite(city) {
        if (city) {
            localStorage.setItem('currentFavorite', city);
        } else {
            localStorage.removeItem('currentFavorite');
        }
    }

    // Методы для работы с историей
    getHistory() {
        const history = localStorage.getItem('history');
        return history ? JSON.parse(history) : [];
    }

    setHistory(history) {
        if (Array.isArray(history)) {
            localStorage.setItem('history', JSON.stringify(history));
        }
    }

    // Методы для работы с последним поиском
    getLastSearchedCity() {
        return localStorage.getItem('lastSearchedCity') || '';
    }

    setLastSearchedCity(city) {
        localStorage.setItem('lastSearchedCity', city);
    }

    // Методы очистки данных
    clearHistory() {
        localStorage.removeItem('history');
    }

    clearFavorites() {
        localStorage.removeItem('favorites');
        localStorage.removeItem('currentFavorite');
    }

    clearAll() {
        localStorage.clear();
    }
}

export default LocalStorageManager; 