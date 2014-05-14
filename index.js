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
      var nFn = queue[index++];
      //结束
      if (!nFn) {
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
        var arity = nFn.length;
        if (err) {
          //下个middleware有四个参数
          if (arity == 4) {
            nFn(err, req, res, next);
          } else {
            next(err);
          }
        } else if (arity < 4) {
            nFn(req, res, next);
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
  app.use = function(fn) {
    //if ('function' == typeof fn) {
    //  this.queue.push(fn);
    //}
    //sub app
    if ('function' == typeof fn.handle) {
      var server = fn;
      fn = function(req, res, next) {
        server.handle(req, res, next);
      }
    }
    this.queue.push(fn);
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
