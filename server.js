var key = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtYXJjb3NjaGVjYTFAaG90bWFpbC5jb20iLCJqdGkiOiI0YTIyOTQ4OC1mMDJjLTQ2MDAtYTNkZC05YmIwZDE0ODQ2ZjMiLCJpc3MiOiJBRU1FVCIsImlhdCI6MTU1OTMzMzkyMiwidXNlcklkIjoiNGEyMjk0ODgtZjAyYy00NjAwLWEzZGQtOWJiMGQxNDg0NmYzIiwicm9sZSI6IiJ9.7j5HlUArCxOGxfcClK1G84SY9x3G2jXOCviLZsMTW4w';
var request = require("request");
var request2 = require("request");
var Twit = require('twit');
var cron = require('node-schedule');
var fs = require('fs');
var una=false;

// Config
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

// Fin Config

//Main

peticion();
setInterval(peticion,1000*60*60*12);

var stream = T.stream('statuses/filter', { track: ['@LluviaMurcia'] });
stream.on('tweet', responder);

//Fin Main

//Funciones

function responder(tweet) {

    // Who sent the tweet?
    var name = tweet.user.screen_name;
    // What is the text?
     var txt = tweet.text;
    // the status update or tweet ID in which we will reply
    var nameID  = tweet.id_str;

     // Get rid of the @ mention
    // var txt = txt.replace(/@myTwitterHandle/g, "");

    // Start a reply back to the sender
    if(txt.includes("rio") || txt.includes("río")){
      var reply = "El rio? @" + name + ' ' + 'https://www.youtube.com/watch?v=FZlQ9oFnq08';
    }
  else if(txt.includes("lloviendo")){
      var myMessage = "Dices que está lloviendo @"+name+' ?'; // your message

      // access and assign a random image in the images folder
      var b64content = fs.readFileSync('./images/cuarto.jpg', { encoding: 'base64' })

      // first we must post the media to Twitter then the alt text
      T.post('media/upload', { media_data: b64content }, function (err, data, response) {

        var mediaIdStr = data.media_id_string;
        var altText = "Lluvia en murcia es un misterio (Iker Jimenez)";
        var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

        T.post('media/metadata/create', meta_params, function (err, data, response) {
          if (!err) {
            // now we can reference the media and post a tweet (media will attach to the tweet)
            var params = { status: myMessage, media_ids: [mediaIdStr] }

            T.post('statuses/update', params, function (err, data , response) {
              // check the response in the console
              console.log(data)
            })
          }
        })
      })
    }
    else{
      var reply = "Hola! @" + name + ' ' + 'Gracias por la mención';
    }
    var params             = {
                              status: reply,
                              in_reply_to_status_id: nameID
                             };

    T.post('statuses/update', params, function(err, data, response) {
      if (err !== undefined) {
        console.log(err);
      } else {
        console.log('Tweeted: ' + params.status);
      }
    })
};

function tweetea(prob){
  //console.log(prob);
  var no = ["Como va a llover en Murcia Acho!","Acho, hoy tampoco llueve","Curiosamente hoy tampoco va a llover","Hoy tampoco llueve en Murcia", "Otro dia que no llueve en Murcia", "Hoy tampoco", "Parece que hoy no va a llover", "Que raro que hoy no llueva", "Hoy no va a llover", "Hoy no llueve en Murcia", "Ni una gota va a caer hoy"];
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
