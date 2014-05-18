var http = require("http");
var Layer = require("./lib/layer");

function express() {
  
  //让app和app.handle参数一致，middleware就既可以是app也可以是function(req,res,next)
  function app(req, res, next) {
    app.handle(req, res, next);
  }
  
  app.queue = [];
  app.handle = function(req, res, out) {
    var index = 0;
    var queue = this.queue;
    function next(err) {
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
        } else {
          res.statusCode = 404;
          res.end();
        }
        return;  //注意在这里return
      }
      //调用nLayer
      try {
        //add req.params
        req.params = {};  //default value
        var reqInfo = nLayer.match(req.url);
        if (!reqInfo) return next();  //如果url不匹配则跳过此middleware调用下一个
        req.params = reqInfo.params;
        var arity = nLayer.handle.length;

        if (err) {  //pass err
          if (arity == 4) {
            nLayer.handle(err, req, res, next);
          } else {
            next(err);
          }
        } else if (arity < 4) { //call middleware
          nLayer.handle(req, res, next);
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
  app.use = function(path, mw) {
    var layer;
    //if has no path arg
    if ('string' != typeof path) {
      mw = path;
      path = '/';
    }
    //不需要为subapp多加处理
    //if fn is sub app
    // if ('function' == typeof fn.handle) {
    //   var server = fn;
    //   fn = function(req, res, next) {
    //     server.handle(req, res, next);
    //   }
    // }
    //add layer to queue
    layer = new Layer(path, mw);
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
