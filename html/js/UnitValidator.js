// UnitValidator.js - Модуль валидации данных

class UnitValidator {
    validateCityInput(value) {
        // Проверяем каждый символ на допустимость
        const isAllowed = /^[\p{L}\s\-']*$/u.test(value);
        
        if (!isAllowed) {
            return {
                isValid: false,
                value: value.replace(/[^\p{L}\s\-']/gu, ''),
                message: 'Допустимы только буквы, пробелы, дефис и апостроф'
            };
        }
        
        // Убираем множественные пробелы
        const cleanedValue = value.replace(/\s{2,}/g, ' ').trim();
        
        // Проверяем минимальную длину
        if (cleanedValue.length < 2) {
            return {
                isValid: false,
                value: cleanedValue,
                message: 'Название города должно содержать минимум 2 символа'
            };
        }

        return {
            isValid: true,
            value: cleanedValue,
            message: ''
        };
    }

    validateLabelInput(value) {
        // Проверяем на допустимые символы (буквы, цифры, пробелы, дефис)
        const isAllowed = /^[\p{L}\s'0-9-]*$/u.test(value);
        
        if (!isAllowed) {
            return {
                isValid: false,
                value: value.replace(/[^\p{L}\s'0-9-]/gu, ''),
                message: 'Допустимы только буквы, цифры, пробелы и дефис'
            };
        }
        
        // Очищаем от лишних пробелов и символов
        const cleanedValue = value
            .replace(/\s{2,}/g, ' ')
            .replace(/(^[\s'-]+)|([\s'-]+$)/g, '')
            .trim();
        
        // Проверяем минимальную длину
        if (cleanedValue.length < 2) {
            return {
                isValid: false,
                value: cleanedValue,
                message: 'Метка должна содержать минимум 2 символа'
            };
        }

        return {
            isValid: true,
            value: cleanedValue,
            message: ''
        };
    }
}

export default UnitValidator; 