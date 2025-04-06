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
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathData);
      path.setAttribute("stroke", "#e9ecef");
      path.setAttribute("stroke-width", "1");
      path.setAttribute("fill", "none"); // or any fill color
      newSvg.appendChild(path);
    }
    svgParent.append(newSvg)
  } else {
    // Clear previous path(s)
    svg.innerHTML = '';

    if (pathData) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathData);
      path.setAttribute("stroke", "#e9ecef");
      path.setAttribute("stroke-width", "1");
      path.setAttribute("fill", "none"); // or any fill color
      svg.appendChild(path);
    }
  }
}

// Listen for input events on the textarea
document.getElementById('pathInput').addEventListener('input', drawPath);


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
      console.log('Success:', data);
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