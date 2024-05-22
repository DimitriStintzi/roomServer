"use strict";

(function () {
    const ip = 'localhost';
    let ws;
    const messages = document.getElementById('messages');
    const wsOpen = document.getElementById('ws-open');
    const wsClose = document.getElementById('ws-close');
    const wsSend = document.getElementById('ws-send');
    const wsInput = document.getElementById('ws-input');
    const jumpbtn = document.getElementById('up');
    const left = document.getElementById('left');
    const right = document.getElementById('right');
    const down = document.getElementById('down');
    const wsEcran = document.getElementById('plein_ecran_btn');

    wsEcran.addEventListener("click", function () {
        toggleFullScreen();
    });

    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    function showMessage(message) {
        if (!messages) {
            return;
        }
        messages.textContent += `\n${message}`;
        messages.scrollTop = messages.scrollHeight;
    }

    function closeConnection() {
        if (ws) {
            ws.close();
        }
    }

    wsOpen.addEventListener('click', () => {
        closeConnection();
        ws = new WebSocket(`ws://${ip}:8080`);
        ws.addEventListener('error', () => {
            showMessage('WebSocket error');
        });
        ws.addEventListener('open', () => {
            showMessage('WebSocket connection established');
        });
        ws.addEventListener('close', () => {
            showMessage('WebSocket connection closed');
        });
        ws.addEventListener('message', (msg) => {
            showMessage(`Received message: ${msg.data}`);
        });
    });

    function sendMessage(message) {
        if (ws) {
            ws.send(message);
        } else {
            showMessage('No WebSocket connection');
        }
    }

    function handlePointerDown(button, message) {
        button.onpointerdown = () => {
            sendMessage(message + 'Down');
        };
    }

    function handlePointerUp(button, message) {
        button.onpointerup = () => {
            sendMessage(message + 'Up');
        };
        button.onpointerleave = () => {
            sendMessage(message + 'Up');
        };
        button.onpointercancel = () => {
            sendMessage(message + 'Up');
        };
    }

    handlePointerDown(jumpbtn, 'Jump');
    handlePointerUp(jumpbtn, 'Jump');
    handlePointerDown(left, 'Left');
    handlePointerUp(left, 'Left');
    handlePointerDown(right, 'Right');
    handlePointerUp(right, 'Right');
    handlePointerDown(down, 'Down');
    handlePointerUp(down, 'Down');

    wsClose.addEventListener('click', closeConnection);

    if (wsSend) {
        wsSend.addEventListener('click', () => {
            const val = wsInput.value;
            if (!val) {
                return;
            } else if (!ws) {
                showMessage('No WebSocket connection');
                return;
            }
            ws.send(val);
            showMessage(`Sent "${val}"`);
            wsInput.value = '';
        });
    }
})();
