// Theme toggle universal untuk Cloud File
(function() {
    function setTheme(dark) {
        const icon = document.querySelector('#themeToggle i');
        if (dark) {
            document.body.classList.add('dark-mode');
            if(icon) { icon.classList.remove('bi-moon'); icon.classList.add('bi-sun'); }
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            if(icon) { icon.classList.remove('bi-sun'); icon.classList.add('bi-moon'); }
            localStorage.setItem('theme', 'light');
        }
    }
    document.addEventListener('DOMContentLoaded', function() {
        // Set theme dari localStorage
        setTheme(localStorage.getItem('theme') === 'dark');
        // Event toggle
        const themeToggle = document.getElementById('themeToggle');
        if(themeToggle) {
            themeToggle.addEventListener('click', function(e) {
                setTheme(!document.body.classList.contains('dark-mode'));
            });
        }
    });
})(); 