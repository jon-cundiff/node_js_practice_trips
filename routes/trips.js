const express = require("express");
const router = express.Router();

const authenticationMiddleware = (req, res, next) => {
    if (!req.session || !req.session.username) {
        return res.redirect("/");
    }
    req.trips = userTrips[req.session.username];
    res.locals.username = req.session.username;
    next();
};

router.use(authenticationMiddleware);

router.get("/add-trip", (req, res) => {
    res.render("tripDetails", { command: "Add", url: "trips/add-trip" });
});

router.post("/add-trip", (req, res) => {
    const { title, image, departureDate, returnDate } = req.body;
    const newTrip = {
        tripId: req.trips.length + 1,
        title,
        image,
        departureDate,
        returnDate
    };

    req.trips.push(newTrip);
    res.redirect("/");
});

router.get("/update-trip/:tripId", (req, res) => {
    const tripId = parseInt(req.params.tripId);
    const trip = req.trips.find((trip) => trip.tripId === tripId);
    if (!trip) {
        return res.redirect("/not-found");
    }

    res.render("tripDetails", {
        command: "Update",
        url: `trips/update-trip/${tripId}`,
        trip: trip
    });
});

router.post("/update-trip/:tripId", (req, res) => {
    const tripId = parseInt(req.params.tripId);
    const trip = req.trips.find((trip) => trip.tripId === tripId);
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

router.post("/delete-trip/:tripId", (req, res) => {
    const tripId = parseInt(req.params.tripId);
    const tripIndex = req.trips.findIndex((trip) => trip.tripId === tripId);
    if (tripIndex !== -1) {
        req.trips.splice(tripIndex, 1);
    }
    res.redirect("/");
});

module.exports = router;
