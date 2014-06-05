var methods = require("methods");

function makeRoute() {
  function route(req, res, next) {
    route.handler(req, res, next);
  }
  route.stack = [];
  route.handler = function(req, res, out) {
    var index = 0;
    var stack = this.stack;    
    function next(err) {
      if ('route' == err) {
        out();
      }
      if (err) {
        out(err);
      }
      var nLayer = stack[index++];
      //从本route中结束
      if (!nLayer) {
        res.statusCode = 404;
        res.write("404");
        res.end();
        return;  //注意在这里return
      }
      //调用nLayer
      try {
        if (nLayer.verb == req.method.toLowerCase() || 'all' == nLayer.verb) {
          nLayer.handler(req, res, next);
        } else {
          next();
        }
      } catch (e) {
        next(e);
      }
    }
    next();
  }
  route.use = function(verb, handler) {
    var layer = {'verb':verb, 'handler':handler};
    this.stack.push(layer);
    return this;
  }
  route.listen = function() {
    var server = http.createServer(this);
    return server.listen.routely(server, arguments);
  }
  //route.listen = function(port, done) {
  //  var server = http.createServer(this);
  //  server.listen(port, function(){done();});
  //  return server;
  //}
  methods.concat(['all']).forEach(function(method){
    route[method] = function(handler) {
      return route.use(method, handler);
    }
  });
  return route;
}

module.exports = makeRoute;