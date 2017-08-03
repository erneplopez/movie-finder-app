var express=require("express");
var app=express();
var request=require("request");
var async=require("async");
app.set("view engine","ejs");
app.use(express.static("public"));



app.get("/",function(req,res){
    var asyncTasks=[];
    var asyncVerboseTasks=[];
    var movieVerbose=[];
    var movies=[];
    
    if(req.query.search==undefined)
    {
         return res.render("home-empty");
    }
    
    asyncTasks.push(
        function(callback){
            request("http://www.omdbapi.com/?s="+req.query.search+"&apikey=thewdb",function(error,response,body){
                if(!error && response.statusCode==200){
                    movies=JSON.parse(body).Search;
                }
                callback();
            })
        })
    async.series(asyncTasks,function(){
        movies.forEach(function(movie){
            asyncVerboseTasks.push(
                        function(callback){
                                request("http://www.omdbapi.com/?i="+movie.imdbID+"&apikey=thewdb",function(errorVerbose,responseVerbose,bodyVerbose){  /*All the requests are executed before the callback function is called for the firstt time*/
                                    if(!errorVerbose && responseVerbose.statusCode==200){
                                        if(movie.Poster=="N/A"){
                                            movie.Poster="http://www.tea-tron.com/antorodriguez/blog/wp-content/uploads/2016/04/image-not-found-4a963b95bf081c3ea02923dceaeb3f8085e1a654fc54840aac61a57a60903fef-584x276.png";
                                        }
                                        movieVerbose.push({title:movie.Title,
                                            year:movie.Year,
                                            actors:JSON.parse(bodyVerbose).Actors,
                                            genre:JSON.parse(bodyVerbose).Genre,
                                            plot:JSON.parse(bodyVerbose).Plot,
                                            poster:movie.Poster
                                        });
                                    }
                                    callback();
                                }); 
            
            });
        });
        async.series(asyncVerboseTasks,function(){
        return res.render("home",{movieVerbose:movieVerbose});
        });    
    });
}); 
   
  

app.listen(3000,"127.0.0.1",function() {

});