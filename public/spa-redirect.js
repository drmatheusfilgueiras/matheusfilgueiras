(function () {
  var path = window.location.pathname.replace(/\/+$/, "") || "/";
  var target = path + window.location.search + window.location.hash;

  window.location.replace("/?route=" + encodeURIComponent(target));
})();
