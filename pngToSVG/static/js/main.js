function drawPath() {
  const pathData = document.getElementById('pathInput').value.trim();
  const svg = document.getElementById('svgOutput');
  
  // If svgOutput was overwritten
  if (svg == null) {
    const svgParent = document.getElementById('svgContainer');
    // Clear previous content(s)
    svgParent.innerHTML = '';
    var newSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    newSvg.setAttribute("viewBox", "0 0 400 400");
    newSvg.id = 'svgOutput';

    if (pathData) {
      const path = createSvgPath(pathData); // Use our safe function
      if (path) { // Only append if valid
        newSvg.appendChild(path);
      }
    }
    svgParent.append(newSvg)
  } else {
    // Clear previous path(s)
    svg.innerHTML = '';

    if (pathData) {
      const path = createSvgPath(pathData); // Use our safe function
      if (path) { // Only append if valid
        svg.appendChild(path);
      }
    }
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
  
  return path;
}

const textarea = document.getElementById('pathInput');
// Listen for changes as user types or deletes
textarea.addEventListener('input', () => {
  if (textarea.value.trim() === '') {
    textarea.classList.remove('invalid');
  }
});





// Clean version of insertSvg()
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
}