// FavoritesManager.js - Модуль управления избранными городами

class FavoritesManager {
    constructor(localStorageManager, weatherDataFetcher, historyManager, uiUpdater) {
        this.localStorageManager = localStorageManager;
        this.weatherDataFetcher = weatherDataFetcher;
        this.historyManager = historyManager;
        this.uiUpdater = uiUpdater;
        this.currentFavorite = this.localStorageManager.getCurrentFavorite();
    }

    // FavoritesManager.js - метод addFavorite (полная версия)
    async addFavorite(city, label) {
        try {
            // Нормализация и проверка входных данных
            city = city.trim();
            label = label.trim();

            if (!city || !label) {
                throw new Error("Заполните название города и метку");
            }

            // Проверка существования города через API
            const isValid = await this.weatherDataFetcher.validateCity(city);
            if (!isValid) {
                throw new Error("Город не найден в базе данных");
            }

            // Проверка дубликатов (с учетом регистра)
            const favorites = this.localStorageManager.getFavorites();
            if (favorites.some(f => f.city.toLowerCase() === city.toLowerCase())) {
                throw new Error("Город уже есть в избранном");
            }

            // Добавление в хранилище
            const formattedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
            favorites.push({ city: formattedCity, label });
            this.localStorageManager.setFavorites(favorites);

            this.historyManager.addToHistory('favorite', {
                action: 'add',
                city: formattedCity, // Используем отформатированное название
                label: label,
                timestamp: new Date().toISOString() // Добавляем временную метку
            });

            // Обновление UI
            this.loadFavorites();
            return true;

        } catch (error) {
            throw new Error(`Ошибка добавления: ${error.message}`);
        }
    }

    editFavorite(city, newLabel) {
        const favorites = this.localStorageManager.getFavorites();
        const item = favorites.find(f => f.city === city);
        if (item) {
            item.label = newLabel;
            this.localStorageManager.setFavorites(favorites);
            
            this.historyManager.addToHistory('favorite', {
                action: 'edit',
                city: city,
                label: newLabel
            });

            this.loadFavorites();
        }
    }

    deleteFavorite(city) {
        let favorites = this.localStorageManager.getFavorites();
        
        // Удаляем город из списка избранного
        favorites = favorites.filter(f => f.city !== city);
        this.localStorageManager.setFavorites(favorites);

        // Если удаляем текущий избранный город
        if (this.currentFavorite === city) {
            this.currentFavorite = null;
            this.localStorageManager.setCurrentFavorite(null);
        }

        this.historyManager.addToHistory('favorite', {
            action: 'delete',
            city: city
        });

        this.loadFavorites();
    }

    clearAllFavorites() {
        this.localStorageManager.clearFavorites();
        this.currentFavorite = null;
        this.localStorageManager.setCurrentFavorite(null);

        this.historyManager.addToHistory('favorite', {
            action: 'clear_all',
            status: 'complete'
        });

        this.loadFavorites();
    }

    toggleCurrentFavorite(city) {
        const favorites = this.localStorageManager.getFavorites();
        const cityExists = favorites.some(fav => fav.city === city);

        if (!cityExists) {
            throw new Error('Город не найден в избранном');
        }

        // Если пытаемся снять текущий город
        if (this.currentFavorite === city) {
            this.currentFavorite = null;
            this.localStorageManager.setCurrentFavorite(null);
            
            this.historyManager.addToHistory('favorite', {
                action: 'unset_current',
                city: city
            });
        }
        // Если выбираем новый город
        else {
            this.currentFavorite = city;
            this.localStorageManager.setCurrentFavorite(city);
            
            this.historyManager.addToHistory('favorite', {
                action: 'set_current',
                city: city
            });
        }

        this.loadFavorites();
        return this.currentFavorite;
    }

    loadFavorites() {
        const favorites = this.localStorageManager.getFavorites();
        this.uiUpdater.updateFavoritesList(favorites, this.currentFavorite);
    }

    getCurrentFavorite() {
        return this.currentFavorite;
    }
}

export default FavoritesManager; 