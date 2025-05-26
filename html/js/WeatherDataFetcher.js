// WeatherDataFetcher.js - Модуль получения данных о погоде

class WeatherDataFetcher {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
    }

    async getWeather(queryParam, units, currentViewMode, currentFavorite, forceUpdate = false) {
        const cacheKey = `${queryParam}_${units}_${currentViewMode}_${currentFavorite || 'nofav'}`;

        // Проверяем кэш, если не требуется принудительное обновление
        if (!forceUpdate) {
            const cachedData = this.cacheManager.get(cacheKey);
            if (cachedData) {
                return cachedData;
            }
        }

        try {
            // Проверка интернет-соединения
            if (!navigator.onLine) {
                throw new Error('Нет подключения к интернету. Проверьте ваше соединение и попробуйте снова.');
            }

            const response = await fetch(`/weather?query=${encodeURIComponent(queryParam)}&units=${units}&days=15`);
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Ошибка при получении данных о погоде';
                
                try {
                    const errorData = JSON.parse(errorText);
                    if (errorData.detail) {
                        errorMessage = errorData.detail;
                    } else if (errorData.title) {
                        errorMessage = errorData.title;
                    }
                } catch (e) {
                    if (errorText) {
                        errorMessage = errorText;
                    }
                }
                
                throw new Error(errorMessage);
            }

            const data = await response.json();
            data.viewMode = currentViewMode;
            data.units = units;

            // Сохраняем в кэш
            this.cacheManager.set(cacheKey, data);

            return data;

        } catch (error) {
            let errorMessage = error.message;
            
            if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
                errorMessage = 'Проблемы с интернет-соединением. Проверьте подключение к интернету и попробуйте снова.';
            } else if (errorMessage.includes('timeout')) {
                errorMessage = 'Превышено время ожидания ответа от сервера. Проверьте ваше интернет-соединение и попробуйте снова.';
            } else if (errorMessage.includes('400')) {
                errorMessage = 'Некорректный запрос. Проверьте название города.';
            } else if (errorMessage.includes('404')) {
                errorMessage = 'Город не найден. Проверьте название.';
            } else if (errorMessage.includes('500')) {
                errorMessage = 'Ошибка сервера. Попробуйте позже.';
            }

            throw new Error(errorMessage);
        }
    }

    async validateCity(city) {
        try {
            const response = await fetch(`/weather?query=${encodeURIComponent(city)}&units=metric`);
            if (!response.ok) {
                const errorText = await response.text();
                try {
                    const errorData = JSON.parse(errorText);
                    if (errorData.error?.toLowerCase().includes('city not found')) {
                        throw new Error('Город не существует! Проверьте название');
                    }
                } catch (e) {
                    throw new Error(errorText || 'Ошибка проверки города');
                }
            }
            return true;
        } catch (error) {
            throw error;
        }
    }
}

export default WeatherDataFetcher; 