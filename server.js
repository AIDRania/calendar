var express = require('express');
var base64Img = require('base64-img');
var bodyParser = require('body-parser');
var session = require('express-session');
var socket = require('socket.io');
var  mongoose =require("mongoose");
var app = express();

var localhost = true;
var DEFAULT_CALENDAR="home";

if(localhost)
	mongoose.connect('mongodb://localhost:27017/calendar', { autoIndex: true });
else
	mongoose.connect('mongodb://raid:Aidrania1994@ds111390.mlab.com:11390/calendar', { autoIndex: true });

var User = require('./src/user.js');
var Calendar = require('./src/calendar.js');


app.use(express.static('public'));
app.use('/uploads',express.static('uploads'));
app.use(bodyParser.json({limit: '20mb'}));
app.use(session({
	secret: '23144',
	resave: false,
	saveUninitialized: true
}))



var server;

if(localhost)
	server =  app.listen(3001, () => console.log('app listening on port 3001'))
else
	server = app.listen(process.env.PORT, function () {
	  console.log('Your app is listening on port ' + server.address().port);
	});

var io = socket(server);




/******************** USER REQUEST ************************/

app.post('/createuser', (req,res,next) => {
	if(req.session.user)
		return res.send({login: true, message: "You already logIn"});
	var type = "";
	var data = req.body;
	if( data.photoProfile == "images/menProfile.jpg" || data.photoProfile == "images/womenProfile.jpg")
		data.photoPath = data.photoProfile;
	else if(data.photoProfile.includes('data:image/jpg') || data.photoProfile.includes('data:image/jpeg'))
		data.photoPath = "uploads/"+data.email+".jpg";
	else if(data.photoProfile.includes('data:image/png'))
		data.photoPath = "uploads/"+data.email+".png";
	else return res.send({creation: false, message: "You need to upload jpg, jpeg or png file"});
	
	
	
	var user = new User(data);
	user.create(function(response){
		
		var base64Image = req.body.photoProfile;
		if( data.photoProfile == "images/menProfile.jpg" || data.photoProfile == "images/womenProfile.jpg")
			return res.send(response);
		base64Img.img(base64Image, "./uploads/", data.email, function(err, filepath) {
			if(err)
				response.message += " (photo doesn-t upload).";
			res.send(response);
			next();
		});
		
	});
});


app.get('/check_session', (req,res,next) => {
	if(req.session.user){
		var user = new User({email: req.session.user.email});
		user.getProfile(function(response){
		res.send({session: true,user: response.user, message: "session OK"});
	});
	}else
		res.send({session: false, message: "session KO"});
});


app.post('/login', (req,res,next) => {
	if(req.session.user)
		return res.send({login: true, message: "You aready logIn"});
	
	var user = new User(req.body);
	user.login(function(response){
		if(response.isExists){
			req.session.user = response.user;
		}
		res.send(response);
	});
});


app.post('/logout', (req,res,next) => {
	if(!req.session.user)
		return res.send({logout: false, message: "You are not logIn"});
	req.session.destroy();
    res.send({logout: true, message: "You are logOut"});
});


app.get('/getProfile', (req,res,next) => {
	if(!req.session.user)
		return res.send({login: false, message: "You need to logIn"});
	
	var user = new User({email: req.session.user.email});
	user.haveRight('ADMINISTRATION',function(have){
	if(!have && req.query.email != req.session.user.email )return res.send({isExists:false , message: "You dont have the right"});
		
		if(!req.query.email)
			return res.send({isExists: false, message: "You need to give the email"});			
		var user = new User({email: req.query.email});
		user.getProfile(function(response){
			res.send(response);
			next();
		});
	});
});


app.get('/getEmails', (req,res,next) => {
	if(!req.session.user)
		return res.send({login: false, message: "You need to logIn"});
	
	var user = new User({email: req.session.user.email});
	user.haveRight('ADMINISTRATION',function(have){
	if(!have)return res.send({isExists:false , message: "You dont have the right"});
		if(!req.query.email)
			return res.send({isExists: false, message: "You need to give the email"});

		var user = new User({email: req.query.email});
		user.getEmails(function(response){
			res.send(response);
			next();
		});
	});
});


app.post('/assignRights', (req,res,next) => {
	if(!req.session.user)
		return res.send({login: false, message: "You need to logIn"});
	var user = new User({email: req.session.user.email});
	user.haveRight('ADMINISTRATION',function(have){
		if(!have)return res.send({assign:false , message: "You dont have the right"});
		if(!req.body.email)
			return res.send({assign: false, message: "You need to give the email"});
		if(!req.body.rights && Array.isArray(req.body.rights))
			return res.send({assign: false, message: "You need to give the rights"});
		var user = new User(req.body);

		user.assignRights(function(response){
			res.send(response);
		});
	});
});


app.post('/removeRights', (req,res,next) => {
	if(!req.session.user)
		return res.send({login: false, message: "You need to logIn"});
	var user = new User({email: req.session.user.email});
	user.haveRight('ADMINISTRATION',function(have){
	if(!have)return res.send({remove:false , message: "You dont have the right"});
		if(!req.body.email)
			return res.send({remove: false, message: "You need to give the email"});
		if(!req.body.rights && Array.isArray(req.body.rights))
			return res.send({remove: false, message: "You need to give the rights"});
		var user = new User(req.body);

		user.removeRights(function(response){
			res.send(response);
		});
	});
});



/******************** Calendar REQUEST ************************/

app.get('/getCalendarsNames', (req,res,next) => {
	
	if(!req.query.name)
		return res.send({isExists: false, message: "You need to give the name"});

	var calendar = new Calendar();
	calendar.getCalendarsNames(req.query.name,function(response){
		res.send(response);
		next();
	});
});



app.post('/createCalendar', (req,res,next) => {

	if(!req.session.user)
		return res.send({login: false, message: "You need to logIn"});
	var user = new User({email: req.session.user.email});
	user.haveRight('ADMINISTRATION',function(have){
	if(!have)return res.send({creation:false , message: "You dont have the right"});	
		var calendar = new Calendar();
		var data = req.body;
		data.owner = req.session.user.email;
		calendar.create(data,function(response){
			if(response.creation)
				io.sockets.emit('Calendar',{action: 'CALENDAR_CREATE',name: data.name});
			res.send(response);
			next();
		});
	});
});



app.post('/deleteCalendar', (req,res,next) => {

	if(!req.session.user)
		return res.send({login: false, message: "You need to logIn"});
	var user = new User({email: req.session.user.email});
	user.haveRight('ADMINISTRATION',function(have){
	if(!have)return res.send({action:false , message: "You dont have the right"});	
		var calendar = new Calendar();
		var nameCalendar = req.body.name_calendar;
		if(nameCalendar == DEFAULT_CALENDAR) return res.send({action:false , message: "You can't delete a default calendar"});
		calendar.delete(nameCalendar,function(response){
			if(response.action)
				io.sockets.emit('Calendar',{action: 'CALENDAR_DELETE',name: nameCalendar});
			res.send(response);
			next();
		});
	});
});



app.post('/addEvent', (req,res,next) => {

	if(!req.session.user)
		return res.send({login: false, message: "You need to logIn"});
	
	var user = new User({email: req.session.user.email});
	user.haveRight('CREATION',function(have){
	if(!have)return res.send({creation:false , message: "You dont have the right"});
	
		var calendar = new Calendar();
		var dataEvent = req.body.data;
		var nameCalendar = req.body.name_calendar;
		dataEvent.author = req.session.user.email;
		calendar.addEvent(nameCalendar,dataEvent,function(response){
			if(response.creation)
				io.sockets.emit('Calendar',{action: 'EVENT_CREATE',name: nameCalendar});
			res.send(response);
			next();
		});
	});
});




app.post('/deleteEvent', (req,res,next) => {

	if(!req.session.user)
		return res.send({login: false, message: "You need to logIn"});

	var user = new User({email: req.session.user.email});
	user.haveRight('DELETION',function(have){
	if(!have)return res.send({action:false , message: "You dont have the right"});
	
	user.haveRight('ADMINISTRATION',function(haveAdmin){
		if(req.session.user.email!=req.body.author && !haveAdmin)
			return res.send({action:false , message: "You are not the author"});

		var calendar = new Calendar();
		var id_event = req.body.id_event;
		var nameCalendar = req.body.name_calendar;
		calendar.deleteEvent(nameCalendar,id_event,req.body.author,function(response){
			if(response.action)
				io.sockets.emit('Calendar',{action: 'EVENT_DELETE',name: nameCalendar});
			res.send(response);
			next();
		});
	});

	});
});


app.post('/updateEvent', (req,res,next) => {
	if(!req.session.user)
		return res.send({login: false, message: "You need to logIn"});
	
	var user = new User({email: req.session.user.email});
	user.haveRight('MODIFICATION',function(have){
	if(!have)return res.send({action:false , message: "You dont have the right"});
	
	user.haveRight('ADMINISTRATION',function(haveAdmin){

		const calendar = new Calendar();
		const id_event = req.body.id_event;
		const nameCalendar = req.body.name_calendar;
		const newData = req.body.data;
		if(req.session.user.email!=req.body.data.author && !haveAdmin)
			return res.send({action:false , message: "You are not the author"});

		calendar.updateEvent(nameCalendar,id_event,newData,function(response){
			if(response.action)
				io.sockets.emit('Calendar',{action: 'EVENT_UPDATE',name: nameCalendar});
			res.send(response);
			next();
		});
	});
	});
});

app.get('/getCalendar', (req,res,next) => {

	/*if(!req.session.user)
		return res.send({login: false, message: "You need to logIn"});*/
	var calendar = new Calendar();
	var nameCalendar = req.query.name;
	var startCalendar = req.query.start;
	var endCalendar = req.query.end;
	calendar.getCalendar(nameCalendar,startCalendar,endCalendar,function(response){
		res.send(response);
		next();
	});
});


app.get('/getCalendarInfos', (req,res,next) => {

	if(!req.session.user)
		return res.send({login: false, message: "You need to logIn"});
	var calendar = new Calendar();
	var nameCalendar = req.query.name;

	calendar.getCalendarInfos(nameCalendar,function(response){
		res.send(response);
		next();
	});
});


var c = new Calendar();
var inXmin = 15;
setInterval(function() {
	c.getEventsInXMin(inXmin,function(response){
		for(var d in response.data){
			//console.log(response.data[d].name);
			//console.log(response.data[d].events[0].title);
			//console.log(response.data[d].events[0].start);
			//console.log(response.data[d].events[0].end);
			io.sockets.emit('Calendar',{action: 'EVENT_REMEMBER',
										name: response.data[d].events[0].title,
										min: inXmin});
		}
	});
}, 1000);



