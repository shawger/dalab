
// Handler for search button
$( "#search-btn" ).click(function() {

  var currentPath = window.location.pathname;

  // Check to see if we are on a search page already
  if (currentPath.slice(0,7) == "/search"){
    var query = "/rawsearch" + "?" + $("#search-box").val();
    var url = "/search" + "?" + $("#search-box").val();
    $.get(query, function(data, status){
      $("#search-results").html(data);
    });
    history.pushState(null, null, url);
  }
  else{
    var query = "/search" + "?" + $("#search-box").val();
    window.location = decodeURIComponent(query);
  }
});

$("#search-box").on('change keyup paste', function() {

  var currentPath = window.location.pathname;

  // Check to see if we are on a search page already
  if (currentPath.slice(0,7) == "/search"){

    var query = "/rawsearch" + "?" + $("#search-box").val();
    var url = "/search" + "?" + $("#search-box").val();
    $.get(query, function(data, status){
      $("#search-results").html(data);
    });
    history.pushState(null, null, url);
  }
});
