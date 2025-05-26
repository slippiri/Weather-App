// NotificationsManager.js - Модуль управления рекомендациями

class NotificationsManager {
    constructor(stringConverter) {
        this.stringConverter = stringConverter;
    }

    getRecommendations(data) {
        const isMetric = data.units === 'metric';
        const temp = data.currentConditions.temp;
        const wind = data.currentConditions.windspeed;
        const humidity = data.currentConditions.humidity;
        const conditions = data.currentConditions.conditions.toLowerCase();
        const uvindex = data.currentConditions.uvindex || 0;

        let recommendations = [];

        // Осадки и особые явления
        if (conditions.includes("rain") || conditions.includes("дождь")) {
            recommendations.push("Сейчас дождливо. Не забудьте взять зонт и надеть водонепроницаемую обувь.");
        }

        if (conditions.includes("Снег")) {
            recommendations.push("Идёт снег. Будьте осторожны на дорогах, возможно гололед.");
        }

        if (conditions.includes("туман")) {
            recommendations.push("На улице туман. Водителям следует снизить скорость и включить противотуманные фары.");
        }

        if (conditions.includes("гроза")) {
            recommendations.push("Гроза! По возможности оставайтесь в помещении, избегайте открытых пространств.");
        }

        // Температура - конвертируем в Цельсий для проверки условий
        const tempInCelsius = isMetric ? temp : this.stringConverter.fahrenheitToCelsius(temp);

        // Температура
        if (tempInCelsius < -10) {
            recommendations.push("Очень холодно. Наденьте тёплую многослойную одежду и защитите открытые участки кожи.");
        } else if (tempInCelsius < 0) {
            recommendations.push("Температура ниже нуля. Оденьтесь потеплее и будьте осторожны на скользких поверхностях.");
        } else if (tempInCelsius > 30) {
            recommendations.push("Очень жарко! Избегайте прямых солнечных лучей, пейте больше воды и носите лёгкую одежду.");
        } else if (tempInCelsius > 25) {
            recommendations.push("Жаркая погода. Не забывайте про головной убор и солнцезащитный крем.");
        }

        // Ветер - конвертируем в км/ч для проверки условий
        const windInKmh = isMetric ? wind : this.stringConverter.mphToKmh(wind);
        if (windInKmh > 15) {
            recommendations.push("Сильный ветер. Будьте осторожны на улице, держитесь подальше от деревьев и рекламных щитов.");
        }

        // УФ-защита
        if (uvindex >= 8) {
            recommendations.push("Экстремально высокий УФ-индекс. Используйте солнцезащитный крем SPF 50+, носите защитную одежду.");
        } else if (uvindex >= 6) {
            recommendations.push("Высокий уровень УФ-излучения. Рекомендуется использовать солнцезащитный крем.");
        }

        // Особые условия
        if (humidity > 80 && tempInCelsius > 20) {
            recommendations.push("Высокая влажность. Может ощущаться душно, пейте больше воды.");
        }

        if (conditions.includes("ясно") && tempInCelsius > 15 && tempInCelsius < 25 && humidity < 70) {
            recommendations.push("Отличная погода для прогулки! Насладитесь свежим воздухом.");
        }

        if (recommendations.length === 0) {
            recommendations.push("Комфортная погода. Приятного вам дня!");
        }

        return recommendations;
    }

    updateRecommendations(data) {
        const recommendations = this.getRecommendations(data);
        const container = document.getElementById('recommendations');
        
        container.innerHTML = recommendations
            .map(rec => `
                <div class="recommendation-item">
                    <i class="fas ${this.getRecommendationIcon(rec)}"></i>
                    ${rec}
                </div>
            `)
            .join('');
    }

    getRecommendationIcon(text) {
        if (text.includes('дождливо') || text.includes('зонт')) return 'fa-umbrella';
        if (text.includes('снег') || text.includes('гололед')) return 'fa-snowflake';
        if (text.includes('туман')) return 'fa-smog';
        if (text.includes('гроза')) return 'fa-bolt';
        if (text.includes('холодно') || text.includes('ниже нуля')) return 'fa-temperature-low';
        if (text.includes('жарко') || text.includes('солнцезащитный крем')) return 'fa-temperature-high';
        if (text.includes('УФ-')) return 'fa-sun';
        if (text.includes('ветер')) return 'fa-wind';
        if (text.includes('влажность')) return 'fa-tint';
        if (text.includes('прогулки') || text.includes('отличная погода')) return 'fa-walking';
        return 'fa-info-circle';
    }
}

export default NotificationsManager; 