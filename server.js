var key = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtYXJjb3NjaGVjYTFAaG90bWFpbC5jb20iLCJqdGkiOiI0YTIyOTQ4OC1mMDJjLTQ2MDAtYTNkZC05YmIwZDE0ODQ2ZjMiLCJpc3MiOiJBRU1FVCIsImlhdCI6MTU1OTMzMzkyMiwidXNlcklkIjoiNGEyMjk0ODgtZjAyYy00NjAwLWEzZGQtOWJiMGQxNDg0NmYzIiwicm9sZSI6IiJ9.7j5HlUArCxOGxfcClK1G84SY9x3G2jXOCviLZsMTW4w';
var request = require("request");
var request2 = require("request");
var Twit = require('twit');
var cron = require('node-schedule');
var una=false;


var url2;
var options = { method: 'GET',
  url: 'https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/30030', //MURCIA
  qs: { 'api_key': key },
  headers:
   { 'cache-control': 'no-cache' } };

var T = new Twit({
     consumer_key:         'eIP57hfxIS3TKdd3bG9maHKJu',
     consumer_secret:      'K0s871nQoSl7uIbg1X1FupR49oRZC3YcHq4QBW7M8WO3xzHuza',
     access_token:         '703668132536328192-8fvP8g5cmv2d0n8r9DSmtTvhPJJOpiO',
     access_token_secret:  'ovNjIagSi1oOSghDLal7RwkbMaVOJnUv9ArbwNCoIy307',
     timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
     strictSSL:            true,     // optional - requires SSL certificates to be valid.
})


T.post('statuses/update', { status: "Prueba de Heroku" }, function(err, data, response) {
        console.log(data);
    });

var rule = new cron.RecurrenceRule();
rule.hour = 14;
cron.scheduleJob(rule, function(){
  if(!una){
    console.log('Son las 2, la hora de la lluvia');
    peticion();
    una=true;
  }
});

var reset = new cron.RecurrenceRule();
reset.hour = 15;
cron.scheduleJob(reset, function(){
    una=false;
});

function tweetea(prob){
  //console.log(prob);
  var no = ["Curiosamente hoy tampoco va a llover","Hoy tampoco llueve en Murcia", "Otro dia que no llueve en Murcia", "Hoy tampoco", "Parece que hoy no va a llover", "Que raro que hoy no llueva", "Hoy no va a llover", "Hoy no llueve en Murcia", "Ni una gota va a caer hoy"];
  var puede = ["Hoy puede que llueva!", "Parece que hoy va a llover"];
  var si = ["HOY LLUEVE EN MURCIA!", "HOY SI QUE LLUEVE", "POR FIN LLUEVE!"];


  if(prob<10){
    let rand = Math.floor(Math.random()*no.length);
    console.log(rand);
    console.log(no[rand]);
    T.post('statuses/update', { status: no[rand] }, function(err, data, response) {
        console.log(data);
    });
  }

  else if(prob>=10 && prob <50){
    let rand = Math.floor(Math.random()*puede.length);
    console.log(rand);
    T.post('statuses/update', { status: puede[rand] }, function(err, data, response) {
        console.log(data);
    });
  }

  else{
    let rand = Math.floor(Math.random()*si.length);
    console.log(rand);
    T.post('statuses/update', { status: si[rand] }, function(err, data, response) {
        console.log(data);
    });
  }

}

async function peticion(){

    await request(options, function (error, response, body) {
      if (error) throw new Error(error);
      var datos = JSON.parse(body);
      var pathname=datos.datos;
      url2=datos.datos;
      //console.log(url2);


      var options2 = { method: 'GET',
        url: url2
      };
         request2(options2, function (error2, response2, body2) {
            if (error2) throw new Error(error2);
            var datos2 = JSON.parse(body2);
            var prob= datos2[0].prediccion.dia[0].probPrecipitacion[0].value;
            //console.log(prob);
            tweetea(prob);
         });

    });

}
