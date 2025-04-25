const chatPopup = document.getElementById('chatPopup');
const chatToggleBtn = document.getElementById('chatToggleBtn');
const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

// Toggle chat popup visibility
chatToggleBtn.addEventListener('click', () => {
    chatPopup.style.display = chatPopup.style.display === 'block' ? 'none' : 'block';
    chatPopup.scrollIntoView({ behavior: 'smooth' }); // Ensure visibility
});

// Send message to backend and display response
sendBtn.addEventListener('click', async () => {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Display user message
    const userMessageElem = document.createElement('div');
    userMessageElem.textContent = `You: ${userMessage}`;
    chatBody.appendChild(userMessageElem);

    // Send message to backend
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage }),
        });
        const data = await response.json();

        // Display bot response
        const botMessageElem = document.createElement('div');
        botMessageElem.textContent = `Bot: ${data.reply}`;
        chatBody.appendChild(botMessageElem);
    } catch (error) {
        console.error('Error connecting to chatbot backend:', error);
        const errorElem = document.createElement('div');
        errorElem.textContent = 'Error: Unable to connect to chatbot.';
        chatBody.appendChild(errorElem);
    }

    chatInput.value = '';
    chatBody.scrollTop = chatBody.scrollHeight; // Auto-scroll to the latest message
});