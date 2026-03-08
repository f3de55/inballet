// Caricamento dinamico di navbar e footer
(function() {
    async function loadComponent(url, targetSelector) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Errore nel caricamento: ${response.status}`);
            const html = await response.text();
            const target = document.querySelector(targetSelector);
            if (target) {
                target.innerHTML = html;
            }
        } catch (error) {
            console.error(`Errore nel caricamento di ${url}:`, error);
        }
    }

    async function initComponents() {
        await loadComponent('components/navbar.html', 'header.main-header');
        await loadComponent('components/footer.html', 'footer.footer');

        // Attendi un tick per assicurarti che il DOM sia aggiornato
        setTimeout(() => {
            // Triggera evento custom per notificare che i componenti sono pronti
            window.dispatchEvent(new Event('componentsLoaded'));
        }, 0);
    }

    // Carica i componenti quando il DOM è pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initComponents);
    } else {
        initComponents();
    }
})();
