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
const disconnect_btn = document.getElementById('disconect-player');
const waintingMessage = document.getElementById('wainting-game');
const acceptGame = document.getElementById('accept');
const refuseGame = document.getElementById('refuse');

socket.emit('get rooms');
socket.on('list rooms', (rooms) => {
    let html = "";
    if (rooms.length > 0) {
        roomsCard.classList.remove('d-none');
        rooms.forEach(room => {
            html += `<li class="list-group-item d-flex justify-content-between">
                    <p class="p-0 m-0 flex-grow-1 fw-bold">Salon de ${room.players[0].username} (${room.players.length}/4)</p>`;
            if (room.players.length !== 4) {
                html+= `<button class="btn btn-sm btn-success join-room" data-room="${room.id}">Rejoindre</button>`;
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
                if (room.players.length !== 4) {
                    html+= `<button class="btn btn-sm btn-success join-room" data-room="${room.id}">Rejoindre</button>`;
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
        html +=`<li class="list-group-item d-flex justify-content-between">${player.username}`
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
socket.on('join room', (roomId) => {
    player.roomId = roomId;

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
socket.on('wainting players', () =>{
    waintingMessage.classList.remove('d-none');
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

socket.on('refuse game', () =>{
    waintingMessage.classList.add('d-none');

})

socket.on('accept game', ()=>{
    waintingMessage.classList.add('d-none');
});

