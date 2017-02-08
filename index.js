(function(global) {
  var document = global.document,
      body = document.body,
      forEach = Array.prototype.forEach;

  function visit(element, clone, callback) {
    callback(element, clone);
    if (clone.firstElementChild) visit(element.firstElementChild, clone.firstElementChild, callback);
    if (clone.nextElementSibling) visit(element.nextElementSibling, clone.nextElementSibling, callback);
  }

  function inlineStyle(root) {
    var frame = body.appendChild(document.createElement("iframe")),
        clone = frame.contentDocument.body.appendChild(root.cloneNode(true));

    visit(root, clone, function(element, clone) {
      var elementStyle = global.getComputedStyle(element),
          cloneStyle = frame.contentWindow.getComputedStyle(clone),
          cloneStyles = clone.getAttribute("style") || "";
      for (var i = 0, n = elementStyle.length; i < n; ++i) {
        var name = elementStyle[i],
            elementValue = elementStyle[name],
            cloneValue = cloneStyle[name];
        if (elementValue !== cloneValue) {
          cloneStyles += ";" + name + ":" + elementValue;
        }
      }
      if (cloneStyles) clone.setAttribute("style", cloneStyles);
    });

    body.removeChild(frame);
    return clone;
  }

  function serialize(root) {
    return (new XMLSerializer).serializeToString(inlineStyle(root));
  }

  forEach.call(document.querySelectorAll("svg"), function(svg) {
    if (svg.namespaceURI !== "http://www.w3.org/2000/svg") return; // Not really an SVG.
    if (svg.ownerSVGElement) return; // An SVG within another SVG.

    var canvas = document.createElement("canvas"),
        context = canvas.getContext("2d"),
        image = new Image,
        ratio = global.devicePixelRatio || 1,
        width = svg.getAttribute("width") * ratio,
        height = svg.getAttribute("height") * ratio,
        url = URL.createObjectURL(new Blob([serialize(svg)], {type: "image/svg+xml"}));

    image.onload = function() {
      context.drawImage(this, 0, 0, width, height);
      url = URL.revokeObjectURL(url);
      canvas.toBlob(function(blob) {
        var a = document.createElement("a");
        a.download = "untitled.png";
        a.href = url = URL.createObjectURL(blob);
        body.appendChild(a);
        a.click();
        setTimeout(function() {
          url = URL.revokeObjectURL(url);
          body.removeChild(a);
        }, 10);
      });
    };

    canvas.width = width;
    canvas.height = height;
    image.src = url;
  });
})(this);
