
// Set the team using the botton
$( ".team-select" ).click(function() {
  $("#team-name").text($(this).text());
  loadSeason();

});

// Set the season using the botton
$( ".season-select" ).click(function() {
  $("#season-name").text($(this).text());
  alert(seasonData[0].for.number)
});

// Set the season using the botton
$( ".game-select" ).click(function() {
  $("#game-name").text($(this).text());
  loadSeason();
});

var seasonData = null;
loadSeason();

// For sorting the games
function compareGames(a,b) {
  if (a.for.number < b.for.number)
    return -1;
  if (a.for.number> b.for.number)
    return 1;
  return 0;
}

function loadSeason(){
  var team = $("#team-name").text();
  var season = $("#season-name").text();
  var game = $("#game-name").text();

  // Set the .json file name
  var file = "puck/data/seasonData_" + season
                + "_" + team + "_" + game + ".json";

  $.getJSON(file, function(data) {

    // assign and sort
    seasonData = data.sort(compareGames);

    //sort the data
    drawSeasonGraph(seasonData);
  });
}

function drawSeasonGraph(data){

  $( "#season-graph" ).empty();
  // Set the size of the chart
  var margin = {top: 20, right: 20, bottom: 30, left: 50};
  var width = $( '#season-graph' ).width() - margin.left - margin.right;
  var height = $( '#season-graph' ).height() - margin.top - margin.bottom;

  // set the ranges
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  // set up the main line
  var pointsLine = d3.line()
    .x(function(d) { return x(d.for.number); })
    .y(function(d) { return y(d.for.ss.after.points.total); });


  var hPlayoffLine = d3.line()
    .x(function(d) { return x(d.for.number); })
    .y(function(d) { return y(d.for.ss.after.homepace.points); });

  var rPlayoffLine = d3.line()
      .x(function(d) { return x(d.for.number); })
      .y(function(d) { return y(d.for.ss.after.roadpace.points); });

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select("#season-graph").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    // Scale the range of the data
    x.domain([0, 82]);
    y.domain([0, 140]);

    // Add the valueline path.
    svg.append("path")
      .data([data])
      .attr("class", "line rp")
      .attr("d", rPlayoffLine);

    // Add the valueline path.
    svg.append("path")
      .data([data])
      .attr("class", "line hp")
      .attr("d", hPlayoffLine);

    // Add the valueline path.
    svg.append("path")
      .data([data])
      .attr("class", "line points")
      .attr("d", pointsLine);

    //Add projections if not at data 82
    var lastGame = data.length

    if(lastGame < 82){
      var currentPoints = data[lastGame-1].for.ss.after.points.total;
      var projectedPoints = currentPoints +
        (data[lastGame-1].for.ss.after.points.avg * (82 - lastGame));

      svg.append("line")
        .attr("class", "line points")
        .style("stroke-dasharray", "1,2")
        .attr("x1", x(lastGame))
        .attr("y1", y(currentPoints))
        .attr("x2", x(82))
        .attr("y2", y(projectedPoints));

      var homePacePoints = data[lastGame-1].for.ss.after.homepace.points;
      var homePaceProjected = homePacePoints +
        (data[lastGame-1].for.ss.after.homepace.avg * (82 - lastGame));

      svg.append("line")
        .attr("class", "line hp")
        .style("stroke-dasharray", "1,2")
        .attr("x1", x(lastGame))
        .attr("y1", y(homePacePoints))
        .attr("x2", x(82))
        .attr("y2", y(homePaceProjected));

      var roadPacePoints = data[lastGame-1].for.ss.after.roadpace.points;
      var roadPaceProjected = roadPacePoints +
        (data[lastGame-1].for.ss.after.roadpace.avg * (82 - lastGame));

      svg.append("line")
        .attr("class", "line rp")
        .style("stroke-dasharray", "1,2")
        .attr("x1", x(lastGame))
        .attr("y1", y(roadPacePoints))
        .attr("x2", x(82))
        .attr("y2", y(roadPaceProjected));

      var lowestPoints = 0;
      var miss = '(IN)';
      if(projectedPoints < homePaceProjected && projectedPoints < roadPaceProjected ){
        lowestPoints = projectedPoints;
        miss = '(MISS)';
      }
      else if (homePaceProjected < projectedPoints && homePaceProjected < roadPaceProjected) {
        lowestPoints = homePaceProjected;
      }
      else{
        lowestPoints = roadPaceProjected;
      }

      svg.append("text")
          .text('Projected')
          .attr("x", x(82)-50)
          .attr("y", y(lowestPoints)+40);
      svg.append("text")
          .attr("class", "handle-points")
          .text('Pts: ' + Math.round(projectedPoints))
          .attr("x", x(82)-50)
          .attr("y", y(lowestPoints)+55);
      svg.append("text")
          .attr("class", "handle-home-pace")
          .text('HP: ' + Math.round(homePaceProjected))
          .attr("x", x(82)-50)
          .attr("y", y(lowestPoints)+70);
      svg.append("text")
          .attr("class", "handle-road-pace")
          .text('RP: ' + Math.round(roadPaceProjected))
          .attr("x", x(82)-50)
          .attr("y", y(lowestPoints)+85);
    }

    // Add the X Axis
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "axis")
      .call(d3.axisBottom(x));

    // Add the Y Axis
    svg.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y));

    var slider = svg.append("g")
      .attr("class", "slider")
      .attr("transform", "translate(0," + (height+1) + ")")

    slider.append("line")
      .attr("class", "track")
      .attr("x1", x(0))
      .attr("x2", x(82))
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-inset")
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-overlay")
      .call(d3.drag()
          .on("start.interrupt", function() { slider.interrupt(); })
          .on("start drag", function() { slide(x.invert(d3.event.x)); }));


    var handleLine = slider.insert("line",".track-overlay")
      .attr("class", "handle-line")
      .style("stroke-dasharray", "2,2")
      .attr("y1", 0)
      .attr("y2", -height)
      .attr("x1", x(1))
      .attr("x2", x(1))
      .attr('stroke', 'black')


    var handleCirc = slider.insert("circle", ".track-overlay")
      .attr("class", "handle-circ")
      .attr("cx", x(1))
      .attr("r", 3);

    var handleHomePace = slider.insert("circle", ".track-overlay")
        .attr("class", "handle-home-pace")
        .attr("cx", x(1))
        .attr("r", 4);

    var handleRoadPace = slider.insert("circle", ".track-overlay")
        .attr("class", "handle-road-pace")
        .attr("cx", x(1))
        .attr("r", 4);

    var handlePoints = slider.insert("circle", ".track-overlay")
        .attr("class", "handle-points")
        .attr("cx", x(1))
        .attr("r", 4);

    var handlePointsText= slider.insert("text", ".track-overlay")
        .attr("class", "handle-points")
        .text("");

    var handleHPText= slider.insert("text", ".track-overlay")
        .attr("class", "handle-home-pace")
        .text("");

    var handleRPText= slider.insert("text", ".track-overlay")
        .attr("class", "handle-road-pace")
        .text("");

    var handleGameText= slider.insert("text", ".track-overlay")
        .attr("class", "handle-game-text")
        .text("");

    var maxLength = seasonData.length;
    slider.transition() // Gratuitous intro!
        .duration(750)
        .tween("slide", function() {
          var i = d3.interpolate(1, maxLength);
          return function(t) { slide(i(t)); };
        });

  function slide(p) {

      var maxLength = seasonData.length;
      if(p < 1){
        p = 1;
      }
      if(p > maxLength){
        p = maxLength;
      }

      p = Math.round(p)
      var points = seasonData[p-1].for.ss.after.points.total;
      var pointsForHome = seasonData[p-1].for.ss.after.homepace.points;
      var pointsforRoad = seasonData[p-1].for.ss.after.roadpace.points;

      handleCirc.attr("cx", x(p))
      handlePoints.attr('cx', x(p))
      handlePoints.attr('cy', y(points)-height)

      handleHomePace.attr('cx', x(p))
      handleHomePace.attr('cy', y(pointsForHome)-height)

      handleRoadPace.attr('cx', x(p))
      handleRoadPace.attr('cy', y(pointsforRoad)-height)

      handleLine.attr("x1", x(p))
      handleLine.attr("x2", x(p))

      var most = points;

      if(pointsForHome > most){
        most = pointsForHome;
      }

      handlePointsText.text("Pts:" + points);
      handleHPText.text("HP:" + pointsForHome);
      handleRPText.text("RP:" + pointsforRoad);
      handleGameText.text("Gm:" + p);

      if(p<42){
        handleGameText.attr('x', x(p)+10)
        handlePointsText.attr('x', x(p)+10)
        handleHPText.attr('x', x(p)+10)
        handleRPText.attr('x', x(p)+10)
        handleGameText.attr('y', y(most)-height - 70)
        handlePointsText.attr('y', y(most)-height - 55)
        handleHPText.attr('y', y(most)-height - 40)
        handleRPText.attr('y', y(most)-height - 25)

      }
      else{
        handleGameText.attr('x', x(p)-50)
        handlePointsText.attr('x', x(p)-50)
        handleHPText.attr('x', x(p)-50)
        handleRPText.attr('x', x(p)-50)
        handleGameText.attr('y', y(most)-height - 50)
        handlePointsText.attr('y', y(most)-height - 35)
        handleHPText.attr('y', y(most)-height - 20)
        handleRPText.attr('y', y(most)-height - 5)
      }


      var sd = seasonData[p-1]

      // The points
      $( '#points-total' ).text(sd.for.ss.after.points.total);
      $( '#points-avg' ).text(sd.for.ss.after.points.avg.toFixed(2));

      $( '#points-lr' ).text(sd.for.ss.after.standings.ovr);
      assignRankColor(sd.for.ss.after.standings.ovr,'#points-lr','l');

      $( '#points-cr' ).text(sd.for.ss.after.standings.conf);
      assignRankColor(sd.for.ss.after.standings.conf,'#points-cr','c');

      $( '#points-dr' ).text(sd.for.ss.after.standings.div);
      assignRankColor(sd.for.ss.after.standings.div,'#points-dr','d');

      $( '#wins-total' ).text(sd.for.ss.after.wins.total);
      $( '#wins-avg' ).text(sd.for.ss.after.wins.avg.toFixed(2));
      $( '#wins-lr' ).text(sd.for.ss.after.wins.lr);
      assignRankColor(sd.for.ss.after.wins.lr,'#wins-lr','l');

      $( '#wins-cr' ).text(sd.for.ss.after.wins.cr);
      assignRankColor(sd.for.ss.after.wins.cr,'#wins-cr','c');

      $( '#wins-dr' ).text(sd.for.ss.after.wins.dr);
      assignRankColor(sd.for.ss.after.wins.dr,'#wins-dr','d');


      $( '#gd-total' ).text(sd.for.ss.after.goals.dif.total);
      $( '#gd-avg' ).text(sd.for.ss.after.goals.dif.avg.toFixed(2));
      $( '#gd-lr' ).text(sd.for.ss.after.goals.dif.lr);
      assignRankColor(sd.for.ss.after.goals.dif.lr,'#gd-lr','l');

      $( '#gd-cr' ).text(sd.for.ss.after.goals.dif.cr);
      assignRankColor(sd.for.ss.after.goals.dif.cr,'#gd-cr','c');

      $( '#gd-dr' ).text(sd.for.ss.after.goals.dif.dr);
      assignRankColor(sd.for.ss.after.goals.dif.dr,'#gd-dr','d');

      $( '#gf-total' ).text(sd.for.ss.after.goals.for.total);
      $( '#gf-avg' ).text(sd.for.ss.after.goals.for.avg.toFixed(2));
      $( '#gf-lr' ).text(sd.for.ss.after.goals.for.lr);
      assignRankColor(sd.for.ss.after.goals.for.lr,'#gf-lr','l');

      $( '#gf-cr' ).text(sd.for.ss.after.goals.for.cr);
      assignRankColor(sd.for.ss.after.goals.for.cr,'#gf-cr','c');

      $( '#gf-dr' ).text(sd.for.ss.after.goals.for.dr);
      assignRankColor(sd.for.ss.after.goals.for.dr,'#gf-dr','d');

      $( '#ga-total' ).text(sd.for.ss.after.goals.against.total);
      $( '#ga-avg' ).text(sd.for.ss.after.goals.against.avg.toFixed(2));
      $( '#ga-lr' ).text(sd.for.ss.after.goals.against.lr);
      assignRankColor(sd.for.ss.after.goals.against.lr,'#ga-lr','l');

      $( '#ga-cr' ).text(sd.for.ss.after.goals.against.cr);
      assignRankColor(sd.for.ss.after.goals.against.cr,'#ga-cr','c');

      $( '#ga-dr' ).text(sd.for.ss.after.goals.against.dr);
      assignRankColor(sd.for.ss.after.goals.against.dr,'#ga-dr','d');

      $( '#sv-avg' ).text(sd.for.ss.after.svPct.avg.toFixed(2));
      $( '#sv-lr' ).text(sd.for.ss.after.svPct.lr);
      assignRankColor(sd.for.ss.after.svPct.lr,'#sv-lr','l');

      $( '#sv-cr' ).text(sd.for.ss.after.svPct.cr);
      assignRankColor(sd.for.ss.after.svPct.cr,'#sv-cr','c');

      $( '#sv-dr' ).text(sd.for.ss.after.svPct.dr);
      assignRankColor(sd.for.ss.after.svPct.dr,'#sv-dr','d');

      $( '#sh-avg' ).text(sd.for.ss.after.shtPct.avg.toFixed(2));
      $( '#sh-lr' ).text(sd.for.ss.after.shtPct.lr);
      assignRankColor(sd.for.ss.after.shtPct.lr,'#sh-lr','l');

      $( '#sh-cr' ).text(sd.for.ss.after.shtPct.cr);
      assignRankColor(sd.for.ss.after.shtPct.cr,'#sh-cr','c');

      $( '#sh-dr' ).text(sd.for.ss.after.shtPct.dr);
      assignRankColor(sd.for.ss.after.shtPct.dr,'#sh-dr','d');

      $( '#c5v5c-avg' ).text(sd.for.ss.after.c5v5c.avg.toFixed(2));
      $( '#c5v5c-lr' ).text(sd.for.ss.after.c5v5c.lr);
      assignRankColor(sd.for.ss.after.c5v5c.lr,'#c5v5c-lr','l');

      $( '#c5v5c-cr' ).text(sd.for.ss.after.c5v5c.cr);
      assignRankColor(sd.for.ss.after.c5v5c.cr,'#c5v5c-cr','c');

      $( '#c5v5c-dr' ).text(sd.for.ss.after.c5v5c.dr);
      assignRankColor(sd.for.ss.after.c5v5c.dr,'#c5v5c-dr','d');
    }
}

function summaryText(){
  var html = `hi`;

  return html
}

function assignRankColor(val,div,type){
  $(div).removeClass();

  if(type == 'l'){
    if(val <= 5){
      $(div).addClass('top');
    }
    if(val > 25){
      $(div).addClass('bottom');
    }
  }
  if(type == 'c'){
    if(val <= 3){
      $(div).addClass('top');
    }
    if(val > 11){
      $(div).addClass('bottom');
    }
  }
  if(type == 'd'){
    if(val <= 1){
      $(div).addClass('top');
    }
    if(val > 6){
      $(div).addClass('bottom');
    }
  }
}
