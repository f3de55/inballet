// Caricamento dinamico di navbar e footer
(function() {
    async function loadComponent(url, targetSelector) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Errore nel caricamento: ${response.status}`);
            const html = await response.text();
            const target = document.querySelector(targetSelector);
            if (target) target.innerHTML = html;
        } catch (error) {}
    }

    async function initComponents() {
        await loadComponent('components/navbar.html', 'header.main-header');
        await loadComponent('components/footer.html', 'footer.footer');
        setTimeout(() => window.dispatchEvent(new Event('componentsLoaded')), 0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initComponents);
    } else {
        initComponents();
    }
})();
