mapboxgl.accessToken = mapToken

const map = new mapboxgl.Map({
    container: 'map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: [35, 31.6],
    zoom: 5.8
});
map.addControl(new mapboxgl.NavigationControl());

map.on('load', () => {
    map.loadImage(
        'https://res.cloudinary.com/dqvhkjjyh/image/upload/v1736978555/tent_32422_o5vp8l.png',
        (error, image) => {
            if (error) throw error;

            // Add the image to the map style.
            map.addImage('tent', image);
            // Add a new source from our GeoJSON data and
            // set the 'cluster' option to true. GL-JS will
            // add the point_count property to your source data.
            map.addSource('campsites', {
                type: 'geojson',
                // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
                // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
                data: campsites,
                cluster: true,
                clusterMaxZoom: 12, // Max zoom to cluster points on
                clusterRadius: 30 // Radius of each cluster when clustering points (defaults to 50)
            });

            map.addLayer({
                id: 'clusters',
                type: 'circle',
                source: 'campsites',
                filter: ['has', 'point_count'],
                paint: {
                    // Use step expressions (https://docs.mapbox.com/style-spec/reference/expressions/#step)
                    // with three steps to implement three types of circles:
                    //   * Blue, 20px circles when point count is less than 100
                    //   * Yellow, 30px circles when point count is between 100 and 750
                    //   * Pink, 40px circles when point count is greater than or equal to 750
                    'circle-color': [
                        'step',
                        ['get', 'point_count'],
                        '#8ecae6',
                        22,
                        '#219ebc',
                        100,
                        '#023047'
                    ],
                    'circle-radius': [
                        'step',
                        ['get', 'point_count'],
                        17,
                        22,
                        20,
                        100,
                        25
                    ]
                }
            });

            map.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: 'campsites',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': ['get', 'point_count_abbreviated'],
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12
                }
            });

            map.addLayer({
                id: 'unclustered-point',
                type: 'symbol',
                source: 'campsites',
                filter: ['!', ['has', 'point_count']],
                'layout': {
                    'icon-image': 'tent',
                    'icon-size': 0.05
                },
            });

            // inspect a cluster on click
            map.on('click', 'clusters', (e) => {
                const features = map.queryRenderedFeatures(e.point, {
                    layers: ['clusters']
                });
                const clusterId = features[0].properties.cluster_id;
                map.getSource('campsites').getClusterExpansionZoom(
                    clusterId,
                    (err, zoom) => {
                        if (err) return;

                        map.easeTo({
                            center: features[0].geometry.coordinates,
                            zoom: zoom
                        });
                    }
                );
            });

            // When a click event occurs on a feature in
            // the unclustered-point layer, open a popup at
            // the location of the feature, with
            // description HTML from its properties.
            map.on('click', 'unclustered-point', (e) => {
                const coordinates = e.features[0].geometry.coordinates.slice();

                const { id, features, title, featuresList } = e.features[0].properties;
                let popupText = `<h6 class="m-0"><a href="campsites/${id}">${title}</a></h6>`;
                let featuresArr = features.replaceAll('"', '').replaceAll('[', "").replaceAll(']', "").split(',')
                let featuresListArr = featuresList.replaceAll('"', '').replaceAll('[', "").replaceAll(']', "").split(',')
                for (const feature of featuresArr) {
                    popupText = popupText + ` <span class="badge rounded-pill feature${featuresListArr.indexOf(feature)}">${feature}</span>`
                }


                // Ensure that if the map is zoomed out such that
                // multiple copies of the feature are visible, the
                // popup appears over the copy being pointed to.
                if (['mercator', 'equirectangular'].includes(map.getProjection().name)) {
                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                    }
                }

                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(
                        popupText
                    )
                    .addTo(map);
            });

            map.on('mouseenter', 'clusters', () => {
                map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', 'clusters', () => {
                map.getCanvas().style.cursor = '';
            });
        }
    );
});
