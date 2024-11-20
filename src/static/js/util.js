

function decode_json(text){
  //var msg = decodeURIComponent(text.replace(/\+/g, '%20')+'');
  var msg = text;
  var parser = new DOMParser;
  var dom = parser.parseFromString('<!doctype html><body>' + msg,'text/html');
  msg = dom.body.textContent;
  //msg = msg.replace(/'/g, '"');
  msg = msg.replace(/[\n\r]/g, '\\n');
  msg = msg.replace(/\\/g, "\\\\");
  return msg;
}

function jquery2js(elem){
  return elem.get(0);
}

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
