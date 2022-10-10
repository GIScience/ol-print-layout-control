import {ORIENTATION, PAPER_FORMAT, PrintLayout} from '../src/ol-print-layout-control'
import {Map, View} from 'ol';
import {fromLonLat} from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import {OSM} from 'ol/source';
import 'ol/ol.css';


const map = new Map({
    target: 'map',
    view: new View({
        center: fromLonLat([8.5, 48.8]),
        zoom: 14
    }),
    layers: [new TileLayer({
        source: new OSM()
    })]
})

const printLayoutControl = new PrintLayout({
    format: PAPER_FORMAT.A4,
    orientation: ORIENTATION.PORTRAIT,
    margin: {top: 3, left: 2, bottom: 3, right: 2}
});
map.addControl(printLayoutControl);

//show current properties
printLayoutControl.on('change', ()=>{
    document.getElementById('currentProperties').innerText = `${JSON.stringify(printLayoutControl.getProperties(),null,2)}`
})

// make it globally available for debugging
// @ts-ignore
window.map = map;
// @ts-ignore
window.printLayoutControl = printLayoutControl;