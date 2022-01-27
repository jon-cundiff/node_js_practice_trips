const makeDisplayedTrips = (trips, query) => {
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

module.exports = { makeDisplayedTrips };
