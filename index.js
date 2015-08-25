requirejs.config({
    "paths": {
      "jquery": "http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min", 
      "d3": "http://cdnjs.cloudflare.com/ajax/libs/d3/3.5.3/d3"
    }
});

requirejs(["app"]);