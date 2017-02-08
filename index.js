(function(global) {
  var document = global.document,
      body = document.body,
      forEach = Array.prototype.forEach;

  function visit(element, clone, callback) {
    callback(element, clone);
    if (clone.firstElementChild) visit(element.firstElementChild, clone.firstElementChild, callback);
    if (clone.nextElementSibling) visit(element.nextElementSibling, clone.nextElementSibling, callback);
  }

  function inlineStyle(source, target) {
    var sourceStyle = source.ownerDocument.defaultView.getComputedStyle(source),
        targetStyle = target.ownerDocument.defaultView.getComputedStyle(target),
        targetStyles = target.getAttribute("style") || "";
    for (var i = 0, n = sourceStyle.length; i < n; ++i) {
      var name = sourceStyle[i],
          sourceValue = sourceStyle[name],
          targetValue = targetStyle[name];
      if (sourceValue !== targetValue) {
        targetStyles += ";" + name + ":" + sourceValue;
      }
    }
    if (targetStyles) target.setAttribute("style", targetStyles);
  }

  function inline(root) {
    var frame = body.appendChild(document.createElement("iframe")),
        clone = frame.contentDocument.body.appendChild(root.cloneNode(true)),
        cloneDefs = frame.contentDocument.createElementNS("http://www.w3.org/2000/svg", "defs");

    visit(root, clone, inlineStyle);

    visit(root, clone, function(source, target) {
      var href,
          sourceReferent,
          targetReferent;
      if (source.tagName === "use"
          && source.namespaceURI === "http://www.w3.org/2000/svg"
          && (href = source.getAttribute("href"))
          && (sourceReferent = document.querySelector(href))
          && !(targetReferent = frame.contentDocument.querySelector(href))) {
        targetReferent = cloneDefs.appendChild(sourceReferent.cloneNode(true));
        clone.insertBefore(cloneDefs, clone.firstChild);
        visit(sourceReferent, targetReferent, inlineStyle);
      }
    });

    body.removeChild(frame);
    return clone;
  }

  function serialize(root) {
    return (new XMLSerializer).serializeToString(inline(root));
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
