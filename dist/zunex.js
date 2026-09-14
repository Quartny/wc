(function (window) {
  var config = { inBuild: 'off' };
  var runtime = window.Zunex || {};
  runtime.conf = {
    get: function () { return config; },
    set: function (next) {
      config = Object.assign({}, config, next);
      window.dispatchEvent(new CustomEvent('zunex:config', { detail: config }));
    }
  };
  window.Zunex = runtime;
}(window));
