import './ol-print-layout-control.css';
import Control from 'ol/control/Control';
import {transformExtent} from 'ol/proj';
import {getDistance} from 'ol/sphere';
import {Map, MapEvent, Object as OlObject} from 'ol';
import {Size} from 'ol/size';
import {unByKey} from 'ol/Observable';
import {EventsKey} from 'ol/events';
import {ObjectEvent} from 'ol/Object';

// paper
export enum ORIENTATION {
    PORTRAIT = 'portrait',
    LANDSCAPE = 'landscape'
}

export const PAPER_FORMAT = {
    A4: 'A4',
    A3: 'A3',
    A2: 'A2',
    A1: 'A1',
    A0: 'A0',
    LETTER: 'LETTER',
    TABLOID: 'TABLOID',
    BROADSHEET: 'BROADSHEET'
} as const;

const INCH2MM = 25.4;

const PAPER_SIZE: { [format: string]: { short: number, long: number } } = {
    A4: {short: 210, long: 297},
    A3: {short: 297, long: 420},
    A2: {short: 420, long: 594},
    A1: {short: 594, long: 841},
    A0: {short: 841, long: 1189},
    LETTER: {short: 8.5 * INCH2MM, long: 11 * INCH2MM},
    TABLOID: {short: 11 * INCH2MM, long: 17 * INCH2MM},
    BROADSHEET: {short: 17 * INCH2MM, long: 22 * INCH2MM}

} as const;


const PrintLayoutProperty = {
    BBOX: 'bbox',
    FORMAT: 'format',
    ORIENTATION: 'orientation',
    //in cm
    MARGIN: 'margin'
}

export type Options = {
    margin?: MarginProps;
    format?: typeof PAPER_FORMAT[keyof typeof PAPER_FORMAT];
    orientation?: typeof ORIENTATION[keyof typeof ORIENTATION];
}

/**
 * The print-layout-control.
 * Add an instance of this to your OpenLayers Map.
 * @param {Options} [{format: 'A4', orientation: 'portrait', margin: {top: 2, bottom: 2, left: 2, right: 2}}] opt_options
 */
export class PrintLayout extends Control {
    private printArea: HTMLDivElement;
    private evtKeyMarginChange: EventsKey | undefined;


    constructor(opt_options: Options = {}) {

        const {
            format = PAPER_FORMAT.A4,
            orientation = ORIENTATION.PORTRAIT,
            margin = {top: 2, bottom: 2, left: 2, right: 2}
        } = opt_options;

        const {element, printArea} = createDomElements();

        super({
            element: element,
            render: (mapEvent) => {
                this.onRender(mapEvent);
            }
        });

        this.printArea = printArea;

        // observable properties
        this.set(PrintLayoutProperty.ORIENTATION, orientation);
        this.set(PrintLayoutProperty.FORMAT, format);

        this.setMargin(new Margin(margin));
        this.set(PrintLayoutProperty.BBOX, null);

        function createDomElements() {
            const element = document.createElement('div');
            element.className = 'paper-format';
            const printArea = document.createElement('div');
            printArea.className = 'print-area';
            printArea.id = 'print-area';
            element.appendChild(printArea);
            return {element, printArea};
        }
    }

    /**
     * @public
     */
    getOrientation() {
        return this.get(PrintLayoutProperty.ORIENTATION);
    }

    /**
     * @public
     * @param {ORIENTATION} orientation
     */
    setOrientation(orientation: ORIENTATION) {
        if (orientation.toUpperCase() in ORIENTATION) {
            this.set(PrintLayoutProperty.ORIENTATION, orientation);
            this.setElementSize();
            if (this.getMap()) {
                this.getMap()!.renderSync();
                this.handleBboxChange();
            }
            this.changed();
        } else {
            throw new Error(`orientation must be one of: ${Object.values(ORIENTATION)}`)
        }
    }

    /**
     * @public
     */
    getFormat() {
        return this.get(PrintLayoutProperty.FORMAT);
    }

    /**
     * @public
     * @param format
     */
    setFormat(format: typeof PAPER_FORMAT[keyof typeof PAPER_FORMAT]) {
        if (format.toUpperCase() in PAPER_FORMAT) {
            this.set(PrintLayoutProperty.FORMAT, format.toUpperCase());
            this.setElementSize();
            if (this.getMap()) {
                this.getMap()!.renderSync();
                this.handleBboxChange();
            }
            this.changed();
        } else {
            throw new Error(`format must be on of: ${Object.values(PAPER_FORMAT)}`)
        }
    }

    /**
     * @public
     */
    getMargin(): Margin {
        return this.get(PrintLayoutProperty.MARGIN);
    }

    /**
     * @public
     * @param {Margin} margin
     */
    setMargin(margin: Margin) {
        if (this.evtKeyMarginChange) {
            unByKey(this.evtKeyMarginChange)
        }

        this.evtKeyMarginChange = margin.on('propertychange', () => {
            this.setElementSize();
            if (this.getMap()) {
                this.getMap()!.renderSync();
                this.handleBboxChange();
            }

            if (this.hasListener('change:margin')) {
                this.dispatchEvent(new ObjectEvent('change:margin', PrintLayoutProperty.MARGIN, null));
            }
            if (this.hasListener('propertychange')) {
                this.dispatchEvent(new ObjectEvent('propertychange', PrintLayoutProperty.MARGIN, null));
            }
            this.changed();
        });

        this.set(PrintLayoutProperty.MARGIN, margin);
        this.setElementSize();
        if (this.getMap()) {
            this.getMap()!.renderSync();
            this.handleBboxChange();
        }
        this.changed();
    }

    /**
     * @public
     */
    getBbox() {
        // if not has map -> nothing we can do --> null
        if (!this.getMap()) {
            return null;
        }
        this.getMap()!.renderSync();
        return this.get('bbox');
    }

    /**
     * @public
     */
    getBboxAsLonLat() {
        return (this.getBbox()) ? transformExtent(this.getBbox(), 'EPSG:3857', 'EPSG:4326') : null;
    }

    protected computeBbox() {
        // if not has map -> nothing we can do --> null
        if (!this.getMap()) {
            return null;
        }
        const {left: p_left, top: p_top, right: p_right, bottom: p_bottom} = this.printArea.getBoundingClientRect();
        const {x: ol_x, y: ol_y} = this.getMap()!.getViewport().getBoundingClientRect();

        const rel_left = p_left - ol_x,
            rel_top = p_top - ol_y,
            rel_right = p_right - ol_x,
            rel_bottom = p_bottom - ol_y;

        const lowerLeft = this.getMap()!.getCoordinateFromPixel([rel_left, rel_bottom]);
        const upperRight = this.getMap()!.getCoordinateFromPixel([rel_right, rel_top]);
        return [...lowerLeft, ...upperRight];
    }

    /**
     * Computes the scale denominator for the printed map
     * @public
     */
    getScaleDenominator() {
        if (this.getBboxAsLonLat() == null) {
            return null;
        }
        const bbox4326 = this.getBboxAsLonLat();
        const lowerLeft = bbox4326!.slice(0, 2);
        const lowerRight = bbox4326!.slice(2, 4);
        //haversine distance from lower left to lower right corner
        const horizontalDistanceInMeter = getDistance(lowerLeft, lowerRight);
        //width of box in MM
        const {width: widthInMM} = this.getPrintBoxSizeInMM();
        const widthInM = widthInMM / 1000;

        return horizontalDistanceInMeter / widthInM;
    }


    /**
     * Get the print box size (width, height) in dots (px) for printing.
     *
     * This is useful to determine the OGC-WMS params 'WIDTH' and 'HEIGHT'
     * @public
     * @param dpi {number} the desired print resolution in dots-per-inch (dpi)
     * @returns {{width: number, height: number}}
     */
    getPrintBoxSizeInDots(dpi: number = 192): { width: number; height: number; } {
        const {width: widthInMM, height: heightInMM} = this.getPrintBoxSizeInMM();
        const widthInInch = widthInMM / INCH2MM;
        const heightInInch = heightInMM / INCH2MM;

        return {
            width: Math.round(widthInInch * dpi),
            height: Math.round(heightInInch * dpi)
        }
    }

    /**
     * @public
     */
    getPrintBoxSizeInMM() {
        const {short, long}: { short: number, long: number } = PAPER_SIZE[this.getFormat()];
        const horizontalMarginSum = (this.getMargin().getLeft() + this.getMargin().getRight()) * 10;
        const verticalMarginSum = (this.getMargin().getTop() + this.getMargin().getBottom()) * 10;

        return (this.getOrientation() === ORIENTATION.PORTRAIT) ? {
            width: short - horizontalMarginSum,
            height: long - verticalMarginSum
        } : {
            width: long - horizontalMarginSum,
            height: short - verticalMarginSum
        };
    }

    //screenPixel
    protected getPrintMarginsInPx(): MarginProps {
        const {width, height} = this.element.getBoundingClientRect();
        const {long} = PAPER_SIZE[this.getFormat()];
        const CM2PX_FACTOR = (this.getOrientation() === ORIENTATION.PORTRAIT) ? height / (long / 10) : width / (long / 10);
        let marginsPx = {top: 0, bottom: 0, left: 0, right: 0};
        let marginsCm = this.getMargin().getProperties();

        let key: keyof MarginProps;
        for (key in marginsCm) {
            marginsPx[key] = marginsCm[key] * CM2PX_FACTOR;
        }

        return marginsPx;
    }


    protected getScreenMapAspectRatio() {

        if (!this.getMap()?.getSize()) {
            return 1;
        }
        const [w, h]: Size = this.getMap()!.getSize()!;

        if (h === 0) {
            return Number.MAX_SAFE_INTEGER;
        }
        return w / h;
    }

    protected getPaperMapAspectRatio() {
        const {long, short} = PAPER_SIZE[this.getFormat()];
        return (this.getOrientation() === ORIENTATION.PORTRAIT) ? short / long : long / short;
    }

    protected getRestrictingDimension() {
        return (this.getScreenMapAspectRatio() < this.getPaperMapAspectRatio()) ? 'width' : 'height';
    }

    protected setElementSize() {
        //set size
        if (this.getRestrictingDimension() === 'width') {
            this.element.style.height = '';
            this.element.style.width = '80%';
        } else {
            this.element.style.height = '80%';
            this.element.style.width = '';
        }

        //set aspect ratio
        const {long, short} = PAPER_SIZE[this.getFormat()];
        const aspectRatioPortrait = short / long;

        this.element.style.aspectRatio = String((this.getOrientation() === ORIENTATION.PORTRAIT) ? aspectRatioPortrait : 1 / aspectRatioPortrait);


        //set print box after paper is defined
        this.printArea.style.top = `${this.getPrintMarginsInPx().top}px`;
        this.printArea.style.bottom = `${this.getPrintMarginsInPx().bottom}px`;
        this.printArea.style.left = `${this.getPrintMarginsInPx().left}px`;
        this.printArea.style.right = `${this.getPrintMarginsInPx().right}px`;
    }

    handleBboxChange() {
        this.set(PrintLayoutProperty.BBOX, this.computeBbox())
        this.changed();
    }

    _map: Map | null | undefined;

    onRender(_mapEvent: MapEvent) {

        //register events when the control has a map and starts rendering
        if (!this._map || this._map !== this.getMap()) {
            this._map = this.getMap();
            //register zooming and panning
            const changeViewEvtKey = this.getMap()!.getView().on('change', this.handleBboxChange.bind(this));
            //register resizing of the map container
            const changeMapSizeEvtKey = this.getMap()!.on('change:size', () => {
                this.setElementSize();
                this.handleBboxChange();
            });

            // unregister events when control is removed from map
            this.getMap()!.getControls().once('remove', (e) => {
                if (e.element === this) {
                    this._map!.getView().un('change', changeViewEvtKey.listener);
                    this._map!.un('change:size', changeMapSizeEvtKey.listener);
                    this._map = null;
                }
            });

            //init bbox once the control has a map and is rendered
            this.setElementSize();
            this.set(PrintLayoutProperty.BBOX, this.computeBbox(), true);
            this.dispatchEvent('change');
        }
    }
}

/**
 *
 */
type MarginProps = { top: number, bottom: number, left: number, right: number };

/**
 * The Margin Class to set paper margins in cm.
 */
export class Margin extends OlObject {

    constructor(marginProps: Partial<MarginProps> = {}) {
        super();
        const {top = 0, bottom = 0, left = 0, right = 0} = marginProps;

        this.set('top', top);
        this.set('bottom', bottom);
        this.set('left', left);
        this.set('right', right);
    }

    /**
     * @public
     */
    getProperties(): MarginProps {
        return <MarginProps>super.getProperties();
    }

    /**
     * @public
     */
    getTop() {
        return this.get('top');
    }

    /**
     * @public
     * @param topMarginInCm
     */
    setTop(topMarginInCm: number) {

        //no negative values, cast to numbers
        topMarginInCm = Math.max(0, Number(topMarginInCm));

        this.set('top', topMarginInCm);
        this.changed();
    }

    /**
     * @public
     */
    getBottom() {
        return this.get('bottom');
    }

    /**
     * @public
     * @param bottomMarginInCm
     */
    setBottom(bottomMarginInCm: number) {

        //no negative values, cast to numbers
        bottomMarginInCm = Math.max(0, Number(bottomMarginInCm));

        this.set('bottom', bottomMarginInCm);
        this.changed();
    }

    /**
     * @public
     */
    getLeft() {
        return this.get('left');
    }

    /**
     * @public
     * @param leftMarginInCm
     */
    setLeft(leftMarginInCm: number) {

        //no negative values, cast to numbers
        leftMarginInCm = Math.max(0, Number(leftMarginInCm));

        this.set('left', leftMarginInCm);
        this.changed();
    }

    /**
     * @public
     */
    getRight() {
        return this.get('right');
    }

    /**
     * @public
     * @param rightMarginInCm
     */
    setRight(rightMarginInCm: number) {

        //no negative values, cast to numbers
        rightMarginInCm = Math.max(0, Number(rightMarginInCm));

        this.set('right', rightMarginInCm);
        this.changed();
    }
}

// Expose PrintLayout as ol.control.PrintLayout if using a full build of
// OpenLayers


// @ts-ignore
if (window['ol'] && window['ol']['control']) {
    // @ts-ignore
    window['ol']['control']['PrintLayout'] = PrintLayout;
    // @ts-ignore
    window['ol']['control']['PrintLayout']['Margin'] = Margin;
    // @ts-ignore
    window['PAPER_FORMAT'] = PAPER_FORMAT;
    // @ts-ignore
    window['ORIENTATION'] = ORIENTATION;
}
