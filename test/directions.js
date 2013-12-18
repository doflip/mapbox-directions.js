describe("Directions", function () {
    describe("#setOrigin", function () {
        it("sets origin", function () {
            var directions = L.directions();
            directions.setOrigin(L.latLng(1, 2));
            expect(directions.getOrigin()).to.eql(L.latLng(1, 2));
        });

        it("fires event", function (done) {
            var directions = L.directions();
            directions.on('origin', function (e) {
                expect(e.latlng).to.eql(L.latLng(1, 2));
                done();
            });
            directions.setOrigin(L.latLng(1, 2));
        });

        it("returns this", function () {
            var directions = L.directions();
            expect(directions.setOrigin(L.latLng(1, 2))).to.equal(directions);
        });
    });

    describe("#setDestination", function () {
        it("sets destination", function () {
            var directions = L.directions();
            directions.setDestination(L.latLng(1, 2));
            expect(directions.getDestination()).to.eql(L.latLng(1, 2));
        });

        it("fires event", function (done) {
            var directions = L.directions();
            directions.on('destination', function (e) {
                expect(e.latlng).to.eql(L.latLng(1, 2));
                done();
            });
            directions.setDestination(L.latLng(1, 2));
        });

        it("returns this", function () {
            var directions = L.directions();
            expect(directions.setDestination(L.latLng(1, 2))).to.equal(directions);
        });
    });

    describe("queryURL", function () {
        it("constructs a URL with origin and destination", function () {
            var directions = L.directions();
            directions.setOrigin(L.latLng(1, 2)).setDestination(L.latLng(3, 4));
            expect(directions.queryURL()).to.eql('https://api.directions.mapbox.com/alpha/jfire/directions/driving/2,1;4,3.json');
        });
    });

    describe("query", function () {
        var server;

        beforeEach(function() {
            server = sinon.fakeServer.create();
        });

        afterEach(function() {
            server.restore();
        });

        it("returns self", function () {
            var directions = L.directions();
            expect(directions.query()).to.equal(directions);
        });

        it("fires error if response is an HTTP error", function (done) {
            var directions = L.directions();

            directions.on('error', function (e) {
                expect(e.error).to.be.ok();
                done();
            });

            directions
                .setOrigin(L.latLng(1, 2))
                .setDestination(L.latLng(3, 4))
                .query();

            server.respondWith("GET", "https://api.directions.mapbox.com/alpha/jfire/directions/driving/2,1;4,3.json",
                [400, { "Content-Type": "application/json" }, JSON.stringify({error: 'error'})]);
            server.respond();
        });

        it("fires error if response is an API error", function (done) {
            var directions = L.directions();

            directions.on('error', function (e) {
                expect(e.error).to.eql('error');
                done();
            });

            directions
                .setOrigin(L.latLng(1, 2))
                .setDestination(L.latLng(3, 4))
                .query();

            server.respondWith("GET", "https://api.directions.mapbox.com/alpha/jfire/directions/driving/2,1;4,3.json",
                [200, { "Content-Type": "application/json" }, JSON.stringify({error: 'error'})]);
            server.respond();
        });

        it("fires load if response is successful", function (done) {
            var directions = L.directions();

            directions.on('load', function (e) {
                expect(e.routes).to.eql([]);
                done();
            });

            directions
                .setOrigin(L.latLng(1, 2))
                .setDestination(L.latLng(3, 4))
                .query();

            server.respondWith("GET", "https://api.directions.mapbox.com/alpha/jfire/directions/driving/2,1;4,3.json",
                [200, { "Content-Type": "application/json" }, JSON.stringify({routes: []})]);
            server.respond();
        });

        it("aborts currently pending request", function () {
            var directions = L.directions();

            directions
                .setOrigin(L.latLng(1, 2))
                .setDestination(L.latLng(3, 4))
                .query()
                .query();

            expect(server.requests[0].aborted).to.be(true);
        });
    });
});