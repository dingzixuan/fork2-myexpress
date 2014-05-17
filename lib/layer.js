var p2re = require("path-to-regexp");

module.exports = function(path, fn){
  var layer = new Object();
  
  if ('string' == typeof path) {
    layer.path = (path.charAt(path.length -1) == '/') ? path.substr(0, path.length-1):path;
  }
  if ('function' == typeof fn) {
    layer.handle = fn;
  } else {
    layer.handle = path;
  }

  layer.match = function(p) {
    p = decodeURIComponent(p);
    var names = [];
    var re = p2re(this.path, names, {end:false});
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
    
    if (p.indexOf(this.path) == 0) {
      return {"path":this.path};
    } else {
      return undefined;
    }
  }
  return layer;
}