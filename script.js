 let chatHistory = [];
        const MAX_CHARS = 2000;
        const WELCOME_MESSAGE = "Hello! I'm PozzyAI, your AI assistant. How can I help you today?";

        function autoResize(textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
        }

        function updateCharCount(textarea) {
            const maxLength = parseInt(textarea.getAttribute('maxlength'));
            const currentLength = textarea.value.length;
            const charCountDiv = document.querySelector('.char-count');
            
            charCountDiv.textContent = `${currentLength}/${maxLength}`;
            
            if (currentLength >= maxLength) {
                charCountDiv.classList.add('at-limit');
                charCountDiv.classList.remove('near-limit');
            } else if (currentLength >= maxLength * 0.8) {
                charCountDiv.classList.add('near-limit');
                charCountDiv.classList.remove('at-limit');
            } else {
                charCountDiv.classList.remove('near-limit', 'at-limit');
            }
        }

        function escapeHtml(unsafe) {
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function formatMessage(message) {
            // Replace code blocks with properly formatted HTML
            return message.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, language, code) {
                const lang = language || 'plaintext';
                return `<div class="code-wrapper">
                    <div class="code-header">
                        <span>${lang}</span>
                        <button class="copy-button" onclick="copyCode(this)">Copy code</button>
                    </div>
                    <pre class="code-block"><code>${escapeHtml(code.trim())}</code></pre>
                </div>`;
            });
        }

        function copyCode(button) {
            const codeBlock = button.closest('.code-wrapper').querySelector('code');
            const text = codeBlock.textContent;
            
            navigator.clipboard.writeText(text).then(() => {
                button.textContent = 'Copied!';
                button.classList.add('copied');
                
                setTimeout(() => {
                    button.textContent = 'Copy code';
                    button.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        }

        function setInputState(disabled) {
            const userInput = document.getElementById('user-input');
            const sendButton = document.getElementById('send-button');
            const clearButton = document.querySelector('.action-button');
            const typingIndicator = document.getElementById('typing');
            
            userInput.disabled = disabled;
            sendButton.disabled = disabled;
            if (clearButton) clearButton.disabled = disabled;
            
            if (disabled) {
                typingIndicator.style.display = 'block';
            } else {
                typingIndicator.style.display = 'none';
            }
        }

        function resetInput() {
            const userInput = document.getElementById('user-input');
            userInput.value = '';
            userInput.style.height = '48px';
            updateCharCount(userInput);
        }

        function clearChat() {
            chatHistory = [];
            document.getElementById('messages').innerHTML = '';
            document.getElementById('typing').style.display = 'none';
            addMessageToChat(WELCOME_MESSAGE, false);
        }

        async function sendMessage() {
            const userInput = document.getElementById('user-input');
            const message = userInput.value.trim();
            
            if (!message) return;
            
            // Store message and reset input before sending
            const pendingMessage = message;
            addMessageToChat(pendingMessage, true);
            resetInput();
            
            try {
                setInputState(true);
                
                const response = await fetch('http://pozzyai.duckdns.org/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: pendingMessage,
                        history: chatHistory
                    })
                });

                const data = await response.json();
                
                if (data.success) {
                    addMessageToChat(data.response, false);
                } else {
                    addMessageToChat("I apologize, but I encountered an error. Please try again.", false);
                }
            } catch (error) {
                console.error('Error:', error);
                addMessageToChat("I apologize, but I encountered an error. Please try again.", false);
            } finally {
                setInputState(false);
            }
        }

        function addMessageToChat(message, isUser) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user-message' : 'assistant-message'}`;
            
            // Format the message content
            const formattedContent = formatMessage(message);
            messageDiv.innerHTML = `<strong>${isUser ? 'You' : 'PozzyAI'}:</strong> ${formattedContent}`;
            
            document.getElementById('messages').appendChild(messageDiv);
            document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
            
            chatHistory.push({
                role: isUser ? 'user' : 'assistant',
                content: message
            });
        }

        document.getElementById('user-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey && !this.disabled) {
                e.preventDefault();
                sendMessage();
            }
        });

        document.addEventListener('DOMContentLoaded', function() {
            addMessageToChat(WELCOME_MESSAGE, false);
        });