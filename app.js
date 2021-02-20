// Global selections and variables
const colorDivs = document.querySelectorAll(".color");
const generateButton = document.querySelector(".generate");
const sliders = document.querySelectorAll(".sliders input");
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustButtons = document.querySelectorAll(".adjust");
const lockButtons = document.querySelectorAll(".lock");
const closeAdjButtons = document.querySelectorAll(".close-adjusment");
const sliderContainers = document.querySelectorAll(".sliders");
let initialColors;

// Event listeners
generateButton.addEventListener("click", randomColors);

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => [
  div.addEventListener("change", () => {
    updateTextHex(index);
  }),
]);

currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});

adjustButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});

closeAdjButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});

lockButtons.forEach((button, index) => {
  button.addEventListener("click", (e) => {
    lockAlternate(e, index);
  });
});

// Functions

function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();
    // Pass locked colors
    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(randomColor.hex());
    }
    const sliders = div.querySelectorAll(".sliders input");

    // Add color to the background
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;
    // Check for text contrast
    checkTextContrast(randomColor, hexText);
    // Colorize sliders
    const color = chroma(randomColor);
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });
  // Reset inputs' values
  resetInputs();
  // Check for button contrast
  adjustButtons.forEach((button, index) => {
    checkTextContrast(initialColors[index], button);
    checkTextContrast(initialColors[index], lockButtons[index]);
  });
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  // Saturation slider
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);

  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);
  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(
    0
  )}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(
    0
  )},${scaleBright(0.5)}, ${scaleBright(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204, 75, 75), rgb(204, 204, 75), rgb(75, 204, 75), rgb(75, 204, 204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75))`;
}

function hslControls(e) {
  const index =
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue") ||
    e.target.getAttribute("data-bright");

  const sliders = e.target.parentElement.querySelectorAll(
    "input[type='range']"
  );
  const hue = sliders[0];
  const bright = sliders[1];
  const sat = sliders[2];

  const bgColor = initialColors[index];

  let color = chroma(bgColor)
    .set("hsl.h", hue.value)
    .set("hsl.s", sat.value)
    .set("hsl.l", bright.value);

  colorDivs[index].style.backgroundColor = color;
  //Live sliders updating
  colorizeSliders(color, hue, bright, sat);
}

function updateTextHex(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const hexText = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");

  hexText.innerText = color.hex();

  checkTextContrast(color, hexText);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

function resetInputs() {
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = Math.floor(chroma(hueColor).hsl()[0]);
      slider.value = hueValue;
    }
    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2];
      slider.value = brightValue;
    }
    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = satValue;
    }
  });
}

function copyToClipboard(hex) {
  // Create temporary textarea to interact with clipboard
  const tempElement = document.createElement("textarea");
  tempElement.value = hex.innerText;
  document.body.appendChild(tempElement);
  tempElement.select();
  document.execCommand("copy");
  document.body.removeChild(tempElement);
  // Animations
  const popupBox = popup.children[0];
  popupBox.classList.add("active");
  popup.classList.add("active");
}

function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle("active");
}

function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove("active");
}

function lockAlternate(e, index) {
  const lockIcon = e.target.children[0];
  const currentBg = colorDivs[index];
  currentBg.classList.toggle("locked");
  // Alternate lock Icon
  if (lockIcon.classList.contains("fa-lock-open")) {
    e.target.innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
  }
}

randomColors();
