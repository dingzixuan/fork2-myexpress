var http = require("http");
var Layer = require("./lib/layer");

function express() {

  //让app和app.handle参数一致，middleware就既可以是app也可以是function(req,res,next)
  function app(req, res, next) {
    app.handle(req, res, next);
  }
  app.isSubApp = false;
  app.queue = [];
  app.handle = function(req, res, out) {
    var index = 0;
    var queue = this.queue;
    function next(err) {
      var nLayer = queue[index++];
      //从本app中结束
      if (!nLayer) {
        //trim url 之前是在这里app调用结束后，调用out实现到另一个app的延续调用
        // if (out) {
        //   return out(err);
        // }
        //为了实现trim url，这里如果一个subapp调用完毕则直接return，在外层修改回url后再调用next实现延续调用
        if (app.isSubApp) {
          //err handle
        }
        //unhandled error should return 500
        else if (err) {
          res.statusCode = 500;
          res.write("500");
          res.end();
        } else {
          res.statusCode = 404;
          res.write("404");
          res.end();
        }
        return;  //注意在这里return
      }
      //调用nLayer
      try {
        //add req.params
        req.params = {};  //default value
        var reqInfo = nLayer.match(req.url);
        if (!reqInfo) { //如果url不匹配则跳过此middleware调用下一个
          return next(err); 
        }  
        req.params = reqInfo.params;
        var arity = nLayer.handle.length;

        //if middleware is a subapp, trim the req.url prefix and call handle
        if ('function' == typeof nLayer.handle.handle) {
          var oriUrl = req.url;
          req.url = req.url.substring(reqInfo.path.length);
          nLayer.handle(req, res, next);
          req.url = oriUrl;
          next(err);
        }

        else if (err) {  //pass err
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
  app.use = function(path, mw, prefix) {
    var layer;
    //if has no path arg
    if ('string' != typeof path) {
      mw = path;
      path = '/';
    }
    prefix = prefix || false;
    //if middleware is a subapp
    if ('function' == typeof mw.handle) {
      mw.isSubApp = true;
    }
    //add layer to queue
    layer = new Layer(path, mw, prefix);
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
