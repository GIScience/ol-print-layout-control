import {PrintLayout} from '../src/ol-print-layout-control'
import Control from 'ol/control/Control';
import {View, Map} from 'ol';
import {fromLonLat} from 'ol/proj';
import {Tile} from 'ol/layer';
import {OSM} from 'ol/source';
import 'ol/ol.css';
import {describe,it,expect,beforeAll} from 'vitest'

let map: Map, pl: PrintLayout;

beforeAll(()=>{
    const mapDiv = document.createElement('div');
    mapDiv.style.width = '100%';
    mapDiv.style.height = '80vh';
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

    pl = new PrintLayout({});
})

describe('PrintLayout', ()=>{
    it('Is instance of ol.control.Control', ()=>{
        expect(pl).to.be.instanceof(Control);
    });

    it('Can be added to a map', ()=>{
        expect(()=>map.addControl(pl)).not.toThrow();
    });

    it('Can be removed from a map', ()=>{
        map.addControl(pl);
        expect(()=>map.removeControl(pl)).not.toThrow();
    });

    it('should have more tests', () => {
        throw 'not yet implemented'
    });
})