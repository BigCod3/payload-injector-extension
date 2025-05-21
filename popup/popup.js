document.addEventListener('DOMContentLoaded', function () {
    const baseUrlInput = document.getElementById('baseUrl');
    const saveButton = document.getElementById('saveButton');
    const statusMessage = document.getElementById('statusMessage');

    // Load saved base URL
    chrome.storage.sync.get(['baseUrl'], function (result) {
        if (result.baseUrl) {
            baseUrlInput.value = result.baseUrl;
        } else {
            // Set your default base URL here
            baseUrlInput.value = 'https://request-spy.iownthisdomainname.net/';
        }
    });

    // Save base URL
    saveButton.addEventListener('click', function () {
        const baseUrl = baseUrlInput.value.trim();
        if (baseUrl) {
            // Ensure it ends with a slash if it's a path prefix
            const urlToSave = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
            chrome.storage.sync.set({ baseUrl: urlToSave }, function () {
                statusMessage.textContent = 'Settings saved!';
                statusMessage.style.color = 'green';
                setTimeout(() => {
                    statusMessage.textContent = '';
                }, 2000);
            });
        } else {
            statusMessage.textContent = 'Base URL cannot be empty.';
            statusMessage.style.color = 'red';
        }
    });
});