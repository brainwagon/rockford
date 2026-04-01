document.addEventListener('DOMContentLoaded', () => {
    const btnLandscape = document.getElementById('btn-landscape');
    const btnPortrait = document.getElementById('btn-portrait');
    const businessCard = document.getElementById('business-card');
    const templateSelect = document.getElementById('template-select');

    // Orientation Logic
    btnLandscape.addEventListener('click', () => {
        businessCard.classList.remove('portrait');
        businessCard.classList.add('landscape');
        btnLandscape.classList.add('active');
        btnPortrait.classList.remove('active');
    });

    btnPortrait.addEventListener('click', () => {
        businessCard.classList.remove('landscape');
        businessCard.classList.add('portrait');
        btnPortrait.classList.add('active');
        btnLandscape.classList.remove('active');
    });

    // Template Logic
    templateSelect.addEventListener('change', (e) => {
        const selectedTemplate = e.target.value;
        businessCard.classList.remove('minimal', 'modern', 'elegant');
        businessCard.classList.add(selectedTemplate);
    });
});
