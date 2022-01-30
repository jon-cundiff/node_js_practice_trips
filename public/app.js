const socket = io();
const revealChatButton = document.getElementById("revealChatButton");
const chatboxContainer = document.getElementById("chatboxContainer");
const chatRoomSelect = document.getElementById("chatRoomSelect");
const roomUserCount = document.getElementById("roomUserCount");
const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendMessageButton = document.getElementById("sendMessageButton");

let room;
let rooms = [];

const toTitleCase = (str) => {
    const lowerWords = str.toLowerCase().split(" ");
    const titleWords = lowerWords.map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1)
    );
    return titleWords.join(" ");
};

const createChatMessageDiv = (message, name) => {
    const classTitle = name === "Me" ? "is-me" : "is-other";
    return `
        <div class="chat-message ${classTitle}">
            <h4>${name}</h4>
            <p>${message}</p>
        </div>
    `;
};

const handleSendMessage = () => {
    if (messageInput.value) {
        socket.emit("new-message", {
            message: messageInput.value,
            userId: socket.sessionId
        });
        const newChatMessage = createChatMessageDiv(messageInput.value, "Me");
        chatMessages.insertAdjacentHTML("beforeend", newChatMessage);
        messageInput.value = "";
    }
};

socket.on("room-options", (data) => {
    socket.sessionId = data.id;
    const roomOptions = data.rooms.map(
        (room) => `
        <option value="${room}">${toTitleCase(room)}</option>
    `
    );

    chatRoomSelect.insertAdjacentHTML("beforeend", roomOptions.join(""));
});

socket.on("user-list", (data) => {
    roomUserCount.innerHTML = `${data.users.length} <i>users connected</i>`;
});

socket.on("room-history", (data) => {
    messageItems = data.messages.map((message) => {
        const name = message.userId === socket.sessionId ? "Me" : message.name;
        return createChatMessageDiv(message.message, name);
    });
    chatMessages.innerHTML = messageItems.join("");
    messageInput.removeAttribute("disabled");
    sendMessageButton.removeAttribute("disabled");
});

socket.on("new-message", (data) => {
    const { message, name } = data.message;
    const newMessage = createChatMessageDiv(message, name);
    chatMessages.insertAdjacentHTML("beforeend", newMessage);
});

chatRoomSelect.addEventListener("change", (event) => {
    const { value } = event.target;
    if (value) {
        socket.emit("join-room", { room: value });
    }
});

revealChatButton.addEventListener("click", () => {
    revealChatButton.classList.toggle("active");
    chatboxContainer.classList.toggle("active");
    revealChatButton.innerHTML = revealChatButton.classList.contains("active")
        ? "Hide Chat"
        : "Show Chat";
});

sendMessageButton.addEventListener("click", handleSendMessage);
messageInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        handleSendMessage();
    }
});
