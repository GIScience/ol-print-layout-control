[![status: experimental](https://github.com/GIScience/badges/raw/master/status/experimental.svg)](https://github.com/GIScience/badges#experimental)

# ol-print-layout-control

Add this OpenLayers-Control to your OpenLayers-Map.

It Helps the user to define a map area that fits to the desired output page format and orientation.

Works with ol@^7.0.0.



https://user-images.githubusercontent.com/2814068/195178883-d71411bc-ce08-494f-b64d-93f8c48c0bc6.mp4



# Usage

## Browser
Load `ol-print-layout-control.js` after OpenLayers. 

It will be available as `new ol.control.PrintLayout()`
```javascript
<script src="https://unpkg.com/@giscience/ol-print-layout-control"></script>
<link rel="stylesheet" href="https://unpkg.com/@giscience/ol-print-layout-control/dist/ol-print-layout-control.css" />

<script>
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
</script>
```


## Typescript and bundlers

Install the npm package: [@giscience/ol-print-layout-control](https://www.npmjs.com/package/@giscience/ol-print-layout-control)

After `import` from the module it will be available as `new PrintLayout()`.
```
npm install @giscience/ol-print-layout-control
```

# Related

Originally `ol-print-layout-control` has been developed for the 
[SketchMapTool](https://github.com/GIScience/sketch-map-tool). 
