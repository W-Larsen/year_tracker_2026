const configs = [
            { id: 'grid-training', count: 156, key: 'training' },
            { id: 'grid-english', count: 80, key: 'english' },
            { id: 'grid-squash', count: 20, key: 'squash' },
            { id: 'grid-books', count: 5, key: 'books' },
            { id: 'grid-games', count: 5, key: 'games' },
            { id: 'grid-films-cinema', count: 20, key: 'films-cinema' },
            { id: 'grid-films-home', count: 30, key: 'films-home' }
        ];

        const counterDefs = [
            { id: 'text-training', keys: ['training'] },
            { id: 'text-films', keys: ['films-cinema', 'films-home'] },
            { id: 'text-english', keys: ['english'] },
            { id: 'text-squash', keys: ['squash'] },
            { id: 'text-books', keys: ['books'] },
            { id: 'text-games', keys: ['games'] }
        ];

        const configTotals = new Map(configs.map(config => [config.key, config.count]));

        function getStoredCount(key) {
            const data = JSON.parse(localStorage.getItem('tracker_2026_' + key)) || [];
            return data.length;
        }

        function updateCounters() {
            counterDefs.forEach(def => {
                const total = def.keys.reduce((sum, key) => sum + (configTotals.get(key) || 0), 0);
                const filled = def.keys.reduce((sum, key) => sum + getStoredCount(key), 0);
                const el = document.getElementById(def.id);
                if (el) el.textContent = `${filled}/${total}`;
            });

            const cinemaTotal = configTotals.get('films-cinema') || 0;
            const cinemaFilled = getStoredCount('films-cinema');
            const cinemaLabel = document.getElementById('cinema-label');
            if (cinemaLabel) cinemaLabel.textContent = `${cinemaFilled}/${cinemaTotal} in the cinema`;
        }

        function initTracker() {
            configs.forEach(config => {
                const container = document.getElementById(config.id);
                const savedData = JSON.parse(localStorage.getItem('tracker_2026_' + config.key)) || [];

                for (let i = 0; i < config.count; i++) {
                    const dot = document.createElement('div');
                    dot.classList.add('dot');
                    if (savedData.includes(i)) dot.classList.add('filled');

                    dot.addEventListener('click', () => {
                        dot.classList.toggle('filled');
                        saveState(config.key, i, dot.classList.contains('filled'));
                    });
                    container.appendChild(dot);
                }
            });
            updateCounters();
        }

        function saveState(key, index, isFilled) {
            const storageKey = 'tracker_2026_' + key;
            let currentData = JSON.parse(localStorage.getItem(storageKey)) || [];
            if (isFilled) {
                if (!currentData.includes(index)) currentData.push(index);
            } else {
                currentData = currentData.filter(i => i !== index);
            }
            localStorage.setItem(storageKey, JSON.stringify(currentData));
            updateCounters();
        }

        const BASE_WIDTH = 2400;
        const BASE_HEIGHT = 1300;
        const BASE_HEADER_HEIGHT = 380;
        const BASE_HEADER_FONT = 285;
        const BASE_FOOTER_HEIGHT = 64;
        const BASE_FOOTER_FONT = 16;
        const MOBILE_BREAKPOINT = 1200;

        function updateLayout() {
            const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
            document.body.classList.toggle('mobile-layout', isMobile);

            const wrapper = document.querySelector('.canvas-wrapper');
            const canvas = document.querySelector('.canvas-area');

            if (isMobile) {
                wrapper.style.width = '';
                wrapper.style.height = '';
                canvas.style.transform = '';
                document.documentElement.style.removeProperty('--header-height');
                document.documentElement.style.removeProperty('--header-font-size');
                document.documentElement.style.removeProperty('--footer-height');
                document.documentElement.style.removeProperty('--footer-font-size');
                return;
            }

            const padding = 32;
            const availableWidth = window.innerWidth - padding;
            const availableHeight = window.innerHeight - padding;
            const totalBaseHeight = BASE_HEIGHT + BASE_FOOTER_HEIGHT;
            const scale = Math.min(1, availableWidth / BASE_WIDTH, availableHeight / totalBaseHeight);

            wrapper.style.width = `${BASE_WIDTH * scale}px`;
            wrapper.style.height = `${BASE_HEIGHT * scale}px`;
            canvas.style.transform = `scale(${scale})`;
            document.documentElement.style.setProperty('--header-height', `${BASE_HEADER_HEIGHT * scale}px`);
            document.documentElement.style.setProperty('--header-font-size', `${BASE_HEADER_FONT * scale}px`);
            document.documentElement.style.setProperty('--footer-height', `${BASE_FOOTER_HEIGHT * scale}px`);
            document.documentElement.style.setProperty('--footer-font-size', `${BASE_FOOTER_FONT * scale}px`);
        }

        document.addEventListener('DOMContentLoaded', () => {
            initTracker();
            updateLayout();
        });
        window.addEventListener('resize', updateLayout);
