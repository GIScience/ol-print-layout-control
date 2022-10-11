function fillSelectOptions(selectElementId, optionsMap) {
    const selectElement = document.getElementById(selectElementId);
    for (const paperformatKey in optionsMap) {
        const option = document.createElement('option');
        option.text = optionsMap[paperformatKey];
        selectElement.appendChild(option);
    }
}

//fill form options, set initial form value from ol-Control and bind listeners to update View and Mode in both ways

// property: format
fillSelectOptions('format', PAPER_FORMAT);
document.getElementById('format').value = printLayoutControl.getFormat();
document.getElementById('format').addEventListener('change', (event) => {
    printLayoutControl.setFormat(event.target.value);
});
printLayoutControl.on('change:format', (event) => {
    document.getElementById('format').value = event.target.getFormat();
});

// property: orientation
fillSelectOptions('orientation', ORIENTATION);
document.getElementById('orientation').value = printLayoutControl.getOrientation();
document.getElementById('orientation').addEventListener('change', (event) => {
    printLayoutControl.setOrientation(event.target.value);
});
printLayoutControl.on('change:orientation', (event) => {
    document.getElementById('orientation').value = event.target.getOrientation();
});

// property: margin
document.getElementById('marginTop').value = printLayoutControl.getMargin().getTop();
document.getElementById('marginTop').addEventListener('change', (event) => {
    printLayoutControl.getMargin().setTop(event.target.value);
})

document.getElementById('marginBottom').value = printLayoutControl.getMargin().getBottom();
document.getElementById('marginBottom').addEventListener('change', (event) => {
    printLayoutControl.getMargin().setBottom(event.target.value);
})

document.getElementById('marginLeft').value = printLayoutControl.getMargin().getLeft();
document.getElementById('marginLeft').addEventListener('change', (event) => {
    printLayoutControl.getMargin().setLeft(event.target.value);
})

document.getElementById('marginRight').value = printLayoutControl.getMargin().getRight();
document.getElementById('marginRight').addEventListener('change', (event) => {
    printLayoutControl.getMargin().setRight(event.target.value);
})

printLayoutControl.on('change:margin', (event) => {
    const prtLytCtrl = event.target;
    document.getElementById('marginTop').value = prtLytCtrl.getMargin().getTop();
    document.getElementById('marginBottom').value = prtLytCtrl.getMargin().getBottom();
    document.getElementById('marginLeft').value = prtLytCtrl.getMargin().getLeft();
    document.getElementById('marginRight').value = prtLytCtrl.getMargin().getRight();
})

//initialize and update output
printLayoutControl.on('change', () => {

    const marginProps = JSON.stringify(printLayoutControl.getMargin().getProperties(), null, 2);
    document.getElementById('marginProperties').innerText = marginProps;

    document.getElementById('formatProperties').innerText = JSON.stringify(printLayoutControl.getFormat());
    document.getElementById('orientationProperties').innerText = JSON.stringify(printLayoutControl.getOrientation());
    document.getElementById('bboxProperties').innerText = JSON.stringify(printLayoutControl.getBbox());
    document.getElementById('bboxAsLonLatMethod').innerText = JSON.stringify(printLayoutControl.getBboxAsLonLat());
    document.getElementById('scaleDenominatorMethod').innerText = JSON.stringify(printLayoutControl.getScaleDenominator());

    const dpi = Number(document.getElementById('dpi').value);
    document.getElementById('printBoxSizeInDotsMethod').innerText = JSON.stringify(printLayoutControl.getPrintBoxSizeInDots(dpi))
});

// udpate output display on user input
document.getElementById('dpi').addEventListener('input', ()=>{printLayoutControl.dispatchEvent('change')});

//init output display
printLayoutControl.dispatchEvent('change');