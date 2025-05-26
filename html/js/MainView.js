// MainView.js - Модуль управления главным окном и навигацией

class MainView {
    constructor() {
        this.initializeNavigation();
    }

    // Метод для настройки навигационного меню
    initializeNavigation() {
        document.querySelectorAll('.neon-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('a').getAttribute('data-section');
                this.showSection(section);
            });
        });
    }

    // Метод для переключения между секциями приложения
    showSection(sectionId) {
        document.querySelectorAll('.active-section').forEach(el => {
            el.classList.remove('active-section');
            el.classList.add('section-hidden');
        });
        document.getElementById(sectionId).classList.add('active-section');
        document.getElementById(sectionId).classList.remove('section-hidden');
    }
}

export default MainView; 