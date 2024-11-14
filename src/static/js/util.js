
/**
* -----
* STYLE
* -----
*/

function gen_svg_gradient(startColor, endColor) {
    const svgGradient = `
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${startColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${endColor};stop-opacity:1" />
        </linearGradient>
        <rect width="10" height="10" fill="url(#gradient)" />
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svgGradient)}`;
}
