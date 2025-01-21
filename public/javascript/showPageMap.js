mapboxgl.accessToken = mapToken
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/outdoors-v12', // style URL
    center: campsite.geometry.coordinates, // starting position [lng, lat]
    zoom: 9, // starting zoom
});
map.addControl(new mapboxgl.NavigationControl());

const popup = new mapboxgl.Popup({ offset: 25 })
    .setHTML(
        `<h6>${campsite.title}</h6> <p class="m-0">${campsite.geometry.coordinates}</p>`
    );

const marker = new mapboxgl.Marker()
    .setLngLat(campsite.geometry.coordinates)
    .setPopup(popup)
    .addTo(map);
