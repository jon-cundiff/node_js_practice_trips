const express = require("express");
const mustacheExpress = require("mustache-express");

const app = express();
const PORT = 3000;

let trips = [
    {
        title: "Store",
        image: "https://images.unsplash.com/photo-1572764861775-3fc7fe6a76f0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80",
        departureDate: "2022-01-01",
        returnDate: "2022-01-02",
        tripId: 1
    }
];

app.engine("mustache", mustacheExpress("./views/partials"));
app.set("views", "./views");
app.set("view engine", "mustache");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index", { trips: trips });
});

app.get("/add-trip", (req, res) => {
    res.render("tripDetails", { command: "Add", url: "add-trip" });
});

app.post("/add-trip", (req, res) => {
    const { title, image, departureDate, returnDate } = req.body;
    const newTrip = {
        tripId: trips.length + 1,
        title,
        image,
        departureDate,
        returnDate
    };

    trips.push(newTrip);
    res.redirect("/");
});

app.get("/update-trip/:tripId", (req, res) => {
    const tripId = parseInt(req.params.tripId);
    const trip = trips.find((trip) => trip.tripId === tripId);
    if (!trip) {
        return res.redirect("/not-found");
    }

    res.render("tripDetails", {
        command: "Update",
        url: `update-trip/${tripId}`,
        trip: trip
    });
});

app.post("/update-trip/:tripId", (req, res) => {
    const tripId = parseInt(req.params.tripId);
    const trip = trips.find((trip) => trip.tripId === tripId);
    if (!trip) {
        return res.redirect("/not-found");
    }

    const { title, image, departureDate, returnDate } = req.body;
    trip.title = title;
    trip.image = image;
    trip.departureDate = departureDate;
    trip.returnDate = returnDate;

    res.redirect("/");
});

app.post("/delete-trip/:tripId", (req, res) => {
    const tripId = parseInt(req.params.tripId);
    trips = trips.filter((trip) => trip.tripId !== tripId);
    res.redirect("/");
});

app.get("/not-found", (req, res) => {
    res.render("error");
});
app.get("*", (req, res) => {
    res.redirect("/not-found");
});
app.listen(PORT, () => console.log(`Trips running on port ${PORT}`));
