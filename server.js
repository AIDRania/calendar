var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();

var User = require('./src/user.js');
var Calendar = require('./src/calendar.js');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(session({
	secret: '23144',
	resave: false,
	saveUninitialized: true
}))

/******************** USER REQUEST ************************/

app.post('/createuser', (req,res,next) => {
	if(!req.session.user)
		return res.send({login: false, message: "You need to logIn"});
	var user = new User(req.body);
	user.create(function(response){
		res.send(response);
		next();
	});
});



app.post('/login', (req,res,next) => {
	if(req.session.user)
		return res.send({login: true, message: "You aready logIn"});
	console.log(req.body);
	var user = new User(req.body);
	console.log("LOGIN START");
	user.login(function(response){
		console.log(response);
		if(response.isExists){
			console.log("OK");
			req.session.user = response.user;
		}
		res.send(response);
	});
});

app.post('/logout', (req,res,next) => {
	if(!req.session.user)
		return res.send({logout: false, message: "You are not logIn"});
	req.session.destroy();
	return res.send({logout: true, message: "You are logOut"});
	
});


app.get('/getInfos', (req,res,next) => {
	if(!req.session.user)
		return res.send({login: false, message: "You need to logIn"});

	res.send("NOT Login");
	next();

});


/******************** Calendar REQUEST ************************/

app.post('/createCalendar', (req,res,next) => {

	if(!req.session.user)
		return res.send({login: false, message: "You need to logIn"});
	var calendar = new Calendar();
	var data = req.body;
	data.owner = req.session.user;
	console.log(data);
	calendar.create(data,function(response){
		res.send(response);
		next();
	});
});



app.post('/addEvent', (req,res,next) => {

	if(!req.session.user)
		return res.send({login: false, message: "You need to logIn"});
	var calendar = new Calendar();
	var dataEvent = req.body.data_event;
	var nameCalendar = req.body.name_calendar;
	dataEvent.author = req.session.user;
	console.log(dataEvent);
	calendar.addEvent(nameCalendar,dataEvent,function(response){
		res.send(response);
		next();
	});
});


app.post('/deleteEvent', (req,res,next) => {

	if(!req.session.user)
		return res.send({login: false, message: "You need to logIn"});
	var calendar = new Calendar();
	var id_event = req.body.id_event;
	var nameCalendar = req.body.name_calendar;
	calendar.deleteEvent(nameCalendar,id_event,function(response){
		res.send(response);
		next();
	});
});










//app.listen(3001, () => console.log('app listening on port 3001'))
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
