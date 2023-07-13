// set token
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: "show-page-map",
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: "mapbox://styles/mapbox/streets-v11",
    center: campground.geometry.coordinates, // starting position [lng, lat] exemp.([12.554729, 55.70651])
    zoom: 8
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// Create a default Marker and add it to the map.
const marker1 = new mapboxgl.Marker()
.setLngLat(campground.geometry.coordinates)
.setPopup(
    new mapboxgl.Popup({ offset: 25 })
    .setHTML(
        `<h6><br>${campground.title}</h6><p>${campground.location}</p>`
    )
)
.addTo(map);