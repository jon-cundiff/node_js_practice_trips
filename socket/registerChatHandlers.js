const roomParticipants = {
    east: { users: [], messages: [] },
    midwest: { users: [], messages: [] },
    southwest: { users: [], messages: [] },
    southeast: { users: [], messages: [] },
    west: { users: [], messages: [] }
};

const registerChatHandlers = (io, socket) => {
    if (!socket.request.session.socketUser) {
        socket.request.session.socketUser = {
            sessionId: socket.request.session.id,
            name: socket.request.session.username
        };
    }

    const { socketUser } = socket.request.session;

    socket.emit("room-options", {
        rooms: Object.keys(roomParticipants),
        id: socketUser.sessionId
    });

    const sendRoomUserList = (room) => {
        io.to(room).emit("user-list", { users: roomParticipants[room].users });
    };

    const sendRoomMessageHistory = (room) => {
        socket.emit("room-history", {
            messages: roomParticipants[room].messages
        });
    };

    const leaveRoom = () => {
        if (socketUser.room) {
            const room = roomParticipants[socketUser.room];
            room.users = room.users.filter(
                (user) => user.sessionId !== socketUser.sessionId
            );
            socket.leave(socketUser.room);
            sendRoomUserList(socketUser.room);
        }
    };

    const handleRoomTransfer = (room) => {
        leaveRoom();
        roomParticipants[room].users.push(socketUser);
        socketUser.room = room;
        socket.join(room);
    };

    socket.on("join-room", (userInfo) => {
        const { room } = userInfo;
        handleRoomTransfer(room);
        sendRoomUserList(room);
        sendRoomMessageHistory(room);
    });

    socket.on("new-message", (data) => {
        const { message } = data;
        const newMessage = {
            message: message,
            userId: socketUser.sessionId,
            name: socketUser.name
        };

        const room = socketUser.room;
        roomParticipants[room].messages.push(newMessage);
        socket.to(room).emit("new-message", { message: newMessage });
    });

    socket.on("disconnect", leaveRoom);
};

module.exports = registerChatHandlers;
