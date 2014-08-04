///////////////////////////////////////////////////////////////////////////////
/* Define options */

var gameOptions = {
  height: 600,
  width: 900,
  nEnemies: 30,
  padding: 20
};

var gameStats = {
  score: 10,
  highScore: 0,
  startTime: new Date()
};

var enemyOptions = {
  rx: 10,
  ry: 15,
  angle: 0
};

var playerOptions = {
  size: 20,
  hitBox: 25
};

///////////////////////////////////////////////////////////////////////////////
/* Define functions */

var rand = function(n){
  return (Math.random() * n);
};

//create main svg element
var svg = d3.select("body")
  .append("svg")
  .attr({
    width:gameOptions.width,
    height:gameOptions.height,
  })
  .style("background-color", "white");


// generate new enemies
var enemies = svg.selectAll("ellipse")
  .data(d3.range(gameOptions.nEnemies));

//create and append enemies to the page.
enemies
  .enter()
  .append("ellipse")
  // use call callbacks to get random positions and color for each item
  .attr({
   cx:function(d) { return rand(gameOptions.width) ; },
   cy:function(d) { return rand(gameOptions.height) ; },
   rx: enemyOptions.rx,
   ry: enemyOptions.ry,
   fill: function(d) {return "rgb("+rand(255)+","+rand(255)+","+rand(255)+")" ;},
  })
  .classed("enemies", true);
  // This transform causes each item to start at random angle. 
  // This is unused because css transform rotate overrides the random angle and
  // starts the angle at zero. 
  // Using css transform rotate because it uses a shorter time interval  than
  // update transition, which results in each items rotating around its center.
  //==========================
  // .each( function(d){
  //   console.log(this);
  //   d3.select(this)
  //     .attr({
  //       transform: "rotate(" + d*10 +","+ this.cx.animVal.value+"," + this.cy.animVal.value+")"
  //     });
  // })

// first invocation: update the position for existing enemies
// subsequent invocation: update the position for one enemy
var update = function(element){
  // Multiple rx and ry by the same random factor in order to maintain
  // the shape of the item.
  var factor = rand(1.5) + 1;
  element
    .transition()
    .delay(0)
    .duration(800)
    .attr({
      cx:function(d) { return rand(gameOptions.width) ; },
      cy:function(d) { return  rand(gameOptions.height); },
      rx: enemyOptions.rx *factor,
      ry: enemyOptions.ry *factor,
      fill: function(d) {return "rgb("+rand(255)+","+rand(255)+","+rand(255)+")" ;},
    })
    // Call update() at end of transition in order to chain
    // transitions together. This allows us to use d3 timer mechanism
    // instead of setInterval(update(), time)
    .each('end', function(d){
      update(d3.select(this));
    });
};


// sets up D3 drag listener.
// the player is draggable.
var drag = d3.behavior.drag()
    .on("drag", function(){
      d3.select(this)
        .attr({
          x: d3.event.x,
          y: d3.event.y
        });
    });

// create player and add to page
var makePlayer = function(){
    svg
      .append("rect")
      .attr({
        fill: "#ff0000",
        stroke: "#110404",
        "stroke-width": 5,
        width: playerOptions.size,
        height: playerOptions.size,
        // player stats at center of gameboard
        x: gameOptions.width/2 ,
        y: gameOptions.height/2
      })
      .classed("player", true);
};

//calculate distance between player and enemies 
// to determine if there's a collision
var detectCollision = function(){
  var enemy;
  var player = d3.select(".player");
  var pX = player.attr("x");
  var pY = player.attr("y");

  var hasCollision = false;

  enemies.each( function(d, i){
    // use Pythagorean theorem to calculate distance between  enemy and player
    enemy = d3.select(this);
    var eX = enemy.attr("cx");
    var eY = enemy.attr("cy");

    var mX = Math.pow(Math.abs(eX - pX),2);
    var mY = Math.pow(Math.abs(eY - pY),2);

    var distance = Math.sqrt(mX + mY);

    // if there is a hit, reset score, reset time, and compare high score
    if(distance < playerOptions.hitBox){
      gameStats.highScore = Math.max(gameStats.score, gameStats.highScore);
      hasCollision = true;
      gameStats.score = 0;
      gameStats.startTime = new Date();
    }
  });
  return hasCollision;
};

// calculate current score  and update score on page
var updateScore = function(){
  var now = new Date();
  // score is based on the difference the time the game started and now
  gameStats.score = Math.floor((now - gameStats.startTime )/ 100);

  d3.select("#score")
    .text(gameStats.score);

  d3.select("#highScore")
    .text(gameStats.highScore);
};

///////////////////////////////////////////////////////////////////////////////

makePlayer();
d3.selectAll(".player").call(drag);

update(enemies);

setInterval(function(){
  detectCollision();
  updateScore();
}, 100);