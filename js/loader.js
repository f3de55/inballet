// Caricamento dinamico di navbar, footer e chatbot
(function() {
    async function loadComponent(url, targetSelector) {
        try {
            const target = document.querySelector(targetSelector);
            // Non caricare se già presente contenuto (caricato via PHP)
            if (!target || target.innerHTML.trim()) return;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Errore nel caricamento: ${response.status}`);
            const html = await response.text();

            // Estrai e gestisci script separatamente
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            const scripts = tempDiv.querySelectorAll('script');
            const scriptsCode = Array.from(scripts).map(s => s.textContent).join('\n');
            scripts.forEach(s => s.remove());

            target.innerHTML = tempDiv.innerHTML;

            // Esegui script dopo inserimento HTML
            if (scriptsCode) {
                const scriptElement = document.createElement('script');
                scriptElement.textContent = scriptsCode;
                document.body.appendChild(scriptElement);
            }
        } catch (error) {}
    }

    async function loadBanner() {
        try {
            // Non caricare se già presente (caricato via PHP)
            if (document.getElementById('eventBanner')) return;

            const response = await fetch('components/banner.html');
            if (!response.ok) return;
            const html = await response.text();

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            const scripts = tempDiv.querySelectorAll('script');
            const scriptsCode = Array.from(scripts).map(s => s.textContent).join('\n');
            scripts.forEach(s => s.remove());

            // Inserisci banner prima dell'header
            const header = document.querySelector('header.main-header');
            if (header) {
                header.insertAdjacentHTML('beforebegin', tempDiv.innerHTML);
            }

            // Esegui script
            if (scriptsCode) {
                const scriptElement = document.createElement('script');
                scriptElement.textContent = scriptsCode;
                document.body.appendChild(scriptElement);
            }
        } catch (error) {}
    }

    async function loadChatbot() {
        try {
            // Non caricare se già presente
            if (document.getElementById('cb-toggle')) return;

            const response = await fetch('components/chatbot.html');
            if (!response.ok) return;
            const html = await response.text();

            // Inserisci HTML e CSS direttamente nel body
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            // Estrai e inserisci stili
            const styles = tempDiv.querySelectorAll('style');
            styles.forEach(style => {
                document.head.appendChild(style);
            });

            // Estrai e inserisci HTML (senza script)
            const scripts = tempDiv.querySelectorAll('script');
            const scriptsCode = Array.from(scripts).map(s => s.textContent).join('\n');
            scripts.forEach(s => s.remove());

            document.body.insertAdjacentHTML('beforeend', tempDiv.innerHTML);

            // Esegui script dopo che HTML è stato inserito
            if (scriptsCode) {
                const scriptElement = document.createElement('script');
                scriptElement.textContent = scriptsCode;
                document.body.appendChild(scriptElement);
            }
        } catch (error) {
            console.error('Errore caricamento chatbot:', error);
        }
    }

    async function initComponents() {
        await loadComponent('components/navbar.html', 'header.main-header');
        await loadComponent('components/footer.html', 'footer.footer');
        await loadBanner();
        await loadChatbot();
        setTimeout(() => window.dispatchEvent(new Event('componentsLoaded')), 0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initComponents);
    } else {
        initComponents();
    }
})();
