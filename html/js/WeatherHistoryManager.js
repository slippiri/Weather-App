// WeatherHistoryManager.js - Модуль управления историей действий

class WeatherHistoryManager {
    constructor(localStorageManager, uiUpdater) {
        // Инициализация зависимостей
        this.localStorageManager = localStorageManager; // Менеджер работы с LocalStorage
        this.uiUpdater = uiUpdater; // Объект для обновления UI

        // Типы исторических записей
        this.HistoryType = {
            SEARCH: 'search',
            SETTINGS: 'settings',
            FAVORITE: 'favorite',
            GEOLOCATION: 'geolocation'
        };
    }

    // Добавление записи в историю
    addToHistory(type, data) {
        const history = this.localStorageManager.getHistory(); // Получаем текущую историю

        // Создаем новую запись
        history.unshift({
            id: this.generateId(), // Уникальный идентификатор
            type, // Тип действия
            data, // Данные действия
            date: new Date().toLocaleString('ru-RU', { // Локализованная дата
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
            })
        });

        this.localStorageManager.setHistory(history); // Сохраняем обновленную историю
        this.loadHistory(); // Обновляем отображение
    }

    // Загрузка и отображение истории
    loadHistory() {
        const history = this.localStorageManager.getHistory();
        // Передаем в UI: данные, функцию получения иконки и заголовка
        this.uiUpdater.updateHistoryList(history, this.getHistoryIcon, this.getHistoryTitle);
    }

    // Удаление конкретной записи
    deleteHistoryItem(id) {
        let history = this.localStorageManager.getHistory();
        history = history.filter(item => item.id !== id); // Фильтрация по ID
        this.localStorageManager.setHistory(history);
        this.loadHistory();
    }

    // Полная очистка истории
    clearHistory() {
        this.localStorageManager.clearHistory();
        this.loadHistory();
    }

    // Фильтрация записей по типу
    filterHistory(type) {
        document.querySelectorAll('.history-item').forEach(item => {
            item.style.display = (type === 'all' || item.classList.contains(type))
                ? 'flex'
                : 'none';
        });
    }

    // Получение иконки для типа записи
    getHistoryIcon(type) {
        const icons = {
            search: '🔍',
            settings: '⚙️',
            favorite: '⭐',
            geolocation: '🌍'
        };
        return icons[type] || '📄'; // Иконка по умолчанию
    }

    // Формирование заголовка для записи
    getHistoryTitle(entry) {
        switch (entry.type) {
            case 'search':
                return `Поиск: ${entry.data.city}`;

            case 'settings':
                const settingsActions = {
                    'geolocation': `Геолокация: ${entry.data.status === 'enabled' ? 'вкл' : 'выкл'}`,
                    'recommendations': `Рекомендации: ${entry.data.status === 'enabled' ? 'вкл' : 'выкл'}`,
                    'reset_all': 'Сброс всех настроек',
                    'history_clear': 'Очистка истории',
                    'units': `Единицы: ${entry.data.units === 'metric' ? '°C/км/ч' : '°F/миль/ч'}`
                };
                return settingsActions[entry.data.action] || 'Изменение настроек';

            case 'favorite':
                const favoriteActions = {
                    'add': `Добавлен: ${entry.data.city}`,
                    'edit': `Изменена метка: ${entry.data.city} → ${entry.data.label}`,
                    'delete': `Удален: ${entry.data.city}`,
                    'clear_all': 'Очищено избранное',
                    'set_current': `Текущий город: ${entry.data.city}`,
                    'unset_current': 'Сброс текущего города'
                };
                return `Избранное: ${favoriteActions[entry.data.action]}`;

            case 'geolocation':
                return `Геолокация: ${entry.data.status === 'enabled' ? 'активна' : 'неактивна'}`;

            default:
                return 'Неизвестное действие';
        }
    }

    // Генерация уникального ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

export default WeatherHistoryManager;