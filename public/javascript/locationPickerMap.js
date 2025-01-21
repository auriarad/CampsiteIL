mapboxgl.accessToken = mapToken
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/outdoors-v12', // style URL
    center: [34.95, 31.5], // starting position [lng, lat]
    zoom: 6.5, // starting zoom
});

let marker = null

map.on('load', function () {
    map.addSource('regions', {
        type: 'geojson',
        data: '/regionsMap.geojson' // Combined GeoJSON of all regions
    });

    map.addLayer({
        id: 'regions-layer',
        type: 'fill',
        source: 'regions',
        paint: {
            'fill-color': '#888888',
            'fill-opacity': 0.1
        }
    });
});

let regionsLoaded = false;

map.on('sourcedata', function (e) {
    if (e.sourceId === 'regions' && e.isSourceLoaded) {
        if (campsite) {
            const startingCoordinates = { lng: campsite.geometry.coordinates[0], lat: campsite.geometry.coordinates[1] };
            mapClickFn(startingCoordinates);
            if (marker == null) {
                marker = new mapboxgl.Marker()
                    .setLngLat(startingCoordinates)
                    .addTo(map);
            } else {
                marker.setLngLat(startingCoordinates);
            }
            map.easeTo({
                center: startingCoordinates,
                zoom: 10
            });
        }
    }
});


const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: false,
    zoom: 20
});


map.addControl(
    geocoder
);
map.addControl(new mapboxgl.NavigationControl());


map.on('click', function (e) {
    mapClickFn(e.lngLat);

    if (marker == null) {
        marker = new mapboxgl.Marker()
            .setLngLat(e.lngLat)
            .addTo(map);
    } else {
        marker.setLngLat(e.lngLat)
    }
});



function mapClickFn(coordinates) {
    const url =
        "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
        coordinates.lng +
        "," +
        coordinates.lat +
        ".json?access_token=" +
        mapboxgl.accessToken;

    const regionInput = document.getElementById("region");

    const userPoint = turf.point([coordinates.lng, coordinates.lat]);
    let selectedRegion = '';
    for (let region of map.querySourceFeatures('regions')) {
        if (turf.booleanPointInPolygon(userPoint, region)) {
            selectedRegion = region.properties.name;
            break;
        }
    }
    regionInput.value = selectedRegion;
    document.getElementById("coordinates").value = [coordinates.lng, coordinates.lat];;

    fetch(url).then(res => res.json()).then((data) => {
        if (data.features.length > 0) {
            const address = data.features[0].place_name;
            document.getElementById("address").innerText = address;
        } else {
            document.getElementById("address").innerText = "No address found";
        }
    });
}
