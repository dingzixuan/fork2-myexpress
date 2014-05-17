var http = require("http");

function express() {
  
  function app(req, res) {
    app.handle(req, res);
  }
  
  app.queue = [];
  app.handle = function(req, res, out) {
    var index = 0;
    var queue = this.queue;
    function next(err) {
      //var nFn = queue[index++];
      var nLayer = queue[index++];
      //结束
      if (!nLayer) {
        if (out) {
          return out(err);
        }
        //unhandled error should return 500
        if (err) {
          res.statusCode = 500;
          res.end();
        }
        res.statusCode = 404;
        res.end();
        return;  //注意在这里return
      }
      try {
        var arity = nLayer.handle.length;
        if (err) {  //pass err
          if (arity == 4) {
            if (reqInfo = nLayer.match(req.url)) {
              req.params = reqInfo.params;
              nLayer.handle(err, req, res, next);
            } else {
              next(err);
            }
          } else {
            next(err);
          }
        } else if (arity < 4) { //call middleware
          if (reqInfo = nLayer.match(req.url)) {
            req.params = reqInfo.params;
            nLayer.handle(req, res, next);
          } else {
            next();
          }
        } else {
          next();
        }
      } catch (e) {
        //uncaught error
        next(e);
      }
    }
    next();
  }
  app.use = function(path, fn) {
    var route = "/", layer;
    var Layer = require("./lib/layer");
    //if has path arg
    if ('function' == typeof fn) {
      route = path;
    } else {
      fn = path;
    }
    //if fn is sub app
    if ('function' == typeof fn.handle) {
      var server = fn;
      fn = function(req, res, next) {
        server.handle(req, res, next);
      }
    }
    //add layer to queue
    layer = new Layer(route, fn);
    this.queue.push(layer);
    return this;
  }
  app.listen = function() {
    var server = http.createServer(this);
    return server.listen.apply(server, arguments);
  }
  //app.listen = function(port, done) {
  //  var server = http.createServer(this);
  //  server.listen(port, function(){done();});
  //  return server;
  //}
  return app;
}

module.exports = express;
