// Objet player
const player = {
    playerId :"",
    roomId: null,
    username: "",
    host: false,
    socketId: "",
};

const socket = io();
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const roomId = urlParams.get('room');


//Ajoutez une écoute de l'événement startGame pour afficher les manettes lorsque 4 joueurs sont dans la salle.

document.getElementById('form').addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    socket.emit('joinRoom', 'someRoom');
});

socket.on('startGame', () => {
    document.querySelector('.manette').classList.remove('d-none');
});




if (roomId) {
    document.getElementById('start').innerText = "Rejoindre";
}

const usernameInput = document.getElementById('username');
const userCard = document.getElementById('user-card');
const waitingArea = document.getElementById('waiting-area');
const spin = document.getElementById('spinner');
const roomsCard = document.getElementById('rooms-card');
const roomsList = document.getElementById('rooms-list');
const playerList = document.getElementById('players-list');
const disconnect_btn = document.getElementById('disconnect-player');
const waitingMessage = document.getElementById('waiting-game');
const acceptGame = document.getElementById('accept');
const refuseGame = document.getElementById('refuse');

const manette = document.getElementById('manette');
const page = document.getElementById('page');

socket.emit('get rooms');
socket.on('list rooms', (rooms) => {
    let html = "";
    if (rooms.length > 0) {
        roomsCard.classList.remove('d-none');
        rooms.forEach(room => {
            html += `<li class="list-group-item d-flex justify-content-between">
                    <p class="p-0 m-0 flex-grow-1 fw-bold">Salon de ${room.players[0].username} (${room.players.length}/4)</p>`;
                if (room.players.length !== 4 && room.inGame === false) {
                    html+= `<button class="btn btn-sm btn-success join-room" data-room="${room.id}">Rejoindre</button>`;
                }
                else if(room.inGame){
                    html+= `<button class="btn btn-sm btn-refuse">En Jeu</button>`;
                }
            html +=`</li>`;

        });
    }

    if (html !== "") {
        roomsList.innerHTML = html;

        for (const element of document.getElementsByClassName('join-room')) {
            element.addEventListener('click', joinRoom, false)
        }
    }
});

socket.on('update rooms', (rooms) => {
    if(!player.roomId){
        if(rooms.length === 0){
            roomsCard.classList.add('d-none');
        }
        else{
            let html = "";
            roomsCard.classList.remove('d-none');
            rooms.forEach(room => {
                html += `<li class="list-group-item d-flex justify-content-between">
                        <p class="p-0 m-0 flex-grow-1 fw-bold">Salon de ${room.players[0].username} (${room.players.length}/4)</p>`;
                if (room.players.length !== 4 && room.inGame === false) {
                    html+= `<button class="btn btn-sm btn-success join-room" data-room="${room.id}">Rejoindre</button>`;
                }
                else if(room.inGame){
                    html+= `<button class="btn btn-sm btn-refuse">En Jeu</button>`;
                }
                html +=`</li>`;    
            });
    
        if (html !== "") {
            roomsList.innerHTML = html;
    
            for (const element of document.getElementsByClassName('join-room')) {
                element.addEventListener('click', joinRoom, false)
            }
        }
    }
    }
});

socket.on('update player', (players)=>{
    let html ="";
    players.forEach(player =>{
        player.playerId = players.indexOf(player)+1;
        html +=`<li class="list-group-item d-flex justify-content-between">${player.playerId} - ${player.username}`
        if(player.host === true){ //Si l'utilisateur est hôte
            html += `<i class="fa-regular fas fa-crown"></i>`;
        }
        html+=`</li>`;
    })
    playerList.innerHTML = html;
});

socket.on('new host',() => {
    player.host = true;
})



$("#form").on('submit', function (e) {
    e.preventDefault();

    player.username = usernameInput.value;

    if (roomId) {
        player.roomId = roomId;
    } else {
        player.host = true;
    }

    player.socketId = socket.id;

    userCard.hidden = true;
    waitingArea.classList.remove('d-none');
    roomsCard.classList.add('d-none');

    socket.emit('playerData', player);
});
// ------- Room interaction avec joueurs 
//Connexion à une room
socket.on('join room', (room) => {
    player.roomId = room.id;
    player.playerId = room.players.length;

});

//Deconnexion à une room
socket.on('leave room', ()=>{
    player.roomId = null;
    if(player.host === true){
        player.host = false;
    }
});

socket.on('full', () =>{
    spin.classList.add('d-none');
});


//--------- Quitter une room
disconnect_btn.addEventListener('click', ()=>{
    socket.emit("disconect player", player);
    //On revient sur la page des rooms
    waitingArea.classList.add('d-none');
    usernameInput.innerHTML = player.username;
    socket.emit('get rooms');
    userCard.hidden = false;
});

// Rejoindre une room
const joinRoom = function () {
    if (usernameInput.value !== "") {
        player.username = usernameInput.value;
        player.socketId = socket.id;
        player.roomId = this.dataset.room;

        socket.emit('playerData', player);

        userCard.hidden = true;
        waitingArea.classList.remove('d-none');
        roomsCard.classList.add('d-none');

    }
}



// ------ Jouabilité
socket.on('waiting players', () =>{
    waitingMessage.classList.remove('d-none');
    let html ="";
    if(player.host === true){
        html += "Invitation à une partie";
        refuseGame.classList.remove('d-none');
        acceptGame.classList.remove('d-none');
    }
    else{
        html += "En attente de l'hôte ...";
    }
    document.getElementById('message').innerHTML = html;
});

socket.on('waiting ended', () =>{
    waitingMessage.classList.add('d-none');
    if(player.host === true){
        refuseGame.classList.add('d-none');
        acceptGame.classList.add('d-none');
    }
})

refuseGame.addEventListener('click', () => {
    socket.emit('refuse game', player.roomId);
})

acceptGame.addEventListener('click', () =>{
    socket.emit('accept game', player.roomId);
})

socket.on('display manette', ()=>{
    page.classList.add('d-none');
    manette.classList.remove('d-none');
})



//------------------------------------------//
//--------- Fonctionnement manette ---------//
//------------------------------------------//

const jumpbtn = document.getElementById('up');
const left = document.getElementById('left');
const right = document.getElementById('right');
const down = document.getElementById('down');
const wsEcran = document.getElementById('plein_ecran_btn');

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
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
