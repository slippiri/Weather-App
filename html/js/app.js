// app.js - Основной файл приложения

import MainView from './MainView.js';
import WeatherCardView from './WeatherCardView.js';
import WeatherDataFetcher from './WeatherDataFetcher.js';
import WeatherCacheManager from './WeatherCacheManager.js';
import WeatherHistoryManager from './WeatherHistoryManager.js';
import FavoritesManager from './FavoritesManager.js';
import SettingsManager from './SettingsManager.js';
import NotificationsManager from './NotificationsManager.js';
import StringConverter from './StringConverter.js';
import UnitValidator from './UnitValidator.js';
import UIUpdater from './UIUpdater.js';
import LocalStorageManager from './LocalStorageManager.js';

class WeatherApp {
    constructor() {
        // Инициализация вспомогательных модулей
        this.localStorageManager = new LocalStorageManager();
        this.stringConverter = new StringConverter();
        this.unitValidator = new UnitValidator();
        this.uiUpdater = new UIUpdater();
        this.cacheManager = new WeatherCacheManager();

        // Инициализация основных модулей
        this.mainView = new MainView();
        this.weatherCardView = new WeatherCardView(this.stringConverter);
        this.weatherDataFetcher = new WeatherDataFetcher(this.cacheManager);
        this.historyManager = new WeatherHistoryManager(this.localStorageManager, this.uiUpdater);
        this.notificationsManager = new NotificationsManager(this.stringConverter);
        this.favoritesManager = new FavoritesManager(
            this.localStorageManager,
            this.weatherDataFetcher,
            this.historyManager,
            this.uiUpdater
        );
        this.settingsManager = new SettingsManager(
            this.localStorageManager,
            this.historyManager,
            this.uiUpdater
        );

        // Инициализация состояния приложения
        this.currentViewMode = 'manual';
        this.lastSearchedCity = this.localStorageManager.getLastSearchedCity();
        this.lastWeatherData = null; // Добавляем хранение последних данных о погоде

        // Синхронизация состояния с UIUpdater
        this.uiUpdater.setCurrentState(
            this.favoritesManager.getCurrentFavorite(),
            this.currentViewMode,
            this.settingsManager.getGeolocationState(),
            this.lastSearchedCity
        );

        // Загрузка начальных данных
        this.initialize();
    }

    async initialize() {
        // Загружаем настройки
        this.settingsManager.loadSettings();

        // Загружаем избранное
        this.favoritesManager.loadFavorites();

        // Загружаем историю
        this.historyManager.loadHistory();

        // Устанавливаем обработчики событий
        this.setupEventListeners();

        // Устанавливаем активную единицу измерения
        this.updateActiveUnit();

        // Автоматическая загрузка погоды при включенной геолокации или выбранном избранном
        if ((this.settingsManager.getGeolocationState() && this.lastSearchedCity) || 
            this.favoritesManager.getCurrentFavorite()) {
            await this.getWeather(true);
        }
    }

    updateActiveUnit() {
        const currentUnit = this.settingsManager.getUnits();
        document.querySelectorAll('.unit-option').forEach(option => {
            if (option.getAttribute('data-unit') === currentUnit) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    setupEventListeners() {
        // Поиск погоды
        const cityInput = document.getElementById('city');
        
        cityInput.addEventListener('blur', (e) => {
            const validation = this.unitValidator.validateCityInput(e.target.value);
            if (!validation.isValid) {
                e.target.value = validation.value;
                this.uiUpdater.showError(validation.message);
            }
        });

        cityInput.addEventListener('input', (e) => {
            if (e.target.value.trim()) {
                this.currentViewMode = 'manual';
                this.uiUpdater.updateLocationSwitcher();
            }
        });

        // Добавление в избранное
        const favoriteCityInput = document.getElementById('favoriteCity');
        
        favoriteCityInput.addEventListener('blur', (e) => {
            const validation = this.unitValidator.validateCityInput(e.target.value);
            if (!validation.isValid) {
                e.target.value = validation.value;
                this.uiUpdater.showError(validation.message);
            }
        });

        // Метка избранного
        const favoriteLabelInput = document.getElementById('favoriteLabel');
        const labelSelect = favoriteLabelInput.closest('.label-select');
        
        favoriteLabelInput.addEventListener('click', () => {
            labelSelect.classList.add('active');
        });

        document.addEventListener('click', (e) => {
            if (!labelSelect.contains(e.target)) {
                labelSelect.classList.remove('active');
            }
        });

        document.querySelectorAll('.label-option').forEach(option => {
            option.addEventListener('click', () => {
                const label = option.getAttribute('data-label');
                if (label === 'custom') {
                    favoriteLabelInput.value = '';
                    favoriteLabelInput.readOnly = false;
                    favoriteLabelInput.focus();
                } else {
                    favoriteLabelInput.value = label;
                    favoriteLabelInput.readOnly = true;
                    favoriteLabelInput.classList.remove('error');
                }
                labelSelect.classList.remove('active');
            });
        });

        favoriteLabelInput.addEventListener('blur', (e) => {
            if (!e.target.readOnly) {
                const validation = this.unitValidator.validateLabelInput(e.target.value);
                if (!validation.isValid) {
                    e.target.value = validation.value;
                    this.uiUpdater.showError(validation.message);
                    e.target.classList.add('error');
                } else {
                    e.target.classList.remove('error');
                }
            }
        });

        // Настройки: Единицы измерения
        document.querySelectorAll('.unit-option').forEach(option => {
            option.addEventListener('click', () => {
                const unit = option.getAttribute('data-unit');
                this.settingsManager.updateUnits(unit);
                this.updateActiveUnit();
                this.getWeather(false, true);
            });
        });

        // Кнопка поиска
        document.querySelector('.search-btn').addEventListener('click', () => this.getWeather());

        // Переключение режимов отображения
        document.getElementById('switchFavorite').addEventListener('click', () => {
            if (!this.favoritesManager.getCurrentFavorite()) return;
            this.currentViewMode = 'favorite';
            document.getElementById('city').value = this.favoritesManager.getCurrentFavorite();
            this.uiUpdater.updateLocationSwitcher();
            this.getWeather(true);
        });

        document.getElementById('switchGeolocation').addEventListener('click', () => {
            this.currentViewMode = 'geolocation';
            document.getElementById('city').value = this.lastSearchedCity;
            this.uiUpdater.updateLocationSwitcher();
            this.getWeather(true);
        });

        // Настройки: Переключатель избранное/поиск
        document.getElementById('geolocation').addEventListener('change', () => {
            try {
                this.settingsManager.toggleGeolocation();
                if (this.settingsManager.getGeolocationState()) {
                    this.getWeather(true);
                }
            } catch (error) {
                this.uiUpdater.showError(error.message);
            }
        });

        // Настройки: Рекомендации
        document.getElementById('notifications').addEventListener('change', () => {
            this.settingsManager.toggleNotifications();
            if (this.settingsManager.getNotificationsState()) {
                this.getWeather(false, true); // Обновляем погоду для показа рекомендаций
            }
        });

        // Кнопка сброса настроек
        document.getElementById('resetAllBtn').addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите сбросить все настройки? Это действие нельзя отменить.')) {
                this.settingsManager.resetAll();
                this.favoritesManager.loadFavorites();
                this.historyManager.loadHistory();
                this.getWeather(true);
            }
        });

        // Кнопка очистки избранного
        document.getElementById('clearFavoritesBtn').addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите очистить все избранное? Это действие нельзя отменить.')) {
                this.favoritesManager.clearAllFavorites();
            }
        });

        // Кнопка очистки истории
        document.getElementById('clearHistoryBtn').addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите очистить всю историю? Это действие нельзя отменить.')) {
                this.historyManager.clearHistory();
            }
        });

        // Фильтры истории
        document.querySelectorAll('.history-filters button').forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.historyManager.filterHistory(filter);
            });
        });

        // Добавление в избранное
        document.getElementById('addFavoriteBtn').addEventListener('click', async () => {
            const city = document.getElementById('favoriteCity').value;
            const label = document.getElementById('favoriteLabel').value;

            try {
                // Предварительная проверка города
                const cityExists = await this.weatherDataFetcher.validateCity(city);
                if (!cityExists) {
                    throw new Error("Не удалось найти указанный город");
                }

                // Если проверка пройдена - добавляем
                await this.favoritesManager.addFavorite(city, label);
                this.uiUpdater.showError("Город добавлен!", true);
                document.getElementById('favoriteCity').value = '';
                document.getElementById('favoriteLabel').value = '';

            } catch (error) {
                this.uiUpdater.showError(error.message);
            }
        });

        // Обработка выбора текущего города из избранного
        // В разделе "Обработка выбора текущего города из избранного"
        document.addEventListener('click', (e) => {
            const currentFavoriteBtn = e.target.closest('.current-favorite');
            if (currentFavoriteBtn) {
                const favoriteItem = currentFavoriteBtn.closest('.favorite-item');
                const cityName = favoriteItem.getAttribute('data-city');
                const isCurrentlyActive = currentFavoriteBtn.classList.contains('active');

                // Запрос подтверждения
                const action = isCurrentlyActive ? 'отменить текущий город' : 'установить новый город';
                const confirmation = confirm(`Вы уверены, что хотите ${action} "${cityName}"?`);

                if (!confirmation) return;

                // Обновляем текущий избранный город
                this.favoritesManager.toggleCurrentFavorite(cityName);

                // Обновляем UI
                document.querySelectorAll('.current-favorite').forEach(btn => {
                    btn.classList.remove('active');
                });
                currentFavoriteBtn.classList.add('active');

                // Переключаемся в режим избранного и загружаем погоду
                this.currentViewMode = 'favorite';
                document.getElementById('city').value = cityName;
                this.uiUpdater.updateLocationSwitcher();
                this.getWeather(true);
            }
        });
    }

    async getWeather(initialLoad = false, forceUpdate = false) {
        try {
            const cityInput = document.getElementById('city');
            let queryParam = '';

            // Определение источника данных
            if (this.currentViewMode === 'favorite' && this.favoritesManager.getCurrentFavorite()) {
                if (cityInput.value.trim() && cityInput.value.trim() !== this.favoritesManager.getCurrentFavorite()) {
                    this.lastSearchedCity = cityInput.value.trim();
                    this.localStorageManager.setLastSearchedCity(this.lastSearchedCity);
                }
                queryParam = this.favoritesManager.getCurrentFavorite();
                cityInput.value = this.favoritesManager.getCurrentFavorite();
            } else if (this.currentViewMode === 'geolocation' && this.settingsManager.getGeolocationState()) {
                if (cityInput.value.trim()) {
                    this.lastSearchedCity = cityInput.value.trim();
                    this.localStorageManager.setLastSearchedCity(this.lastSearchedCity);
                    queryParam = cityInput.value.trim();
                } else if (this.lastSearchedCity) {
                    queryParam = this.lastSearchedCity;
                    cityInput.value = this.lastSearchedCity;
                } else {
                    this.uiUpdater.showError('Введите город для поиска');
                    return;
                }
            } else if (cityInput.value.trim()) {
                queryParam = cityInput.value.trim();
                this.currentViewMode = 'manual';
                this.lastSearchedCity = cityInput.value.trim();
                this.localStorageManager.setLastSearchedCity(this.lastSearchedCity);
            } else {
                this.uiUpdater.showError('Введите город для поиска');
                return;
            }

            // Обновляем состояние в UIUpdater
            this.uiUpdater.setCurrentState(
                this.favoritesManager.getCurrentFavorite(),
                this.currentViewMode,
                this.settingsManager.getGeolocationState(),
                this.lastSearchedCity
            );

            // Получаем данные о погоде
            const data = await this.weatherDataFetcher.getWeather(
                queryParam,
                this.settingsManager.getUnits(),
                this.currentViewMode,
                this.favoritesManager.getCurrentFavorite(),
                forceUpdate
            );

            // Сохраняем последние данные о погоде
            this.lastWeatherData = data;

            // Обновляем интерфейс
            this.weatherCardView.updateUI(data, this.settingsManager.getUnits());

            // Обновляем рекомендации
            if (this.settingsManager.getNotificationsState()) {
                this.notificationsManager.updateRecommendations(data);
            }

            // Добавляем запись в историю
            this.historyManager.addToHistory('search', { city: data.address || cityInput.value });

            // Обновляем переключатель локации
            this.uiUpdater.updateLocationSwitcher();

        } catch (error) {
            this.uiUpdater.showError(error.message);

            if (error.message.includes('геолокация')) {
                this.settingsManager.toggleGeolocation();
            }
        }
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.app = new WeatherApp();
}); 