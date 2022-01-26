const express = require("express");
const mustacheExpress = require("mustache-express");

const app = express();
const PORT = 3000;

let trips = [];

app.engine("mustache", mustacheExpress("./views/partials"));
app.set("views", "./views");
app.set("view engine", "mustache");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const makeDisplayedTrips = (query) => {
    const displayedTrips = [...trips];
    if (query.sort) {
        displayedTrips.sort((a, b) => {
            const dateA = new Date(a.departureDate);
            const dateB = new Date(b.departureDate);
            if (query.sort === "asc") {
                return dateA - dateB;
            } else if (query.sort === "des") {
                return dateB - dateA;
            } else {
                return 0;
            }
        });
    }

    return displayedTrips;
};

app.get("/", (req, res) => {
    const displayedTrips = makeDisplayedTrips(req.query);
    const isNotEmpty = displayedTrips.length > 0;
    res.render("index", { trips: displayedTrips, isNotEmpty: isNotEmpty });
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
