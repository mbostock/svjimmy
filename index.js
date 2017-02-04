(function(global) {
  Array.prototype.forEach.call(global.document.querySelectorAll("svg"), function(svg, i) {
    var canvas = global.document.createElement("canvas"),
        context = canvas.getContext("2d"),
        image = new Image,
        ratio = global.devicePixelRatio || 1,
        width = svg.getAttribute("width") * ratio,
        height = svg.getAttribute("height") * ratio,
        url = URL.createObjectURL(new Blob([(new XMLSerializer).serializeToString(svg)], {type: "image/svg+xml"}));
    canvas.width = width;
    canvas.height = height;
    image.onload = function () {
      context.drawImage(this, 0, 0, width, height);
      url = URL.revokeObjectURL(url);
      canvas.toBlob(function(blob) {
        var a = global.document.createElement("a");
        a.download = "untitled" + (i ? "-" + i : "") + ".png";
        a.href = url = URL.createObjectURL(blob);
        a.textContent = "untitled-" + i + ".png";
        global.document.body.appendChild(a);
        a.click();
        setTimeout(function() {
          url = URL.revokeObjectURL(url);
          global.document.body.removeChild(a);
        }, 10);
      });
    };
    image.src = url;
  });
})(this);
