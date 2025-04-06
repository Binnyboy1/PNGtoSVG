function drawPath() {
  const pathData = document.getElementById('pathInput').value.trim();
  const svgParent = document.getElementById('svgContainer');
  const path = createSvgPath(pathData); // Use our safe function
  if (path) { // Only append if valid
    svgParent.appendChild(path);
  }
}

// Listen for input events on the textarea
document.getElementById('pathInput').addEventListener('input', drawPath);



/********* Path Formatting *********/
document.getElementById('toggleFormat').addEventListener('click', togglePathFormat);
function togglePathFormat() {
  const textarea = document.getElementById('pathInput');
  const currentValue = textarea.value.trim();
  
  // Reset validation state: always remove the "invalid" class first
  textarea.classList.remove('invalid');
  
  // Skip processing if empty; this prevents any "invalid" class from being added
  if (!currentValue) return;

  // 1. Validate the path data
  if (!isValidSvgPath(currentValue)) {
    textarea.classList.add('invalid');
    return;
  }

  // 2. Determine current format and toggle between compressed and indented
  const isCompressed = !currentValue.includes('\n');
  
  if (isCompressed) {
    // Convert to indented format
    textarea.value = formatIndented(currentValue);
  } else {
    // Convert to compressed format
    textarea.value = formatCompressed(currentValue);
  }
}
// Validation function (doesn't interact with the DOM)
function isValidSvgPath(pathData) {
  // Basic structure validation: ensure it starts with an "M" or "m" and has content
  const commandRegex = /^[Mm]\s*[\d.-]/;
  if (!commandRegex.test(pathData)) return false;
  
  // Advanced validation using DOMParser
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<svg><path d="${pathData.replace(/"/g, "'")}"/></svg>`,
      'image/svg+xml'
    );
    return !!doc.querySelector('path');
  } catch {
    return false;
  }
}


// Helper function that pads numbers to 8 characters for indented format
function formatIndented(pathData) {
  const result = [];
  let i = 0;
  let prefix = '';
  let currentLine = [];

  // Regex to match a command or number
  const tokenRegex = /([A-Za-z])|(-?\d+(?:\.\d+)?)/g;
  const tokens = [...pathData.matchAll(tokenRegex)];

  while (i < tokens.length) {
    const token = tokens[i][0];

    if (/^[A-Za-z]$/.test(token)) {
      // It's a command letter
      prefix = token + ' ';
      i++;
      continue;
    }

    // Get two number groups for each line
    const num1 = tokens[i]?.[0] ?? '';
    const num2 = tokens[i + 1]?.[0] ?? '';

    if (num1 && num2) {
      const padded1 = num1.padStart(8, ' ');
      const padded2 = num2.padStart(8, ' ');
      result.push(prefix + padded1 + ' ' + padded2);
      prefix = '  '; // Only use command prefix once
      i += 2;
    } else {
      break;
    }
  }

  return result.join('\n');
}
  
function formatCompressed(indentedPath) {
  let normalized = indentedPath
    .replace(/\n/g, ' ')           // Flatten newlines
    .replace(/,/g, '')             // Remove commas
    .replace(/\s+/g, ' ')          // Collapse all whitespace to single space
    .trim();                       // Clean up edges

  return normalized;
}
  
  
// SVG creation
function createSvgPath(pathData) {
  const textarea = document.getElementById('pathInput');
  textarea.classList.remove('invalid');

  if (!pathData.trim()) return null;

  // 1. Basic Regex Validation
  const isValidSyntax = /^[Mm]\s*[\d.]/.test(pathData) && /[A-Za-z][^A-Za-z]*$/.test(pathData);
  
  // 2. DOM-based Validation
  let domValid = false;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<svg><path d="${pathData}"/></svg>`,
      'image/svg+xml'
    );
    domValid = !!doc.querySelector('path');
  } catch {}

  if (!isValidSyntax || !domValid) {
    textarea.classList.add('invalid');
    return null;
  }

  // 3. Safe Path Creation
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathData);
  path.setAttribute("stroke", "#e9ecef");
  path.setAttribute("stroke-width", "1");
  path.setAttribute("fill", "#e9ecef");
  path.setAttribute("fill-rule", "evenodd");

  // 4. Update bounding box
  const viewBox = computeViewBoxFromPath(pathData);
  const newSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  newSvg.id = "svgOutput";
  newSvg.setAttribute("viewBox", viewBox);
  const [x, y, w, h] = viewBox.split(" ");
  newSvg.setAttribute("width", w);
  newSvg.setAttribute("height", h);

  newSvg.appendChild(path);
  return newSvg;
}

const textarea = document.getElementById('pathInput');
// Listen for changes as user types or deletes
textarea.addEventListener('input', () => {
  if (textarea.value.trim() === '') {
    textarea.classList.remove('invalid');
  }
});

function computeViewBoxFromPath(pathData, padding = 2) {
  const svgNS = "http://www.w3.org/2000/svg";
  const tempSvg = document.createElementNS(svgNS, "svg");
  // Hide the temporary element
  tempSvg.style.position = "absolute";
  tempSvg.style.left = "-9999px";
  
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", pathData);
  tempSvg.appendChild(path);
  document.body.appendChild(tempSvg);

  const bbox = path.getBBox();

  document.body.removeChild(tempSvg);

  // Expand the bounding box by 'padding' units on each side.
  const minX = bbox.x - padding;
  const minY = bbox.y - padding;
  const width = bbox.width + padding * 2;
  const height = bbox.height + padding * 2;
  
  return `${minX} ${minY} ${width} ${height}`;
}





function insertSvg() {
  // PNG URL
  const storedImg = document.getElementById('preview-canvas');
  const pngData = storedImg.toDataURL('image/png');
  const pngData_json = { pngData };

  fetch('/pngToSvg', {
      method: 'POST', // Use POST method
      headers: {
          'Content-Type': 'application/json', // The server expects JSON
      },
      body: JSON.stringify(pngData_json), // Send the pngData_json in the request body as JSON
  })
    .then(response => response.json()) // Parse the JSON response from the server
    .then(data => {
      const svgContainer = document.getElementById('svgContainer');
      // overwrite
      svgContainer.innerHTML = data["svg_info"];
    //   console.log('Success:', data["svg_info"]);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}


function upscalePNG() {
  // PNG URL
  const storedImg = document.getElementById('preview-canvas');
  const pngData = storedImg.toDataURL('image/png');
  const pngData_json = { pngData };

  fetch('/pngUpscale', {
      method: 'POST', // Use POST method
      headers: {
          'Content-Type': 'application/json', // The server expects JSON
      },
      body: JSON.stringify(pngData_json), // Send the pngData_json in the request body as JSON
  })
    .then(response => response.json()) // Parse the JSON response from the server
    .then(data => {
      // TODO: Change this with what you want it to do later
      // console.log('Success:', data["svg_info"]);
      const pngContainer = document.getElementById('divC1R2');
      pngContainer.innerHTML = "<img src='../static/images/upscaled_image.png' />"
    })
    .catch(error => {
      console.error('Error:', error);
    });
}



/********* DOM & CANVAS SETUP *********/
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');
const canvas = document.getElementById('preview-canvas');
const placeholderText = document.getElementById('placeholder-text');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.style.width = "auto";
  canvas.style.height = uploadZone.clientHeight + "px";
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

/********* DRAG-AND-DROP / CLICK HANDLERS *********/
uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
  uploadZone.style.borderColor = '#3b82f6';
});
uploadZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  e.stopPropagation();
  uploadZone.style.borderColor = '#d1d5db';
});
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  uploadZone.style.borderColor = '#d1d5db';
  handleFiles(e.dataTransfer.files);
});
uploadZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
  handleFiles(e.target.files);
});

/********* FILE HANDLING *********/
function handleFiles(files) {
  if (files.length > 0) {
    placeholderText.style.display = 'none';
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => drawImageOnCanvas(img);
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        alert('Only image files are supported.');
      }
    });
  }
}

/********* DRAW ORIGINAL IMAGE *********/
function drawImageOnCanvas(img) {
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, img.width, img.height);
  canvas.style.width = "auto";
  canvas.style.height = "100%";

  insertSvg();
  upscalePNG();
}

function computeViewBoxFromPath(pathData, padding = 2) {
  const svgNS = "http://www.w3.org/2000/svg";
  const tempSvg = document.createElementNS(svgNS, "svg");
  // Hide the temporary element
  tempSvg.style.position = "absolute";
  tempSvg.style.left = "-9999px";
  
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", pathData);
  tempSvg.appendChild(path);
  document.body.appendChild(tempSvg);

  const bbox = path.getBBox();

  document.body.removeChild(tempSvg);

  // Expand the bounding box by 'padding' units on each side.
  const minX = bbox.x - padding;
  const minY = bbox.y - padding;
  const width = bbox.width + padding * 2;
  const height = bbox.height + padding * 2;
  
  return `${minX} ${minY} ${width} ${height}`;
}

/********* Zooming and Panning SVG *********/
const divC2 = document.getElementById('divC2');
const svgContainer = document.getElementById('svgContainer');

// Global transform state
let scale = 1;
let panX = 0;
let panY = 0;

// A helper to update the transform using a CSS matrix.
// We do not use transformOrigin here.
function updateTransform() {
  svgContainer.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${panX}, ${panY})`;
}

// Helper to get pointer coordinates relative to divC2.
function getRelativePointer(e) {
  const rect = divC2.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
    width: rect.width,
    height: rect.height,
  };
}

// ----- Mouse Panning and Zooming ----- //
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let panStart = { x: 0, y: 0 };

divC2.addEventListener('mousedown', (e) => {
  isDragging = true;
  const pointer = getRelativePointer(e);
  dragStart = { x: pointer.x, y: pointer.y };
  panStart = { x: panX, y: panY };
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const pointer = getRelativePointer(e);
  // Calculate change since drag start
  panX = panStart.x + (pointer.x - dragStart.x);
  panY = panStart.y + (pointer.y - dragStart.y);
  updateTransform();
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

// Zooming with mouse wheel, zooming relative to the pointer position.
divC2.addEventListener('wheel', (e) => {
  e.preventDefault();
  const pointer = getRelativePointer(e);
  // Calculate zoom factor (adjust sensitivity as needed)
  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
  
  // New scale
  const newScale = scale * zoomFactor;
  
  panX = pointer.x - (pointer.x - panX) * zoomFactor;
  panY = pointer.y - (pointer.y - panY) * zoomFactor;
  
  scale = newScale;
  updateTransform();
});

// ----- Touch Panning and Pinch Zooming ----- //
let touchMode = null; // "pan" or "pinch"
let initialTouchDistance = 0;
let initialScale = scale;
let initialPan = { x: panX, y: panY };
let pinchCenter = { x: 0, y: 0 };

divC2.addEventListener('touchstart', (e) => {
  const rect = divC2.getBoundingClientRect();
  if (e.touches.length === 1) {
    touchMode = 'pan';
    const touch = e.touches[0];
    const pointer = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
    dragStart = { ...pointer };
    initialPan = { x: panX, y: panY };
  } else if (e.touches.length === 2) {
    touchMode = 'pinch';
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    initialTouchDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    initialScale = scale;
    initialPan = { x: panX, y: panY };
    // Compute the midpoint of the two touches relative to divC2
    pinchCenter.x = ((touch1.clientX + touch2.clientX) / 2) - rect.left;
    pinchCenter.y = ((touch1.clientY + touch2.clientY) / 2) - rect.top;
  }
});

divC2.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const rect = divC2.getBoundingClientRect();
  if (touchMode === 'pan' && e.touches.length === 1) {
    const touch = e.touches[0];
    const pointer = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
    panX = initialPan.x + (pointer.x - dragStart.x);
    panY = initialPan.y + (pointer.y - dragStart.y);
    updateTransform();
  } else if (touchMode === 'pinch' && e.touches.length === 2) {
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    const newScale = initialScale * (currentDistance / initialTouchDistance);
    // Adjust pan to keep pinchCenter fixed
    panX = pinchCenter.x - (pinchCenter.x - initialPan.x) * (newScale / initialScale);
    panY = pinchCenter.y - (pinchCenter.y - initialPan.y) * (newScale / initialScale);
    scale = newScale;
    updateTransform();
  }
});

divC2.addEventListener('touchend', (e) => {
  if (e.touches.length === 0) {
    touchMode = null;
  }
});
