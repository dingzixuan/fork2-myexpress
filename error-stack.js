var app = require("./")();
// the first middleware creates an error
app.use(function(req,res,next) {
  var error = new Error("an error");
  next(error);
});

// skip this if there is an error
app.use(function(req,res,next) {
  console.log("second middleware");
  next();
});

app.use(function(error,req,res,next) {
  console.log("first error handler");
  next(error);
});

// skip this if there is an error
app.use(function(req,res,next) {
  console.log("third middleware");
  next();
});

app.use(function(error,req,res,next) {
  console.log("second error handler");
  res.end("hello from second error handler");
});

app.listen(4000);
