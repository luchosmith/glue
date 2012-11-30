$('document').ready(function(){
  
  // Model
  Media = Backbone.Model.extend({
    
    idAttribute:'object_key',
    
    defaults: {
        object_key : '',
        title : '',
        score : '',
        image_url : '',
        type : 'object'
    },

    initialize: function() {
        console.log('initializing media object: ' + this.get("title"));
    }
      
  });
  
  
  // Collections  
  Results = Backbone.Collection.extend({
    model: Media,
    initialize: function (models, options) {
      this.bind("add", options.view.addResultEl);
    }
  });
  
  Watchlist = Backbone.Collection.extend({
    model: Media,
    localStorage: new Store("watchlist"),
    initialize: function (models, options) {
      this.bind("add", options.view.addWatchlistEl);
    }
  });
  
  
  // View 
  AppView = Backbone.View.extend({
    
    el: $("body"),
    
    initialize: function () {
      this.results = new Results( null, { view: this });
      this.watchlist = new Watchlist( null, { view: this });
    },
    
    addResultEl: function (model) {
      $("#resultslist").append('<li id="' + model.get("object_key") + '"><img src="' + model.get("image_url") + '" alt=""/>' +
                                 '<div class="data">' +
                                     '<div class="title">' + model.get("title") + '</div>' +
                                     '<div class="score">score: ' + model.get("score") + '</div>' +
                                     '<div class="type">type: ' + model.get("type") + '</div>' +
                                  '</div>' +
                                  '<div class="controls">' +
						                        '<a href="#" class="like"></a>' +
					                        '</div>' +
                               '</li>');
    },
    
    addWatchlistEl: function (model) {
      //console.log("adding to watchlist");
      $("#watchlist .placeholder").remove();
      $("#watchlist").append('<li id="' + model.get("object_key") + '"><img src="' + model.get("image_url") + '" alt=""/>' +
                                 '<div class="data">' +
                                     '<div class="title">' + model.get("title") + '</div>' +
                                     '<div class="score">score: ' + model.get("score") + '</div>' +
                                     '<div class="type">type: ' + model.get("type") + '</div>' +
                                  '</div>' +
                                  '<div class="controls">' +
						                        '<a href="#" class="delete"></a>' +
					                        '</div>' +
                               '</li>');
    }
    // TODO: refactor these HTML builders into function or proper template 
    
  });
  

  
    // Search
  $('.search form').on("submit", function(e){
    e.preventDefault();
    
    var q = $('[name="query"]').val();
    if( !q ) {
      alert('enter a search term');
    } else {
      var url = "http://search.guide.getglue.com/objects?q=" + q;
      $.ajax(url,{
          success: function(data, status, xhr){
            parseSearchResults(data);
          },
          error: function(xhr, status, error){
            alert("an error occurred with the xhr request: " + error);
          }
      });
    }
  });
  
  
  // Create objects from search results
  function parseSearchResults(data){
    
    $("#resultslist").html("");
    
    $.each(data, function(i,x){

      var media = new Media({
        object_key : x.object_key,
        title : x.title,
        score : Math.round(x.score),
        image_url : x.image_url,
        type : x.object_key.split("/")[0].replace("_", " ")
      });
      appview.results.add(media);
    });
  }
  
  
  // Add to watchlist
  $("#resultslist").on("click .like", function(e){
    e.preventDefault();
    $(e.target).addClass("liked");
    var itemId = $(e.target).parents("li").attr("id");
    var item = appview.results.get(itemId).clone();
    appview.watchlist.add(item);
    item.save();
  });
  
  // Delete from watchlist
  $("#watchlist").on("click .delete", function(e){
    e.preventDefault();
    var itemId = $(e.target).parents("li").attr("id");
    var item = appview.watchlist.get(itemId);
    var title = item.get("title");
    if ( confirm("Are you sure you want to delete " + title) ) {
      item.destroy();
      $(e.target).parents("li").remove();
    }
  });
  
  
  // Sortable
  $("#watchlist").sortable({
    stop: function( event, ui ) {
      var itemId = event.srcElement.id;
      var itemIndex = $(event.srcElement).index() + 1;
      var item = appview.watchlist.get(itemId);
      appview.watchlist.remove(itemId);
      appview.watchlist.add(item,{at:itemIndex});
      item.save();
      // TODO: why isn't this working properly?
    }
  });
  $("#watchlist").disableSelection();
  
  
    // kickoff the app
  var appview = new AppView;

  // load any stored elements
  appview.watchlist.fetch({add:true});
  
  
});

