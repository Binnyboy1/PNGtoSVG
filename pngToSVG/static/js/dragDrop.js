// --- Local Storage Functions for legend mapping and categories ---
function loadCategories() {
  let savedCats = localStorage.getItem("legendCategories");
  if (savedCats) {
    legendCategories = JSON.parse(savedCats);
  }
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

  // Load categories from local storage if available.
  loadCategories();

  if (globalRatio.some(ratio => Math.abs((img.width / img.height) - ratio) < 0.01)) {
    processGridAndRecreateImage(img);
  } else {
    console.log("Invalid Image aspect ratio; skipping grid processing.");
  }
}