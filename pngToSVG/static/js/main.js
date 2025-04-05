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
      path.setAttribute("stroke", "black");
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
      path.setAttribute("stroke", "black");
      path.setAttribute("stroke-width", "1");
      path.setAttribute("fill", "none"); // or any fill color
      svg.appendChild(path);
    }
  }
}

function insertSvg() {
  const svgParent = document.getElementById('svgContainer');
  
  // Add fetch quest to grab Svg data that will be displayed
  svgParent.innerHTML = `${data}`;
}