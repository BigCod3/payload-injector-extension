(async () => {
    function getFieldLabel(element, index) {
        let label = element.name || element.id || element.getAttribute('aria-label') || element.placeholder || element.title;
        if (label) {
            label = label.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
            return label.substring(0, 50); // Keep labels reasonably short for URLs
        }
        const tagName = element.tagName.toLowerCase();
        const type = element.type ? element.type.toLowerCase() : '';
        return `${tagName}${type ? '_' + type : ''}_${index}`;
    }

    const result = await chrome.storage.sync.get(['baseUrl']);
    const basePayloadUrl = result.baseUrl;

    if (!basePayloadUrl) {
        console.warn("Payload Injector: Base URL not set. Please set it in the extension popup.");
        // You could also consider a more user-facing notification here if preferred
        return false; // Indicate to background script that something is wrong
    }

    const selectors = [
        'input[type="text"]',
        'input[type="search"]',
        'input[type="url"]',
        'input[type="email"]',
        'input[type="tel"]',
        'input[type="password"]',
        'input:not([type])', // Inputs with no specified type default to text
        'textarea'
    ];

    const allTextInputs = document.querySelectorAll(selectors.join(', '));
    let fieldsInjectedCount = 0;

    allTextInputs.forEach((inputField, index) => {
        // Check if the input field is visible and interactable
        if (inputField.offsetWidth > 0 || inputField.offsetHeight > 0 || inputField.getClientRects().length > 0) {
            const label = getFieldLabel(inputField, index);
            const fullPayload = basePayloadUrl + label;

            // Store the original value in case we need it, though not used in this version
            // const originalValue = inputField.value;

            // Set the value
            inputField.value = fullPayload;

            // *** NEW: Dispatch events to help frameworks recognize the change ***
            inputField.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            inputField.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
            // Some frameworks might also listen to 'blur' or other events,
            // but 'input' and 'change' are the most common for value updates.

            fieldsInjectedCount++;

            // Optional: Visually indicate that the field was modified
            // Consider if this visual cue itself could trigger some page logic, though unlikely for borders.
            const originalBorder = inputField.style.border;
            inputField.style.border = '2px solid orange';
            setTimeout(() => {
                inputField.style.border = originalBorder; // Reset to its original border
            }, 3000);
        }
    });

    console.log(`Payload Injector: Injected payloads into ${fieldsInjectedCount} fields.`);
    if (fieldsInjectedCount === 0) {
        console.warn("Payload Injector: No visible input fields found to inject.");
    }
    return true; // Indicate success or completion
})();