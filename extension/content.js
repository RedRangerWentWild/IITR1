"use client";

// Gmail Selector Constants
const GMAIL_COMPOSE_MODAL = '.aoI';
const GMAIL_BODY_EDITABLE = '.Am.Al.editable';
const GMAIL_TOOLBAR = '.btC';

console.log("EmailFlow: Chrome Extension active");

function createEmailFlowButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'emailflow-inject-btn';
    btn.innerHTML = `
    <span style="margin-right: 6px; font-style: italic;">EF</span>
    Convert to Formal
  `;
    btn.style.cssText = `
    background: #007AFF;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 12px;
    font-weight: 900;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-right: 12px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
    transition: all 0.2s;
    display: flex;
    align-items: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;
  `;

    btn.onmouseover = () => btn.style.transform = 'translateY(-1px)';
    btn.onmouseout = () => btn.style.transform = 'translateY(0)';

    return btn;
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
            const composeBox = document.querySelector(GMAIL_COMPOSE_MODAL);
            if (composeBox && !composeBox.querySelector('.emailflow-inject-btn')) {
                const toolbar = composeBox.querySelector(GMAIL_TOOLBAR);
                if (toolbar) {
                    const efBtn = createEmailFlowButton();
                    efBtn.onclick = async (e) => {
                        e.preventDefault();
                        const body = composeBox.querySelector(GMAIL_BODY_EDITABLE);
                        const text = body?.innerText || '';

                        if (!text.trim()) {
                            alert("Type something first!");
                            return;
                        }

                        efBtn.innerText = "Converting...";
                        efBtn.style.opacity = "0.7";

                        // Send to background script
                        chrome.runtime.sendMessage({
                            type: 'CONVERT_DRAFT',
                            data: { userInput: text }
                        }, (response) => {
                            if (response && response.success) {
                                if (body) {
                                    // Replace body with converted content
                                    body.innerHTML = response.data.convertedEmail.body.replace(/\n/g, '<br>');
                                }
                            } else {
                                alert("Conversion failed. Is the backend running?");
                            }
                            efBtn.innerHTML = '<span style="margin-right: 6px; font-style: italic;">EF</span> Convert to Formal';
                            efBtn.style.opacity = "1";
                        });
                    };
                    toolbar.prepend(efBtn);
                }
            }
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });
