var commentsTable = {};

window.onload = function() {
	var resizeBar = $("#resizeBar");
	var news = $("#news");
	var view = $("#view");
	var stories_per_load = 20;
	var first_load_index = 0;
	var last_load_index = stories_per_load;
	var down = false;

	var topstories = [];

	resizeBar.mousedown( function (e) {
		down = true;
		$("#frameOverlay").css("z-index", 4);
		$("#wrapper").addClass("unselectable");
	});

	$(window).mouseup( function (e) {
		down = false;
		$("#frameOverlay").css("z-index", 0);
		$("#wrapper").removeClass("unselectable");
	});

	$(window).mousemove(function (e) {
		if(down)
		{
			resizeBar.css('margin-left', e.pageX);
			news.css('width', e.pageX);
			view.css('margin-left', e.pageX);
			view.css('width', window.innerWidth - e.pageX);
			$("#frameOverlay").css('margin-left', e.pageX);
			$("#frameOverlay").css('width', window.innerWidth - e.pageX);

			$("#exit-web-view").css('margin-left', e.pageX);

		}
	});

	$('a').click(function(){
		console.log("hello");
	});

	$('#refresh').click(function(){
		$("#stories").empty();
		first_load_index = 0;
		last_load_index = stories_per_load;
		getTopStories(function(stories){
			topstories = stories;
			getStories(topstories, first_load_index, last_load_index)
		})
	});

	$(window).scroll(function() {
	   if($(window).scrollTop() + $(window).height() == $(document).height()) {
	       first_load_index += stories_per_load;
	       last_load_index += stories_per_load;
	       getStories(topstories, first_load_index, last_load_index);
	   }
	});

	function getTopStories(callback){
		$.get( "https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty")
		.done(function( data ) { callback(data) })
	}

	function getStories(stories_list, start_index, end_index){
		stories = $("#stories");

		$.each(stories_list, function(index, value){
			if(index >= start_index && index <= end_index){
				$.get("https://hacker-news.firebaseio.com/v0/item/"+value+".json?print=pretty")
				.done(function (data){
					commentsTable[data.id] = data.kids;
					if(data.kids == undefined){ commentsTable[data.id] = []}
					var url = '"'+data.url+'"';
					stories.append("<div class='story' id='"+data.id+"'><div class='score'>"+data.score+"</div><div class='title'><a href="+url+" onClick='return clickStoryLink(event, "+url+")'>"+data.title+"</a></div><a class='comment-link' href='#' onClick='getComments("+data.id+", 0); return false;' >comments ["+commentsTable[data.id].length+"]</a><div id='"+data.id+"-comments' style='display:none;'></div></div>");
				})
			}
		})
	}

	getTopStories(function(stories){ 
		topstories = stories;
		getStories(topstories, first_load_index, last_load_index)
	})
}

function clickStoryLink(event, url){
	event.preventDefault()
	if(event.metaKey)
	{
		window.open(url,'_blank');
	} 
	else
	{
		loadPageInWebView(url);
	}

	return false;
}

function loadPageInWebView(url){
	$("#view").show();
	$("#view").attr('src', url);
	$("#exit-web-view").css('display', 'block');
}

function closePageView(){
	$("#view").attr('src', '');
	$("#exit-web-view").css('display', 'none');
}	


function getComments(id, commentLevel){
	rawID = id;
	id = "#"+String(id);

	parent = $(id)
	comments = $(id+"-comments");

	if(comments.css('display') === 'none')
	{
		comments.css('display', 'block');
		if(commentsTable[rawID].length > 0)
		{
			$.each(commentsTable[rawID], function(index, value){
				$.get("https://hacker-news.firebaseio.com/v0/item/"+value+".json?print=pretty").done(function(data){
					commentsTable[data.id] = data.kids;
					if(data.kids == undefined){ commentsTable[data.id] = []}
						comments.append("<div class='comment-level-"+commentLevel+" comment' id='comment-"+value+"'><div class='author'>"+data.by+"</div><div class='text'>"+data.text+"</div><a href='#' class='comment-link' onClick='getComments("+data.id+","+(commentLevel+1)+"); return false;'>sub comments ["+commentsTable[data.id].length+"]</a></div><div id='"+data.id+"-comments' style='display:none;'></div>");
				});				
			});

			commentsTable[rawID] = [];
		}
	}
	else
	{
		comments.css('display', 'none');
	}
}