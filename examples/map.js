const map = new ol.Map({
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([8.68, 49.41]),
        zoom: 15
    }),
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ]
});

const printLayoutControl = new ol.control.PrintLayout({
    format: PAPER_FORMAT.A3,
    orientation: ORIENTATION.LANDSCAPE,
    margin: {top: 2, bottom: 2, left: 2, right: 2}
});
map.addControl(printLayoutControl);
