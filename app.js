define(["jquery", "d3"], function($, d3) {
    //-------------

    // Code goes here

  console.clear();

  console.log('d3: ', d3);

  var time = {
    toPullLastfm: 0,
    toRender: 0
  };

  /***
  * @model
  * graph nodes and links populated from last.fm api response
  */
  var model = {
    nodes: [],
    links: []
  };

  /***
  * @mock model
  */
  var mock = {
    nodes: [
      {
        "index": 0,
        "artist": "The Vines",
        "similarTo": "Jet",
        "match": 1,
        "image": "http://userserve-ak.last.fm/serve/64/180082.jpg"
      },
      {
        "index": 1,
        "artist": "The Hives",
        "similarTo": "Jet",
        "match": 0.827027,
        "image": "http://userserve-ak.last.fm/serve/64/22750213.jpg"
      },
      {
        "index": 2,
        "artist": "The Fratellis",
        "similarTo": "Jet",
        "match": 0.79757,
        "image": "http://userserve-ak.last.fm/serve/64/22517.jpg"
      },
      {
        "index": 3,
        "artist": "Oasis",
        "similarTo": "Jet",
        "match": 0.678907,
        "image": "http://userserve-ak.last.fm/serve/64/57096689.jpg"
      },
      {
        "index": 4,
        "artist": "Dirty Pretty Things",
        "similarTo": "Jet",
        "match": 0.641076,
        "image": "http://userserve-ak.last.fm/serve/64/269081.jpg"
      }
    ],
    links: [
      { source: 0, target: 0 },
      { source: 0, target: 1 },
      { source: 0, target: 2 },
      { source: 0, target: 3 },
      { source: 0, target: 4 }
    ]
  };

  /***
  * @view
  * viewmodel for d3 svg elements
  */
  var view = {
    canvas: null,
    width: 800,
    height: 800,
    force: null,
    links: null,
    nodes: null, 
    groups: null, 
    defs: null
  };

  view.canvas = d3.select("body")
          .append("svg")
          .attr({
            width: view.width,  
            height: view.height
          }); 
  console.log('canvas: ', view.canvas);


  renderView(mock, view, time);
  view.force.on('tick', function(){
    updateView(view);  
  });


  /*** 
  * @helper
  * last.fm api request helper
  */
  function lastfmSimilar(artist){
    return $.getJSON('http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=' + artist + '&api_key=4c9a840aeb98791ab0363400efd984ac&format=json&callback=?').then(function(data){ 
      return data;
    });
  }

  /***
  * @helper
  * re-render view on model changes
  * @params model, view, time: dependency injection
  */
  function renderView(model, view, time){
    
    time.toRender = new Date();
    
    view.force = d3.layout.force()
            .size([view.width, view.height])
            .nodes(model.nodes)
            .links(model.links)
            .charge(-1500)
            .gravity(0.25)
            .friction(0.5)
            .linkDistance(function(d) { 
              return d.source.match * view.width * Math.random(); 
            });
    console.log('view force', view.force);  
              
    //view.force.linkDistance(view.width*Math.random());
    
    view.groups = view.canvas.selectAll('g.gnode')
          .data(model.nodes)
          .enter()
            .append('g')
            .classed('gnode', true)
      .call(view.force.drag);
      
    view.defs = view.groups.append('svg:defs')
            .data(model.nodes)
              .append('svg:pattern')
                .attr('id', function(d){ return 'no-'+d.index; })
                .attr('patternUnits', 'userSpaceOnUse')
                //.attr('patternContentUnits', 'objectBoundingBox') 
                .attr('width', 63)
                .attr('height', 42)
              .append('svg:image')
                .attr('xlink:href', function(d){ return d.image; })
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', 63)
                .attr('height', 42);
   /*   
    view.groups.append("image")
        .attr("xlink:href", function(d){ return d.image; })
        .attr("x", -32)
        .attr("y", -32)
        .attr("width", 64)
        .attr("height", 50) 
        .attr("class", "img")
        .attr("id", function(d){ return 'no-'+d.index; });
    */
    
    view.nodes = view.groups.append("circle")
      .attr("class", "node")
      .attr('r', view.width/25)
      .style("fill", function(d){ return 'url(#no-'+d.index+')'; });
    
    /*      
    view.nodes = view.groups.append("circle")
      .attr("class", "node")
      .attr('r', view.width/25);
    */
    
    // Append the labels to each group
    view.labels = view.groups.append("text")
      .text(function(d) { return d.artist; })
      .attr('x', 35);
      
    view.links = view.canvas.selectAll('.link')
          .data(model.links)
          .enter()
            .append('line')
            .attr('class', 'link');

    /*
    view.links = view.canvas.selectAll('.link')
          .data(model.links)
          .enter()
            .append('line')
            .attr('class', 'link');
    console.log('view links', view.links);
    
    view.nodes = view.canvas.selectAll('.node')
      .data(model.nodes)
      .enter()
        .append('circle')
        .attr('class', 'node')
        .attr('fill', 'transparent')
        .attr('fill', function(d){ return "url("+ d.image  +")"; });
    console.log('view nodes', view.nodes);
    */
    view.force.start();
  }

  /***
  * @helper
  * update view after force layout calculations ended
  */
  function updateView(view){
    /*
    view.nodes.attr('r', view.width/25)
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; });
    */    
    view.links.attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });
        
    view.groups.attr("transform", function(d) { 
      return 'translate(' + [d.x, d.y] + ')';
    });  
  }

  /***
  * @helper
  * detach and remove all elements from svg
  */
  function clearView(canvas){
    canvas.selectAll("*").remove();
  };

  /***
  * @controller
  */
  $(document).ready(function(){
    $('form').on('submit', function(event){
      event.preventDefault();
      
      var $search = $('#search input'),
          searched = $search.val(), 
          $spinner = $('.spinner');
      
      time.toPullLastfm = new Date();

      /*** 
      *  pull last.fm api similar artist, transform response and update graph model
      */
      lastfmSimilar(searched).then(function(lastfmSimilars){
        console.log('EVENT: last.fm API similar artists response', lastfmSimilars);  
        if (typeof lastfmSimilars.similarartists.artist == 'object') {
          lastfmSimilars.similarartists.artist.forEach(function(artist, idx){
            
            if(idx > 40){ return; }
            
            var artistImage = {
              width: 0,
              height: 0,
              img: new Image()
            };
            artistImage.img.onload = function() {
              artistImage.width = this.width;
              artistImage.height = this.height;
              console.log(artistImage.width + 'x' + artistImage.height);
            }
            artistImage.img.src = artist.image[2]['#text'];
            
            model.nodes.push({
              index: idx,
              artist: artist.name,
              similarTo: lastfmSimilars.similarartists['@attr'].artist,
              match: parseFloat(artist.match),
              image: artist.image[2]['#text'],
              imageWidth: artistImage.width,
              imageHeight: artistImage.height
            });
            model.links.push({
              source: 0,
              target: idx
            });
          });
          
          /*** 
          *  measure time to load
          */
          time.toPullLastfm -= new Date();
          console.log('TIME Last.fm API request loaded: ' + Math.abs(time.toPullLastfm) + 'ms');
          
          // delete input after submit
          $('#search input').val('');
          
          //$spinner.addClass('active');
          
          /*** 
          *  render view
          */
          clearView(view.canvas);
          renderView(model, view, time);
          
          /*** 
          *  attach graph event handlers
          */
          view.force.on('start', function(){
            console.log('EVENT: force layout calculations started');
          });
          view.force.on('end', function(){
            console.log('EVENT: force layout calculations ended');
            
            /*** 
            *  update graph
            */
            updateView(view);
            
            //$spinner.removeClass('active');
                
            /*** 
            *  measure time to render
            */
            time.toRender -= new Date();
            console.log('TIME to render d3 view: ' + Math.abs(time.toRender) + 'ms');
        
          });
          view.force.on('tick', function(){
            console.log('EVENT: force tick!');
            updateView(view);
          });
                
        }else{
          console.log('Your taste is too special. There is nothing similar here.');
        }
        console.log('model', model);
      });  
    });
  });



    //---------
});