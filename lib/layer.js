module.exports = function(path, fn){
  var layer = new Object();
  layer.path = "/";
  if ('function' == typeof fn) {
    layer.path = path;
    layer.handle = fn;
  } else {
    layer.handle = path;
  }

  layer.match = function(p) {
    if (p.indexOf(this.path) == 0) {
      return {"path":this.path};
    } else {
      return undefined;
    }
  }
  return layer;
}