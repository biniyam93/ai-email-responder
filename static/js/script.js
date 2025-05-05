document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('emailInput');
    const submitBtn = document.getElementById('submitBtn');
    const responseOutput = document.getElementById('responseOutput');
    const sourceBadge = document.getElementById('sourceBadge');

    submitBtn.addEventListener('click', async () => {
        const emailText = emailInput.value.trim();
        if (!emailText) {
            alert('Please enter an email');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Generating Response...';
        responseOutput.innerHTML = '<div class="loading">Processing...</div>';

        try {
            const response = await fetch('/api/respond', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email_text: emailText })
            });

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            responseOutput.innerHTML = `<div class="response-text">${data.reply}</div>`;
            sourceBadge.textContent = `Source: ${data.source}`;
        } catch (error) {
            console.error('Error:', error);
            responseOutput.innerHTML = `<div class="error">Error: ${error.message}</div>`;
            sourceBadge.textContent = '';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Generate Response';
        }
    });

    // Allow pressing Enter in textarea (Shift+Enter for new line)
    emailInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitBtn.click();
        }
    });
});