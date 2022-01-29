const session = require("express-session");

const sessionMiddleware = session({
    secret: "thisissecret",
    saveUninitialized: true,
    resave: true
});

module.exports = sessionMiddleware;
