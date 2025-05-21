chrome.commands.onCommand.addListener((command) => {
    if (command === "inject_payloads") {
        triggerPayloadInjection();
    }
});

// Also listen for clicks on the extension action (toolbar icon)
// This is optional, but some users might click the icon expecting an action
// For this extension, the primary trigger is the hotkey, popup is for settings.
// If you wanted the icon click to also trigger injection, you'd add:
/*
chrome.action.onClicked.addListener((tab) => {
  triggerPayloadInjection();
});
*/


function triggerPayloadInjection() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['content_scripts/injector.js']
            }, (injectionResults) => {
                if (chrome.runtime.lastError) {
                    console.error("Script injection failed: " + chrome.runtime.lastError.message);
                } else if (injectionResults && injectionResults[0] && injectionResults[0].result === false) {
                    console.warn("Payload injection script indicated an issue (e.g., no base URL set).");
                    // Optionally, you could try to notify the user here, e.g., by briefly changing the icon
                    // or opening the popup if the base URL is not set.
                }
            });
        } else {
            console.error("Could not find active tab.");
        }
    });
}