var http = require("http");

function express() {
  function app(req, res) {
    res.statusCode = 404;
    res.end();
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
