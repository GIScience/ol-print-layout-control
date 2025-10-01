import {ORIENTATION, PAPER_FORMAT, PrintLayout} from '../dist/ol-print-layout-control'
import '../dist/ol-print-layout-control.css'
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
    margin: {top: 3, bottom: 3, left: 2, right: 2}
});
map.addControl(printLayoutControl);

// bind input elements
function fillSelectOptions(selectElementId, optionsMap) {
    const selectElement = document.getElementById(selectElementId);
    for (const paperformatKey in optionsMap) {
        const option = document.createElement('option');
        option.text = optionsMap[paperformatKey];
        selectElement.appendChild(option);
    }
}

function setFormValue(id: string, value: string) {
    const formInput = <HTMLInputElement>document.getElementById(id);
    formInput.value = value;
}

interface FormatHTMLSelectElement extends HTMLSelectElement {
    value: typeof PAPER_FORMAT[keyof typeof PAPER_FORMAT]
}

interface OrientationHTMLSelectElement extends HTMLSelectElement {
    value: ORIENTATION
}

function bindFormEvent(id: string, eventType: keyof HTMLElementEventMap, fn: EventListenerOrEventListenerObject) {
    const formInput = <HTMLInputElement>document.getElementById(id);
    formInput.addEventListener(eventType, fn);
}

//fill form options, set initial form value from ol-Control and bind listeners to update View and Mode in both ways

// property: format
fillSelectOptions('format', PAPER_FORMAT);
setFormValue('format', printLayoutControl.getFormat());
bindFormEvent('format', 'change', (event) => {
    const target = <FormatHTMLSelectElement>event.target;
    printLayoutControl.setFormat(target.value);
});
// @ts-ignore
printLayoutControl.on('change:format', (event) => {
    setFormValue('format', event.target.getFormat());
});

// property: orientation
fillSelectOptions('orientation', ORIENTATION);
setFormValue('orientation', printLayoutControl.getOrientation());
bindFormEvent('orientation', 'change', (event) => {
    const target = <OrientationHTMLSelectElement>event.target;
    printLayoutControl.setOrientation(target.value);
})
// @ts-ignore
printLayoutControl.on('change:orientation', (event) => {
    setFormValue('orientation', printLayoutControl.getOrientation());
});

// property: margin
setFormValue('marginTop', printLayoutControl.getMargin().getTop());
bindFormEvent('marginTop', 'change', (event) => {
    const target = <HTMLInputElement>event.target;
    printLayoutControl.getMargin().setTop(Number(target.value));
});

setFormValue('marginBottom', printLayoutControl.getMargin().getBottom());
bindFormEvent('marginBottom', 'change', (event) => {
    const target = <HTMLInputElement>event.target;
    printLayoutControl.getMargin().setBottom(Number(target.value));
});

setFormValue('marginLeft', printLayoutControl.getMargin().getLeft());
bindFormEvent('marginLeft', 'change', (event) => {
    const target = <HTMLInputElement>event.target;
    printLayoutControl.getMargin().setLeft(Number(target.value));
});

setFormValue('marginRight', printLayoutControl.getMargin().getRight());
bindFormEvent('marginRight', 'change', (event) => {
    const target = <HTMLInputElement>event.target;
    printLayoutControl.getMargin().setRight(Number(target.value));
});


// @ts-ignore
printLayoutControl.on('change:margin', (event) => {
    const prtLytCtrl = event.target;
    setFormValue('marginTop', prtLytCtrl.getMargin().getTop());
    setFormValue('marginBottom', prtLytCtrl.getMargin().getBottom());
    setFormValue('marginLeft', prtLytCtrl.getMargin().getLeft());
    setFormValue('marginRight', prtLytCtrl.getMargin().getRight());
})


//show current properties
printLayoutControl.on('change', () => {
    document.getElementById('marginProperties').innerText = `${JSON.stringify(printLayoutControl.getProperties(), null, 2)}`
})


// make it globally available for debugging
// @ts-ignore
window.map = map;
// @ts-ignore
window.printLayoutControl = printLayoutControl;
