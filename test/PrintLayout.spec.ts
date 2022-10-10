import {Options, ORIENTATION, PrintLayout} from '../src/ol-print-layout-control'
import Control from 'ol/control/Control';
import {Map, View} from 'ol';
import {fromLonLat} from 'ol/proj';
import {Tile} from 'ol/layer';
import {OSM} from 'ol/source';
import 'ol/ol.css';
import {beforeEach, describe, expect, it} from 'vitest'


let map: Map,
    printLayoutInstanceWithDefaultOptions: PrintLayout,
    customOptions: Readonly<Options>,
    printLayoutInstanceWithCustomOptions: PrintLayout;

beforeEach(() => {
    const mapDiv = document.createElement('div');
    mapDiv.style.width = '300px';
    mapDiv.style.height = '400px';
    document.body.appendChild(mapDiv);

    map = new Map({
        target: mapDiv,
        view: new View({
            center: fromLonLat([8.667, 49.417]),
            zoom: 15
        })
    });

    const osmCartoLayer = new Tile({
        source: new OSM()
    });
    map.addLayer(osmCartoLayer);

    printLayoutInstanceWithDefaultOptions = new PrintLayout();

    customOptions = Object.freeze({
        orientation: ORIENTATION.LANDSCAPE,
        format: 'A0',
        margin: {top: 3, bottom: 2, left: 1, right: 0}
    });


    printLayoutInstanceWithCustomOptions = new PrintLayout(customOptions);
})

describe('PrintLayout class', () => {
    it('Is instance of ol.control.Control', () => {
        expect(printLayoutInstanceWithDefaultOptions).to.be.instanceof(Control);
    });
});

describe('PrintLayout Instance', () => {
    it('Can be added to a map', () => {
        expect(() => map.addControl(printLayoutInstanceWithDefaultOptions)).not.toThrow();
    });

    it('Can be removed from a map', () => {
        map.addControl(printLayoutInstanceWithDefaultOptions);
        expect(() => map.removeControl(printLayoutInstanceWithDefaultOptions)).not.toThrow();
    });
});

describe('PrintLayout initialize with properties', () => {

    it('has expected properties', () => {

        map.addControl(printLayoutInstanceWithCustomOptions);

        //test values
        const getter = {
            format: printLayoutInstanceWithCustomOptions.getFormat(),
            orientation: printLayoutInstanceWithCustomOptions.getOrientation(),
            margin: printLayoutInstanceWithCustomOptions.getMargin().getProperties()
        }

        //assert
        expect(getter).to.deep.equals(customOptions);
    })
});