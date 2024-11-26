// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        // Complete as you see fit.
        is_drawing: false,
        // List of polygons that have been drawn.
        polygons: [],
    }

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.toggle_drawing = function () {
        app.vue.is_drawing = !app.vue.is_drawing;
        if(app.vue.is_drawing) {
            // Resets the polygon we are drawing.
            app.drawing_polygon = L.polygon([], {color: 'red'}).addTo(app.map);
            // Resets the list of latlongs.
            app.drawing_coords = [];
        } else {
            // Finalizes polygon.
            app.vue.polygons = app.drawing_polygon;
            app.drawing_polygon = null;
        }
    }

    app.click_listener = function (e) {
        // If we are drawing, it's one more point for our polygon.
        app.drawing_coords.push(e.latlng);
        app.drawing_polygon.setLatLngs(app.drawing_coords);
    };

    app.dbclick_listener = function (e) {
        // If we are drawing, we stop drawing.
        if (app.is_drawing) {
            app.toggle_drawing();
        }
    };

    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        toggle_drawing: app.toggle_drawing,
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    // And this initializes it.
    app.init = () => {
        // Put here any initialization code.
        // Typically this is a server GET call to load the data.

        app.map = L.map('map').setView([51.505, -0.09], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(app.map);

        // Adds listener.
        app.map.on('click', app.click_listener);
        app.map.on('dbclick', app.dbclick_listener);


    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);