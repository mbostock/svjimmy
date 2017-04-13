(function(global) {
  var document = global.document,
      body = document.body,
      forEach = Array.prototype.forEach,
      styles = document.querySelectorAll("style");

  forEach.call(document.querySelectorAll("svg"), function(svg) {
    if (svg.namespaceURI !== "http://www.w3.org/2000/svg") return; // Not really an SVG.
    if (svg.ownerSVGElement) return; // An SVG within another SVG.

    forEach.call(styles, function(style) { svg.appendChild(style.cloneNode(true)); });

    var canvas = document.createElement("canvas"),
        context = canvas.getContext("2d"),
        image = new Image,
        ratio = global.devicePixelRatio || 1,
        rect = svg.getBoundingClientRect(),
        width = rect.width * ratio,
        height = rect.height * ratio,
        imageUrl = URL.createObjectURL(new Blob([(new XMLSerializer).serializeToString(svg)], {type: "image/svg+xml"}));

    image.onload = function() {
      setTimeout(function() {
        context.drawImage(image, 0, 0, width, height);
        canvas.toBlob(function(blob) {
          var a = document.createElement("a"),
              aUrl = URL.createObjectURL(blob);
          a.download = "untitled.png";
          a.href = aUrl;
          body.appendChild(a);
          setTimeout(function() {
            a.click();
            aUrl = URL.revokeObjectURL(aUrl);
            imageUrl = URL.revokeObjectURL(imageUrl);
            body.removeChild(a);
          }, 10);
        });
      }, 10);
    };

    canvas.width = width;
    canvas.height = height;
    image.src = imageUrl;
  });
})(this);
