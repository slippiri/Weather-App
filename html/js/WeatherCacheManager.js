// WeatherCacheManager.js - Модуль кэширования данных о погоде

class WeatherCacheManager {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 минут
    }

    // Сохранение данных в кэш
    set(key, data) {
        this.cache.set(key, {
            data: data, // Данные о погоде
            timestamp: Date.now() // Текущая метка времени
        });
    }

    // Получение данных из кэша
    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        // Проверяем актуальность кэша
        if (Date.now() - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    clear() {
        this.cache.clear();
    }

    // Удаление только устаревших записей
    clearExpired() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.cache.delete(key);
            }
        }
    }
}

export default WeatherCacheManager; 