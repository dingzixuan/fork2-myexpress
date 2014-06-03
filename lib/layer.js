var p2re = require("path-to-regexp");

module.exports = function(path, fn, prefix){
  var layer = new Object();
  layer.path = (path.charAt(path.length-1) == '/') ? path.substr(0, path.length-1) : path;
  layer.handle = fn;
  layer.prefix = prefix || false;

  layer.match = function(p) {
    p = decodeURIComponent(p);
    var names = [];
    var re = p2re(this.path, names, {end:this.prefix});
    if (re.test(p)) {
      var m = re.exec(p);
      var ret = {};
      ret.path = m[0];  //matched path
      ret.params = {};  //matched params
      for (i=0; i<names.length; i++) {
        ret.params[names[i].name] = m[i+1];
      }
      return ret;
    } else {
      //unmatched path or not enough parameters
      return undefined;
    }
  }
  return layer;
}