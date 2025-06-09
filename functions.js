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
    pattern: 'none',
    patternOpacity: '0',
};

const root = document.documentElement;
const primaryColorPicker = document.getElementById('primary-color-picker');
const schemeSelect = document.getElementById('scheme-select');
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
const customColorPicker = document.getElementById('custom-color-picker');
const secondaryColorPicker = document.getElementById('secondary-color-picker');
const backgroundColorPicker = document.getElementById('background-color-picker');


// Add change event listener to primary color picker
primaryColorPicker.onchange = function(){
    updateTheme();
}

secondaryColorPicker.onchange = function(){
    updateTheme();
}

backgroundColorPicker.onchange = function(){
    updateTheme();
}

// Add change event listener to scheme select
schemeSelect.onchange = function() {
    updateTheme();
    tryAgainBtn.classList.toggle('hidden', schemeSelect.value !== 'lucky');
    customColorPicker.classList.toggle('hidden', schemeSelect.value !== 'custom');
    secondaryColorPicker.value = theme.secondaryBrand;
    backgroundColorPicker.value = theme.surface1;
}


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
      theme.pattern = selected;
      // Remove all existing pattern classes
      patternClasses.forEach(cls => patternOverlay.classList.remove(cls));
      theme.patternOpacity = patternOpacity.value;
  
      // Add the selected pattern class
      patternOverlay.classList.add(`pattern-overlay-${selected}`);
    }
  };

// Add change event listener to pattern opacity
patternOpacity.oninput = function() {
    const value = this.value;
    opacityValue.textContent = value;
    patternOverlay.style.opacity = value / 100;
    theme.patternOpacity = value;
}

// Add change event listener to theme select
themeSelect.onchange = function() {
    updateTheme();
}

// Add click event listener to try again button
tryAgainBtn.onclick = function() {
    updateTheme();
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

// updateTheme
function updateTheme() {
    const color = primaryColorPicker.value;
    if(schemeSelect.value == "custom"){
        theme.primaryBrand = primary(color);
        theme.secondaryBrand = secondary(secondaryColorPicker.value);
        theme.gradientBrand1 = gradientBrand1(backgroundColorPicker.value);
        theme.gradientBrand2 = gradientBrand2(backgroundColorPicker.value);
        theme.surface1 = surface1(color);
        theme.surface2 = surface2(color);
        theme.primaryText = primaryText(color);
        theme.secondaryText = secondaryText(color);
        theme.tertiaryText = tertiaryText(color);
        theme.primaryBrandText = primaryBrandText(color);
        theme.graph1 = graph1(color);
    }
    else{
    theme.primaryBrand = primary(color);
    theme.secondaryBrand = secondary(color);
    theme.gradientBrand1 = gradientBrand1(color);
    theme.gradientBrand2 = gradientBrand2(color);
    theme.surface1 = surface1(color);
    theme.surface2 = surface2(color);
    theme.primaryText = primaryText(color);
    theme.secondaryText = secondaryText(color);
    theme.tertiaryText = tertiaryText(color);
    theme.primaryBrandText = primaryBrandText(color);
    theme.graph1 = graph1(color);
    }

    root.style.setProperty('--primary-brand', theme.primaryBrand);
    root.style.setProperty('--secondary-brand', theme.secondaryBrand);
    root.style.setProperty('--gradient-brand-1', theme.gradientBrand1);
    root.style.setProperty('--gradient-brand-2', theme.gradientBrand2);
    root.style.setProperty('--surface-1', theme.surface1);
    root.style.setProperty('--surface-2', theme.surface2);
    root.style.setProperty('--primary-text', theme.primaryText);
    root.style.setProperty('--secondary-text', theme.secondaryText);
    root.style.setProperty('--tertiary-text', theme.tertiaryText);
    root.style.setProperty('--primary-brand-text', theme.primaryBrandText);
    root.style.setProperty('--graph-1', theme.graph1);
}

// Initial state
updateTheme();


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
