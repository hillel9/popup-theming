
function primary(color){
    const HSL = hexToHSL(color);
    let hue = HSL[0]; let saturation = HSL[1]; let lightness = HSL[2];
    //Processing

    const hex = HSLToHex(hue, saturation, lightness);
    return hex;
}

function secondary(color){
    const HSL = hexToHSL(color);
    let hue = HSL[0]; let saturation = HSL[1]; let lightness = HSL[2];

    //Hue Processing
    if(schemeSelect.value === 'lucky'){
        hue = randomHue();
    }

    //Saturation Processing
    saturation = saturation * 0.8;
    if(schemeSelect.value === 'neutral'){
        saturation = saturation * 0.5;
    }

    //Lightness Processing
    lightness = 60; 
    if(hue >= 40 && hue <= 180){
        lightness = 40;
    }
    
    const hex = HSLToHex(hue, saturation, lightness);
    return hex;
}

function gradientBrand1(color){
    const HSL = hexToHSL(color);
    let hue = HSL[0]; let saturation = HSL[1]; let lightness = HSL[2];

    //Hue Processing
    if(schemeSelect.value === 'complementary'){
        hue = (hue + 180) % 360;
    }else if(schemeSelect.value === 'analog'){
        hue = (hue + 30) % 360;
    }else if(schemeSelect.value === 'lucky'){
        hue = randomHue();
    }

    //Saturation Processing
    if(schemeSelect.value === 'complementary'){
        saturation = 16;
    }else if(schemeSelect.value === 'neutral'){
        saturation = 10;
    }else{
        saturation = 40;
    }

    //Lightness Processing
    lightness = modeSwitcher(86, 24);

    const hex = HSLToHex(hue, saturation, lightness);
    return hex;
}

function gradientBrand2(color){
    const HSL = hexToHSL(color);
    let hue = HSL[0]; let saturation = HSL[1]; let lightness = HSL[2];

    //Hue Processing
    if(schemeSelect.value === 'complementary'){
        hue = hue - 180;
    }else if(schemeSelect.value === 'analog'){
        hue = (hue + 45) % 360;
    }else if(schemeSelect.value === 'lucky'){
        hue = randomHue();
    }

    //Saturation Processing
    if(schemeSelect.value === 'complementary'){
        saturation = 16;
    }else if(schemeSelect.value === 'neutral'){
        saturation = 10;
    }else{
        saturation = 40;
    }

    //Lightness Processing
    lightness = modeSwitcher(90, 10);

    const hex = HSLToHex(hue, saturation, lightness);
    return hex;
}

function surface1(color){
    const HSL = hexToHSL(color);
    let hue = HSL[0]; let saturation = HSL[1]; let lightness = HSL[2];

    //Saturation Processing
    saturation = 20;

    //Lightness Processing
    lightness = modeSwitcher(100, 4);

    const hex = HSLToHex(hue, saturation, lightness);
    return hex;
}

function surface2(color){
    const HSL = hexToHSL(color);
    let hue = HSL[0]; let saturation = HSL[1]; let lightness = HSL[2];

    //Saturation Processing
    saturation = 20;

    //Lightness Processing
    lightness = modeSwitcher(94, 12);

    const hex = HSLToHex(hue, saturation, lightness);
    return hex;
}

function graph1(color){
    const HSL = hexToHSL(color);
    let hue = HSL[0]; let saturation = HSL[1]; let lightness = HSL[2];

    //Saturation Processing
    saturation = 20;

    //Lightness Processing
    lightness = modeSwitcher(60, 40);

    const hex = HSLToHex(hue, saturation, lightness);
    return hex;
}

function primaryText(color){
    const HSL = hexToHSL(color);
    let hue = HSL[0]; let saturation = HSL[1]; let lightness = HSL[2];

    //Saturation Processing
    saturation = 20;

    //Lightness Processing
    lightness = modeSwitcher(4, 100);

    const hex = HSLToHex(hue, saturation, lightness);
    return hex;
}

function secondaryText(color){
    const HSL = hexToHSL(color);
    let hue = HSL[0]; let saturation = HSL[1]; let lightness = HSL[2];

    //Saturation Processing
    saturation = 20;

    //Lightness Processing
    lightness = modeSwitcher(30, 80);

    const hex = HSLToHex(hue, saturation, lightness);
    return hex;
}

function tertiaryText(color){
    const HSL = hexToHSL(color);
    let hue = HSL[0]; let saturation = HSL[1]; let lightness = HSL[2];

    //Saturation Processing
    saturation = 20;

    //Lightness Processing
    lightness = modeSwitcher(40, 70);

    const hex = HSLToHex(hue, saturation, lightness);
    return hex;
}

function primaryBrandText(color){
    const rgb = hexToRGB(color);
    let hue = rgb[0]; let saturation = rgb[1]; let lightness = rgb[2];

    const luminance = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
    let hex = '';

    if (luminance > 0.5) {
      hex = '#000000';
    } else {
      hex = '#ffffff';
    }

    return hex;
}