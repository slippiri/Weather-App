// StringConverter.js - Модуль конвертации данных

class StringConverter {
    constructor() {
        this.weatherTranslations = {
            'rain': 'Дождь',
            'partially cloudy': 'Переменная облачность',
            'overcast': 'Пасмурно',
            'clear': 'Ясно',
            'snow': 'Снег'
        };
    }

    celsiusToFahrenheit(celsius) {
        return Math.round((celsius * 9 / 5 + 32) * 10) / 10;
    }

    fahrenheitToCelsius(fahrenheit) {
        return Math.round(((fahrenheit - 32) * 5 / 9) * 10) / 10;
    }

    kmhToMph(kmh) {
        return Math.round(kmh * 0.621371);
    }

    mphToKmh(mph) {
        return Math.round(mph / 0.621371);
    }

    translateWeather(conditions) {
        const lowerConditions = conditions.toLowerCase();
        for (const [key, translation] of Object.entries(this.weatherTranslations)) {
            if (lowerConditions.includes(key)) return translation;
        }
        return conditions;
    }
}

export default StringConverter; 