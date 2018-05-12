var  mongoose =require("mongoose");
var  moment =require("moment");
mongoose.connect('mongodb://localhost:27017/calendar', { autoIndex: true });
//mongoose.connect('mongodb://raid:Aidrania1994@ds111390.mlab.com:11390/calendar', { autoIndex: true });
var calendarSchema = new mongoose.Schema({

name:{type:String,
	unique:true,
	validate: [{
		// test syntax of email
		validator: function(value){
			if(value == "test") return false;
			return true;
		},
		message: '{VALUE} is not a valid name calendar'
	},
	{
		// test if email is already exists
		isAsync: true,
		validator: function(value,callback){
			var calendar = mongoose.model('calendar');
			calendar.findOne({'name':value},function (err, calendarFinded) {
  					if (err) return handleError(err);
  					if(calendarFinded) {
  						callback(false);
  					}
					else callback(true);
  					});
		},
		message: 'This calendar already exists'
	}]
	,
	required: [true, 'Calendar name required']
},
owner:{type:String},
events: [{

	title: {type:String,
			validate: {
				validator: function(value){if(value == null || value == "") 
												return false;
											return true;},
				message: 'Error in title of this event'
			}
	},
	description: {type:String},
	author: {type:String},
	color: {type:String},
	start: {type:Date},
	end: {type:Date}
}]
});

var CalendarModel = mongoose.model('calendar',calendarSchema);

var Calendar = function(){
	this.model = mongoose.model('calendar',calendarSchema);
}

Calendar.prototype.create = function(data,callback){
	var calendarModel = new CalendarModel(data); 
	var response = {creation: false, message:''};
	calendarModel.validate(function(error){
			
		
			if(!error){
			
				calendarModel.save(function(err, savedCalendar){
					if(err){
						
						response.creation = false;
						response.message = 'Error during creation in data base';

					}else{
						
						response.creation = true;
						response.message = 'your calendar has been seccessfully created';
					}
				callback(response);
				});
			}else{ 
				
				//response.creation = false;
				for(var e in  error.errors)response.message += error.errors[e].message + ', ';
				callback(response);
			}
	});
}



Calendar.prototype.addEvent = function(nameCalendar,dataEvent,callback){
	
	var response = {creation: false, message:''};
	
	// validate start and end date before add
	var start = moment(dataEvent.start);
	var end = moment(dataEvent.end);
	if(!start.isValid())
		response.message = "Start date is not valide";
	else if(!end.isValid())
		response.message = "End date is not valide";
	else if(start >= end)
		response.message = "Start date need to be less then End date";
	else {

		CalendarModel.findOne({
			name: nameCalendar,
			events: {$elemMatch: {
				$or: [
					{$and: 
						[{start: {$gte: start}},
						 {end: {$lte: end}}]},
					{$and:
						[{start: {$lte: start}},
						 {end: {$gte: end}}]},
					{$and:
						[{start: {$lte: start}},
						 {end: {$lte: end}},
						 {end: {$gte: start}}]},
					{$and:
						[{start: {$gte: start}},
						 {end: {$gte: end}},
						 {start: {$lte: end}}]}
						 ]}
				}
		},function(error,find){
			console.log(find);
				if(!find){
					CalendarModel.findOneAndUpdate(
							{name: nameCalendar},
							{$push: {events: dataEvent}},
							{runValidators: true},
							function(error,eventFinded){
								
								if(!error){
									if(eventFinded){
										response.creation = true;
										response.message = 'Your event has been seccessfully added';
									}
									else
										response.message = 'The calendar does not exist';				
								}
								else
									for(var e in  error.errors)response.message += error.errors[e].message + ', ';
									callback(response);
								
							}

						);
				}else if(error){
					for(var e in  error.errors)response.message += error.errors[e].message + ', ';
					callback(response);
				}
				else{
					response.message = "This range is already busy";
					callback(response);
				}
			});
	return;
	}
	callback(response);
}



Calendar.prototype.updateEvent = function(nameCalendar,id_event,newData,callback){
	
	var response = {action: false, message:''};

	var start = moment(newData.start);
	var end = moment(newData.end);
	if(!start.isValid())
		response.message = "Start date is not valide";
	else if(!end.isValid())
		response.message = "End date is not valide";
	else if(start >= end)
		response.message = "Start date need to be less then End date";
	else {

		CalendarModel.findOne({
			name: nameCalendar,
			events: {$elemMatch: {
				$and: [{
					_id: {$ne: id_event}},
					{$or: [
						{$and: 
							[{start: {$gte: start}},
							 {end: {$lte: end}}]},
						{$and:
							[{start: {$lte: start}},
							 {end: {$gte: end}}]},
						{$and:
							[{start: {$lte: start}},
							 {end: {$lte: end}},
						 	 {end: {$gt: start}}]},
						{$and:
							[{start: {$gte: start}},
							 {end: {$gte: end}},
							 {start: {$lt: end}}]}
							 ]}]
				}}
		},function(error,find){
			console.log(find);
			if(!find){		
			console.log("EXIST");
			CalendarModel.findOneAndUpdate(
					{
						name: nameCalendar,
						events: {$elemMatch: {_id: id_event}} 
					},
					{$set: {"events.$": newData}},
					{runValidators: true},
					function(error,eventFinded){
						
						if(!error){	
							if(eventFinded){
								response.action = true;
								response.message = 'Your event has been seccessfully UPDATE';
							}
							else
								response.message = 'The calendar or event does not exist';				
						}
						else{
							for(var e in  error.errors)response.message += error.errors[e].message + ', ';
						}
						callback(response);
					});
		}else if(error){
					for(var e in  error.errors)response.message += error.errors[e].message + ', ';
					callback(response);
				}
				else{
					response.message = "This range is already busy";
					callback(response);
				}
			});
	return;
	}
	callback(response);
}




Calendar.prototype.deleteEvent = function(nameCalendar,id_event,callback){
	
	var response = {action: false, message:''};
	
	CalendarModel.findOneAndUpdate(
			{
				name: nameCalendar,
				events: {$elemMatch: {_id: id_event}}
			},
			{$pull: {events: {_id: id_event}}},
			{runValidators: true},
			function(error,eventFinded){
				
				if(!error){
					
					if(eventFinded){
						response.action = true;
						response.message = 'Your event has been seccessfully deleted';
					}
					else
						response.message = 'The calendar or event does not exist';				
				}
				else{
					
					for(var e in  error.errors)response.message += error.errors[e].message + ', ';
				}
					
				callback(response);
				
			}

		);
}



Calendar.prototype.getCalendar = function(nameCalendar,start,end,callback){
	
	var response = {exists: false, message:'',data: null};
	// validate start and end date before add
	const startDate = moment(start);
	const endDate = moment(end);
	if(!startDate.isValid())
		response.message = "Start date is not valide";
	else if(!endDate.isValid())
		response.message = "End date is not valide";
	else if(startDate >= endDate)
		response.message = "Start date need to be less then End date";
	else{

	CalendarModel.findOne(
			{	name: nameCalendar
			},
			function(error,calendarFinded){
				
				if(!error){

					if(calendarFinded){

						response.exists = true;
						response.message = 'here the data of the calendar';
						//filter array of events with date range
						calendarFinded.events = calendarFinded.events.filter(event =>
								event.start >= startDate && event.end <= endDate);
						response.data = calendarFinded;
					}
					else
						response.message = 'The calendar '+nameCalendar+' does not exist';				
				}
				else
					for(var e in  error.errors)response.message += error.errors[e].message + ', ';
					callback(response);	
			}
		);
	return;
	}
	callback(response);
}



Calendar.prototype.getCalendarInfos = function(nameCalendar,callback){
	
	var response = {exists: false, message:'',data: null};

	CalendarModel.findOne(
			{name: nameCalendar},
			function(error,calendarFinded){
				if(!error){
					if(calendarFinded){
						response.exists = true;
						response.message = 'here the data of the calendar';
						response.data = new Object();
						response.data.name = calendarFinded.name;
						response.data.owner = calendarFinded.owner;
						response.data.nbEvents = calendarFinded.events.length;
					}
					else
						response.message = 'The calendar '+nameCalendar+' does not exist';				
				}
				else
					for(var e in  error.errors)response.message += error.errors[e].message + ', ';
					callback(response);	
			}
		);
}



module.exports = Calendar;