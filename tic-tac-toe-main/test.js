const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const port = 8080;
const ip = '192.168.1.103';

// Configurer les chemins pour servir les fichiers statiques
app.use('/bootstrap/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/bootstrap/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates/index.html'));
});

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates/index.html'));
});

// Créer un serveur WebSocket
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');

    // Écouter les messages du client
    ws.on('message', (message) => {
        console.log(`Received message => ${message}`);

        // Exemple : renvoyer les données reçues
        ws.send(`You said: ${message}`);
    });

    // Gérer la déconnexion du client
    ws.on('close', () => {
        console.log('Client disconnected');
    });

    // Envoyer un message au client toutes les 5 secondes
    setInterval(() => {
        const player = {
            name: 'JohnDoe',
            level: 10,
            health: 100
        };
        ws.send(JSON.stringify(player));
    }, 5000);
});

// Démarrer le serveur
server.listen(port, ip, () => {
    console.log(`Server is running on http://${ip}:${port}`);
});