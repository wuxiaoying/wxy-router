(function() {
  var extend, importedUris, previousRoute, router,
    __slice = [].slice;

  router = new RouteRecognizer();

  importedUris = {};

  previousRoute = void 0;

  extend = function() {
    var extendee, extendees, key, src, value, _i, _len;
    src = arguments[0], extendees = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    for (_i = 0, _len = extendees.length; _i < _len; _i++) {
      extendee = extendees[_i];
      for (key in extendee) {
        value = extendee[key];
        src[key] = value;
      }
    }
  };

  Polymer({
    attached: function() {
      this._AddRoutes();
      this._OnStateChange();
      window.addEventListener('popstate', this._OnStateChange.bind(this));
    },
    go: function(uri, _arg) {
      var data, options, _ref;
      _ref = _arg != null ? _arg : {}, data = _ref.data, options = _ref.options;
      if (options == null) {
        options = {};
      }
      uri = '#' + uri;
      if (options.replace) {
        window.history.replaceState(null, null, uri);
      } else {
        window.history.pushState(null, null, uri);
      }
      this._OnStateChange(data);
    },
    _AddRoutes: function() {
      var handler, handlers, route, routes, _i, _len;
      routes = this.children;
      handlers = {};
      for (_i = 0, _len = routes.length; _i < _len; _i++) {
        route = routes[_i];
        handler = handlers[route.path] = route;
        router.add([
          {
            path: route.path,
            handler: handler
          }
        ]);
      }
    },
    _OnStateChange: function(data) {
      var match, result;
      result = router.recognize(window.location.hash.substring(1));
      if (!(result != null ? result.length : void 0) > 0) {
        return;
      }
      match = result[0];
      match.data = data;
      this._Import(match);
    },
    _Import: function(match) {
      var uri;
      uri = match.handler["import"];
      Polymer["import"]([uri], (function(_this) {
        return function() {
          _this._Activate(match);
        };
      })(this));
    },
    _Activate: function(match) {
      var customElement, elementName, model, route;
      route = match.handler;
      elementName = route.name;
      customElement = document.createElement(elementName);
      model = {
        router: this
      };
      extend(customElement, model, match.params, match.data);
      this._RemoveContent(previousRoute);
      previousRoute = route;
      route.appendChild(customElement);
    },
    _RemoveContent: function(route) {
      var node, nodeToRemove;
      if (!route) {
        return;
      }
      node = route.firstChild;
      while (nodeToRemove = route.firstChild) {
        route.removeChild(nodeToRemove);
      }
    }
  });

}).call(this);
