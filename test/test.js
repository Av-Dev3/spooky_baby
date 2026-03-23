// Test page interactions

document.addEventListener('DOMContentLoaded', () => {
    // Drawer nav
    const drawerToggle = document.getElementById('drawerToggle');
    const drawerPanel = document.getElementById('drawerPanel');
    const drawerClose = document.getElementById('drawerClose');
    const drawerOverlay = document.getElementById('drawerOverlay');

    if (drawerToggle && drawerPanel) {
        drawerToggle.addEventListener('click', () => {
            drawerPanel.classList.add('open');
            drawerOverlay?.classList.add('visible');
        });

        const closeDrawer = () => {
            drawerPanel.classList.remove('open');
            drawerOverlay?.classList.remove('visible');
        };

        drawerClose?.addEventListener('click', closeDrawer);
        drawerOverlay?.addEventListener('click', closeDrawer);
    }

    // Accordion
    const triggers = document.querySelectorAll('.accordion-trigger');
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const wasActive = trigger.classList.contains('active');
            const content = trigger.nextElementSibling;

            // Close all
            triggers.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('open'));

            // Open clicked if it wasn't already open
            if (!wasActive) {
                trigger.classList.add('active');
                content?.classList.add('open');
            }
        });
    });

    // Pill nav - toggle active on click (demo)
    document.querySelectorAll('.nav-pill a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-pill a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
        });
    });
});
