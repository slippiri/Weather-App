// WeatherCardView.js - Модуль отображения карточки погоды

class WeatherCardView {
    constructor(stringConverter) {
        this.stringConverter = stringConverter;
    }

    updateUI(data, units) {
        const isMetric = units === 'metric';
        
        // Обновляем основную информацию
        document.getElementById('temperature').textContent = 
            `${data.currentConditions.temp}°${isMetric ? 'C' : 'F'}`;
        document.getElementById('humidity').textContent = `${data.currentConditions.humidity}%`;
        document.getElementById('windSpeed').textContent = 
            `${isMetric ? data.currentConditions.windspeed : this.stringConverter.kmhToMph(data.currentConditions.windspeed)} ${isMetric ? 'км/ч' : 'миль/ч'}`;

        // Обновляем название города
        if (data.viewMode === 'favorite' && data.currentFavorite) {
            document.getElementById('cityName').textContent = data.currentFavorite;
        } else {
            document.getElementById('cityName').textContent = data.address;
        }

        // Рендерим прогноз на 5 дней
        this.renderForecast(data, 'mainForecast', 5);
        
        // Обновляем данные о погоде в глобальной переменной
        window.updateWeatherData(data);
    }

    renderForecast(data, containerId, daysCount, startDay = 0) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        const daysToShow = data.days.slice(startDay, startDay + daysCount);
        const isMetric = data.units === 'metric';

        container.innerHTML = daysToShow.map(day => `
            <div class="forecast-day">
                <div class="date">
                    ${new Date(day.datetime).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long'
                    })}
                </div>
                <i class="fas ${this.getWeatherIcon(day.conditions)} weather-icon"></i>
                <div class="temperature">
                    ${day.temp}°${isMetric ? 'C' : 'F'}
                </div>
                <div class="details">
                    <div>💧 ${day.humidity}%</div>
                    <div>🌬️ ${isMetric ?
                        `${day.windspeed} км/ч` :
                        `${this.stringConverter.kmhToMph(day.windspeed)} миль/ч`}
                    </div>
                </div>
                <div class="conditions">${this.stringConverter.translateWeather(day.conditions)}</div>
            </div>
        `).join('');

        container.querySelectorAll('.forecast-day').forEach((el, index) => {
            el.style.animation = `fadeIn 0.5s ease ${index * 0.1}s forwards`;
        });
    }

    getWeatherIcon(conditions) {
        const weatherMap = {
            'rain': 'fa-cloud-rain',
            'partially cloudy': 'fa-cloud-sun',
            'overcast': 'fa-cloud',
            'clear': 'fa-sun',
            'snow': 'fa-snowflake'
        };
        const lowerConditions = conditions.toLowerCase();
        for (const [key, icon] of Object.entries(weatherMap)) {
            if (lowerConditions.includes(key)) return icon;
        }
        return 'fa-question';
    }

    toggleExtendedForecast(data) {
        const extended = document.getElementById('extendedForecast');
        const buttonIcon = document.querySelector('.expand-button i');
        const mainForecast = document.getElementById('mainForecast');

        if (!extended.classList.contains('active')) {
            // Показываем все 15 дней в основном контейнере
            this.renderForecast(data, 'mainForecast', 15);
            extended.classList.add('active');
            buttonIcon.classList.replace('fa-chevron-down', 'fa-chevron-up');
        } else {
            // Возвращаем отображение 5 дней
            this.renderForecast(data, 'mainForecast', 5);
            extended.classList.remove('active');
            buttonIcon.classList.replace('fa-chevron-up', 'fa-chevron-down');
        }
    }
}

export default WeatherCardView; 