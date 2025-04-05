function drawPath() {
  const pathData = document.getElementById('pathInput').value.trim();
  const svg = document.getElementById('svgOutput');
  // Clear previous path(s)
  svg.innerHTML = '';
  if (pathData) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("stroke", "black");
    path.setAttribute("stroke-width", "1");
    path.setAttribute("fill", "none"); // or any fill color
    svg.appendChild(path);
  }
}