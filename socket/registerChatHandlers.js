const roomBase = { users: [], messages: [] };

const roomParticipants = {
    east: { ...roomBase },
    midwest: { ...roomBase },
    southwest: { ...roomBase },
    southeast: { ...roomBase },
    west: { ...roomBase }
};

const registerChatHandlers = (io, socket) => {
    if (!socket.request.session.socketUser) {
        socket.request.session.socketUser = {
            sessionId: socket.request.session.id,
            name: socket.request.session.username
        };
    }

    const { socketUser } = socket.request.session.socketUser;

    socket.emit("room-options", { rooms: Object.keys(roomParticipants) });

    const sendRoomUserList = (room) => {
        io.to(room).emit("user-list", { users: roomParticipants[room].users });
    };

    const sendRoomMessageHistory = (room) => {
        socket.emit("room-history", {
            messages: roomParticipants[room].messages
        });
    };

    const handleRoomTransfer = (room) => {
        if (socketUser.room) {
            const room = roomParticipants[socketUser.room];
            room.users = room.users.filter(
                (user) => user.sessionId !== socketUser.sessionId
            );
            socket.leave(socketUser.room);
        }
    };

    io.on("join-room", (userInfo) => {
        handleRoomTransfer(userInfo.room);
    });
};

module.exports = registerChatHandlers;
