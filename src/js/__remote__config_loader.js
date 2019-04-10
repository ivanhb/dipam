$.ajax({
   url:"http://ivanhb.github.io/vwbata/config.json",
   dataType: 'jsonp', // Notice! JSONP <-- P (lowercase)
   async: false,
   success:function(json){
       // do stuff with json (in this case an array)
       alert("Success");
   },
   error:function(){
       alert("Error");
   }
});
