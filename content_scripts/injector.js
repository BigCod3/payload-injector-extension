(async () => {
    function getFieldLabel(element, index) {
        let label = element.name || element.id || element.getAttribute('aria-label') || element.placeholder || element.title;
        if (label) {
            // Sanitize the label:
            // 1. Replace whitespace sequences with a single underscore.
            // 2. Remove characters that are not alphanumeric or underscore.
            // 3. Convert to lowercase.
            // 4. Truncate if too long (e.g., > 50 chars) to keep URLs reasonable.
            label = label.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
            return label.substring(0, 50);
        }
        // Fallback label using element type and index
        const tagName = element.tagName.toLowerCase();
        const type = element.type ? element.type.toLowerCase() : '';
        return `${tagName}${type ? '_' + type : ''}_${index}`;
    }

    const result = await chrome.storage.sync.get(['baseUrl']);
    const basePayloadUrl = result.baseUrl;

    if (!basePayloadUrl) {
        console.warn("Payload Injector: Base URL not set. Please set it in the extension popup.");
        // alert("Payload Injector: Base URL not set. Please set it in the extension popup.");
        return false; // Indicate to background script that something is wrong
    }

    // More specific selectors for text-like inputs
    const selectors = [
        'input[type="text"]',
        'input[type="search"]',
        'input[type="url"]',
        'input[type="email"]',
        'input[type="tel"]',
        'input[type="password"]', // Be cautious with password fields, but often a target
        'input:not([type])', // Inputs with no specified type default to text
        'textarea'
    ];

    const allTextInputs = document.querySelectorAll(selectors.join(', '));
    let fieldsInjectedCount = 0;

    allTextInputs.forEach((inputField, index) => {
        if (inputField.offsetWidth > 0 || inputField.offsetHeight > 0 || inputField.getClientRects().length > 0) { // Check if visible
            const label = getFieldLabel(inputField, index);
            const fullPayload = basePayloadUrl + label;
            inputField.value = fullPayload;
            fieldsInjectedCount++;

            // Optional: Visually indicate that the field was modified
            inputField.style.border = '2px solid orange';
            setTimeout(() => {
                inputField.style.border = ''; // Reset border
            }, 3000);
        }
    });

    console.log(`Payload Injector: Injected payloads into ${fieldsInjectedCount} fields.`);
    return true; // Indicate success
})();