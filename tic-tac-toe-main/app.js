const { Socket } = require('socket.io');

const express = require('express');

const app = express();
const http = require('http').createServer(app);
const path = require('path');
const port = 8080;
const ip = 'localhost'

/**
 * @type {Socket}
 */
const io = require('socket.io')(http);

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

http.listen(port, () => {
    console.log(`Listening on https://${ip}:${port}`);
});

let rooms = [];

io.on('connection', (socket) => {
    console.log(`[connection] ${socket.id}`);

    socket.on('playerData', (player) => {
        console.log(`[playerData] ${player.username}`);

        let room = null;

        if (!player.roomId) {
            room = createRoom(player);
            console.log(`[create room ] - ${room.id} - ${player.username}`);
        } else {
            room = rooms.find(r => r.id === player.roomId);

            if (room === undefined) {
                return;
            }

            player.roomId = room.id;
            room.players.push(player);
        }

        socket.join(room.id);
        io.to(socket.id).emit('join room', room.id);

        io.to(room.id).emit('update player', room.players);
        if (room.players.length === 4) {
            io.to(room.id).emit('full');
        }
    });

    
    socket.on('get rooms', () => {
        io.to(socket.id).emit('list rooms', rooms);
    });

    socket.on('play', (player) => {
        console.log(`[play] ${player.username}`);
        io.to(player.roomId).emit('play', player);
    });

// Clic sur le bouton déconnexion
    socket.on('disconect player', (player) => {
        let disconnectedRoom = null;
        let disconnectedPlayer = null;
        console.log(`[Leave room] - ${player.roomId} - ${player.username}`);
        disconnectedRoom = rooms.find(r => r.id === player.roomId);
        disconnectedPlayer = player;
    
        if (disconnectedPlayer && disconnectedRoom) {
            disconnectedRoom.players = disconnectedRoom.players.filter(player => player.socketId !== socket.id); //Supression du joueur
            io.to(socket.id).emit('leave room');
            player.roomId= null;
            if(disconnectedRoom.players.length === 0){
                rooms = rooms.filter(room => room.id !== disconnectedRoom.id); //Supression de la room si il ne reste plus de joueurs
                console.log(rooms);
            }
        } 
        io.to(disconnectedRoom).emit('update player', disconnectedRoom.players);
    });
    


    socket.on('disconnect', () => {
        console.log(`[disconnect] ${socket.id}`);
        let room = null;

        rooms.forEach(r => {
            r.players.forEach(p => {
                if (p.socketId === socket.id && p.host) {
                    room = r;
                    rooms = rooms.filter(r => r !== room);
                }
            })
        })
    });
});

function createRoom(player) {
    const room = { id: roomId(), players: [] };

    player.roomId = room.id;

    room.players.push(player);
    rooms.push(room);

    return room;
}

function roomId() {
    return Math.random().toString(36).substr(2, 9);
}
