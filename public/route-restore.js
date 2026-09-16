(function () {
  var params = new URLSearchParams(window.location.search);
  var route = params.get("route");

  if (!route || route.charAt(0) !== "/" || route.indexOf("//") === 0) {
    return;
  }

  window.history.replaceState(null, "", route);
})();
