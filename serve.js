var restify = require('restify'),
    twitter = require('./twitter_update_with_media.js'),
    fs = require('fs'),
    parse = require('csv-parse'),
    request = require('request').defaults({encoding : null});

var twit = new twitter({
    consumer_key: process.env.consumerKey,
    consumer_secret: process.env.consumerSecret,
    token: process.env.token,
    token_secret: process.env.tokenSecret
});


var server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false }));

server.post('/data', function (req, res, next){
    var alpha = '';
    var beta = '';
    parse(req.body.data, {delimiter: ',', rowDelimiter: ' '}, function (err, data){
        for(var i = 0; i < data.length; i++){
            var alphaAdd = (Math.round(data[i][0] * 100) / 100);
            var betaAdd = (Math.round(data[i][1] * 100) / 100);
            if(i == data.length - 1){
                alpha += alphaAdd;
                beta += betaAdd;
            } else{
                alpha += alphaAdd + ',';
                beta += betaAdd + ',';
            }
        }
        console.log(process.env.consumerKey);
        request.post('https://chart.googleapis.com/chart', {form:{chds: 'a', chs: '780x300', chd:'t2:' + alpha + '|' + beta, cht: 'ls', chco: 'D93537,FFFDD1', chf: 'bg,s,272928'}},function(err, response, body){
            if(err){
                console.log(err);
                res.send(201, err);
            }
            console.log(body);
            var d = new Date();
            var curr_hour = d.getHours();
            var curr_min = d.getMinutes();
            var curr_sec = d.getSeconds();
            var curr_msec = d.getMilliseconds();
            twit.post(curr_hour + ":" + curr_min + ":" + curr_sec + ":" + curr_msec + ' PILOT ---* ' + req.body.username + ' *--- SCORE:' + req.body.score + ' CHKSUM:0x245423 PENDING...... APPROVED', body, function(err, response) {
                if (err) {
                    console.log(err);
                    res.send(201, err);
                } else {
                    res.send(201, response.body);
                }
            });
        });
    });
});


server.listen(process.env.PORT || 8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});

