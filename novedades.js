document.addEventListener('DOMContentLoaded', function() {
    // Get all tab links and content
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    // Add click event to each tab
    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabLinks.forEach(tab => tab.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            link.classList.add('active');
            const tabId = link.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
});
