const socket = io();
const revealChatButton = document.getElementById("revealChatButton");
const chatboxContainer = document.getElementById("chatboxContainer");
const chatRoomSelect = document.getElementById("chatRoomSelect");
const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendMessageButton = document.getElementById("sendMessageButton");

let rooms = [];

socket.on("room-options", (data) => {
    rooms = data.rooms;
    console.log(rooms);
});

revealChatButton.addEventListener("click", () => {
    revealChatButton.classList.toggle("active");
    chatboxContainer.classList.toggle("active");
    revealChatButton.innerHTML = revealChatButton.classList.contains("active")
        ? "Hide Chat"
        : "Show Chat";
});
