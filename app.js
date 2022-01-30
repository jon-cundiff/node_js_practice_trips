const express = require("express");
const app = express();
const mustacheExpress = require("mustache-express");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const { makeDisplayedTrips } = require("./util");
const sessionMiddleware = require("./middleware/sessionMiddleware");
const tripsRouter = require("./routes/trips");
const registerChatHandlers = require("./socket/registerChatHandlers");

const PORT = process.env.PORT || 3000;

global.users = [];

global.userTrips = {};

app.engine("mustache", mustacheExpress("./views/partials"));
app.set("views", "./views");
app.set("view engine", "mustache");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

app.use("/trips", tripsRouter);

io.use((socket, next) => {
    // gives access to socket.request.session
    sessionMiddleware(socket.request, {}, next);
});

io.on("connection", (socket) => {
    registerChatHandlers(io, socket);
});

app.get("/", (req, res) => {
    const renderArgs = {};
    if (req.session) {
        if (req.session.username) {
            const { username } = req.session;
            renderArgs.trips = makeDisplayedTrips(
                userTrips[username],
                req.query
            );
            renderArgs.isNotEmpty = renderArgs.trips.length > 0;
            renderArgs.username = username;
        }
    }
    res.render("index", { ...renderArgs });
});

app.get("/login", (req, res) => {
    if (req.session) {
        if (req.session.username) {
            return res.redirect("/");
        }
    }

    res.render("userCredentials", { url: "login", caption: "Log In" });
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    let error = "";
    let user;

    if (!username || !password) {
        error = "Username and Password required!";
    } else {
        user = users.find(
            (user) => user.username === username && user.password === password
        );
        error = user ? "" : "Username or Password does not match.";
    }

    if (error) {
        return res.render("userCredentials", {
            error,
            url: "login",
            caption: "Log In"
        });
    }

    req.session.username = user.username;
    res.redirect("/");
});

app.get("/register", (req, res) => {
    if (req.session) {
        if (req.session.username) {
            return res.redirect("/");
        }
    }

    res.render("userCredentials", {
        url: "register",
        caption: "Register Account"
    });
});

app.post("/register", (req, res) => {
    const { username, password } = req.body;
    let error = "";

    if (!username || !password) {
        error = "Username and Password required!";
    } else {
        error = userTrips[username]
            ? "Username Taken. Please pick another username."
            : "";
    }

    if (error) {
        return res.render("userCredentials", {
            error,
            url: "register",
            caption: "Register Account"
        });
    }

    const newUser = { username, password };
    users.push(newUser);
    userTrips[username] = [];

    req.session.username = username;
    res.redirect("/");
});

app.get("/logout", (req, res) => {
    if (req.session) {
        req.session.destroy();
    }
    res.redirect("/");
});

app.get("/not-found", (req, res) => {
    res.render("error");
});
app.get("*", (req, res) => {
    res.redirect("/not-found");
});

http.listen(PORT, () => console.log(`Trips running on port ${PORT}`));
