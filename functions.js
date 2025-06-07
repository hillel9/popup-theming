const theme = {
    primaryBrand: '',
    secondaryBrand: '',
    gradientBrand1: '',
    gradientBrand2: '',
    primaryText: '',
    secondaryText: '',
    tertiaryText: '',
    primaryBrandText: '',
    graph1: '',
    surface1: '',
    surface2: '',
};

const root = document.documentElement;
const primaryColorPicker = document.getElementById('primary-color-picker');
const backgroundStyleInputs = document.getElementsByName('background-style');
const tryAgainBtn = document.getElementById('try-again-btn');
const themeSelect = document.getElementById('theme-select');
const patternSelect = document.getElementById('pattern-select');
const patternOverlay = document.getElementById('pattern-overlay');
const patternOpacity = document.getElementById('pattern-opacity');
const opacityValue = document.getElementById('opacity-value');
const patternOpacityGroup = document.getElementById('pattern-opacity-group');
const commentInput = document.getElementById('comment-input');
const commentPostBtn = document.getElementById('comment-post-btn');
const showThemeBtn = document.getElementById('show-theme-btn');
const themeModal = document.getElementById('theme-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const themeObjectDisplay = document.getElementById('theme-object-display');
const copyJsonBtn = document.getElementById('copy-json-btn');

// Add change event listener to primary color picker
primaryColorPicker.onchange = function(){
    runPreview();
}

// Add change event listener to radio buttons
backgroundStyleInputs.forEach(input => {
    input.onchange = function() {
        runPreview();
        // Show/hide try again button based on selection
        tryAgainBtn.classList.toggle('hidden', input.value !== 'lucky');
    }
});

const patternClasses = [
    'pattern-overlay-dots',
    'pattern-overlay-wood',
    'pattern-overlay-lines',
    'pattern-overlay-mural',
    'pattern-overlay-charlie-brown'
  ];
  
  patternSelect.onchange = function () {
    const selected = patternSelect.value;
  
    if (selected === "none") {
      patternOverlay.style.display = 'none';
      patternOpacityGroup.style.display = 'none';
    } else {
      patternOverlay.style.display = 'block';
      patternOpacityGroup.style.display = 'block';
  
      // Remove all existing pattern classes
      patternClasses.forEach(cls => patternOverlay.classList.remove(cls));
  
      // Add the selected pattern class
      patternOverlay.classList.add(`pattern-overlay-${selected}`);
    }
  };

// Add change event listener to pattern opacity
patternOpacity.oninput = function() {
    const value = this.value;
    opacityValue.textContent = value;
    patternOverlay.style.opacity = value / 100;
}

// Add change event listener to theme select
themeSelect.onchange = function() {
    runPreview();
}

// Add click event listener to try again button
tryAgainBtn.onclick = function() {
    runPreview();
}

function modeSwitcher(l,d){
    let output = 100;
    if(themeSelect.value == "light"){
      output = l;
    }
    else if(themeSelect.value == "dark"){
      output = d;
    }
    return output;
  }

// Run preview
function runPreview() {
    root.style.setProperty('--primary-brand', primary(primaryColorPicker.value));
    root.style.setProperty('--secondary-brand', secondary(primaryColorPicker.value));
    root.style.setProperty('--gradient-brand-1', gradientBrand1(primaryColorPicker.value));
    root.style.setProperty('--gradient-brand-2', gradientBrand2(primaryColorPicker.value));
    root.style.setProperty('--surface-1', surface1(primaryColorPicker.value));
    root.style.setProperty('--surface-2', surface2(primaryColorPicker.value));
    root.style.setProperty('--primary-text', primaryText(primaryColorPicker.value));
    root.style.setProperty('--secondary-text', secondaryText(primaryColorPicker.value));
    root.style.setProperty('--primary-brand-text', primaryBrandText(primaryColorPicker.value));
    root.style.setProperty('--graph-1', graph1(primaryColorPicker.value));
    root.style.setProperty('--tertiary-text', tertiaryText(primaryColorPicker.value));
}

// Run preview
runPreview();

// Add change event listener to comment input

function primary(color){
    const HSL = hexToHSL(color);
    let hue = HSL[0]; let saturation = HSL[1]; let lightness = HSL[2];
    //Processing

    theme.primaryBrand = HSLToHex(hue, saturation, lightness);
    return theme.primaryBrand;
}

function secondary(color){
    const HSL = hexToHSL(color);
    let hue = HSL[0]; let saturation = HSL[1]; let lightness = HSL[2];

    //Processing
    if(backgroundStyleInputs[3].checked){
        hue = randomHue();
    }
    saturation = saturation * 0.8;

    lightness = 60; 
    if(hue >= 40 && hue <= 180){
        lightness = 40;
    }
    
    theme.secondaryBrand = HSLToHex(hue, saturation, lightness);
    return theme.secondaryBrand;
}

function gradientBrand1(color){
    const HSL = hexToHSL(color);
    let hue = HSL[0]; let saturation = HSL[1]; let lightness = HSL[2];

    //Processing
    if(backgroundStyleInputs[1].checked){
        hue = hue - 180;
    }else if(backgroundStyleInputs[2].checked){
        hue = (hue + 30) % 360; 
    }else if(backgroundStyleInputs[3].checked){
        hue = randomHue();
    }

    if(backgroundStyleInputs[1].checked){
        saturation = 16;
    }
    else{
        saturation = 40;
    }

    lightness = modeSwitcher(86, 24);

    theme.gradientBrand1 = HSLToHex(hue, saturation, lightness);
    return theme.gradientBrand1;
}

function gradientBrand2(color){
    const HSL = hexToHSL(color);
    let hue = HSL[0]; let saturation = HSL[1]; let lightness = HSL[2];

    //Processing
    if(backgroundStyleInputs[1].checked){
        hue = hue - 180;
    }else if(backgroundStyleInputs[2].checked){
        hue = (hue + 45) % 360;
    }else if(backgroundStyleInputs[3].checked){
        hue = randomHue();
    }

    if(backgroundStyleInputs[1].checked){
        saturation = 16;
    }
    else{
        saturation = 40;
    }

    lightness = modeSwitcher(90, 10);

    theme.gradientBrand2 = HSLToHex(hue, saturation, lightness);
    return theme.gradientBrand2;
}

function surface1(color){
    const HSL = hexToHSL(color);
    let hue = HSL[0]; let saturation = HSL[1]; let lightness = HSL[2];

    saturation = 20;
    lightness = modeSwitcher(100, 4);

    theme.surface1 = HSLToHex(hue, saturation, lightness);
    return theme.surface1;
}

function surface2(color){
    const HSL = hexToHSL(color);
    let hue = HSL[0]; let saturation = HSL[1]; let lightness = HSL[2];

    saturation = 20;
    lightness = modeSwitcher(94, 12);

    theme.surface2 = HSLToHex(hue, saturation, lightness);
    return theme.surface2;
}

function graph1(color){
    const HSL = hexToHSL(color);
    let hue = HSL[0]; let saturation = HSL[1]; let lightness = HSL[2];

    saturation = 20;
    lightness = modeSwitcher(60, 40);

    theme.graph1 = HSLToHex(hue, saturation, lightness);
    return theme.graph1;
}

function primaryText(color){
    const HSL = hexToHSL(color);
    let hue = HSL[0]; let saturation = HSL[1]; let lightness = HSL[2];

    saturation = 20;
    lightness = modeSwitcher(4, 100);

    theme.primaryText = HSLToHex(hue, saturation, lightness);
    return theme.primaryText;
}

function secondaryText(color){
    const HSL = hexToHSL(color);
    let hue = HSL[0]; let saturation = HSL[1]; let lightness = HSL[2];

    saturation = 20;
    lightness = modeSwitcher(30, 80);

    theme.secondaryText = HSLToHex(hue, saturation, lightness);
    return theme.secondaryText;
}

function tertiaryText(color){
    const HSL = hexToHSL(color);
    let hue = HSL[0]; let saturation = HSL[1]; let lightness = HSL[2];

    saturation = 20;
    lightness = modeSwitcher(40, 70);

    theme.tertiaryText = HSLToHex(hue, saturation, lightness);
    return theme.tertiaryText;
}

function primaryBrandText(color){
    const rgb = hexToRGB(color);
    let hue = rgb[0]; let saturation = rgb[1]; let lightness = rgb[2];

    const luminance = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
  
    if (luminance > 0.5) {
      theme.primaryBrandText = '#000000';
    } else {
      theme.primaryBrandText = '#ffffff';
    }

    return theme.primaryBrandText;
}

// Modal functionality
showThemeBtn.addEventListener('click', () => {
    themeObjectDisplay.innerHTML = '';

    for (const [key, value] of Object.entries(theme)) {
        const item = document.createElement('div');
        item.classList.add('theme-item');

        const keySpan = document.createElement('span');
        keySpan.classList.add('theme-key');
        keySpan.textContent = key;

        const valueDiv = document.createElement('div');
        valueDiv.classList.add('theme-value');

        const valueSpan = document.createElement('span');
        valueSpan.textContent = value;
        valueDiv.appendChild(valueSpan);

        if (value.startsWith('#')) {
            const swatch = document.createElement('div');
            swatch.classList.add('color-swatch');
            swatch.style.backgroundColor = value;
            valueDiv.appendChild(swatch);
        }

        item.appendChild(keySpan);
        item.appendChild(valueDiv);
        themeObjectDisplay.appendChild(item);
    }
    themeModal.style.display = 'flex';
});

closeModalBtn.addEventListener('click', () => {
    themeModal.style.display = 'none';
});

copyJsonBtn.addEventListener('click', () => {
    const jsonString = JSON.stringify(theme, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
        copyJsonBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyJsonBtn.textContent = 'Copy JSON';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
});
