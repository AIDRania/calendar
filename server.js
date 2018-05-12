var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();

var User = require('./src/user.js');
var Calendar = require('./src/calendar.js');
var sendMail = require('./src/mail.js');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(session({
	secret: '23144',
	resave: false,
	saveUninitialized: true
}))

/******************** USER REQUEST ************************/

app.post('/createuser', (req,res,next) => {
	if(req.session.user)
		return res.send({login: true, message: "You already logIn"});

	var user = new User(req.body);
	user.create(function(response){
		res.send(response);
		next();
	});
});


app.get('/check_session', (req,res,next) => {
	if(req.session.user){
		var user = new User({email: req.session.user.email});
		user.getMyRights(function(response){
		res.send({session: true,user: response, message: "session OK"});
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
			console.log(req.session.user);
		}
		res.send(response);
	});
});

app.get('/remember_password', (req,res,next) => {
	if(req.session.user)
		return res.send({login: true, message: "You aready logIn"});
	
	var user = new User({email: req.query.email});
	user.getPassword(function(response){
		if(response.isExists){
			sendMail(response.user.emai,response.user.password,function(resp){
				res.send(resp);
			});
		}else
			return res.send({sent: false, message: response.message});
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
			return res.send({assign: false, message: "You need to give the email"});			
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
	user.haveRight('CREATION',function(have){
		if(!have)return res.send({assign:false , message: "You dont have the right"});
		if(!req.body.email)
			return res.send({assign: false, message: "You need to give the email"});
		if(!req.body.rights && Array.isArray(req.body.rights))
			return res.send({assign: false, message: "You need to give the rights"});
		console.log(req.body.rights);
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

app.post('/createCalendar', (req,res,next) => {

	if(!req.session.user)
		return res.send({login: false, message: "You need to logIn"});
	var user = new User({email: req.session.user.email});
	user.haveRight('ADMINISTRATION',function(have){
	if(!have)return res.send({remove:false , message: "You dont have the right"});	
		var calendar = new Calendar();
		var data = req.body;
		data.owner = req.session.user.email;
		console.log(data);
		calendar.create(data,function(response){
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
	if(!have)return res.send({remove:false , message: "You dont have the right"});
	
		var calendar = new Calendar();
		var id_event = req.body.id_event;
		var nameCalendar = req.body.name_calendar;
		calendar.deleteEvent(nameCalendar,id_event,function(response){
			res.send(response);
			next();
		});
	});
});


app.post('/updateEvent', (req,res,next) => {
	if(!req.session.user)
		return res.send({login: false, message: "You need to logIn"});
	
	var user = new User({email: req.session.user.email});
	user.haveRight('MODIFICATION',function(have){
	if(!have)return res.send({remove:false , message: "You dont have the right"});
	
		const calendar = new Calendar();
		const id_event = req.body.id_event;
		const nameCalendar = req.body.name_calendar;
		const newData = req.body.data;
		

		calendar.updateEvent(nameCalendar,id_event,newData,function(response){
			res.send(response);
			next();
		});
	});
});


app.get('/getCalendarsNames', (req,res,next) => {

	/*if(!req.session.user)
		return res.send({login: false, message: "You need to logIn"});
	console.log(req.params.name);
	var calendar = new Calendar();
	var nameCalendar = req.params.name;
	calendar.getCalendar(nameCalendar,function(response){
		res.send(response);
		next();
	});*/
});
app.get('/getCalendar', (req,res,next) => {

	if(!req.session.user)
		return res.send({login: false, message: "You need to logIn"});
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




/*
app.get('*', function(req, res) {
  res.sendfile('./public/index.html');
});
*/


app.listen(3001, () => console.log('app listening on port 3001'))
/*var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});*/
