var  mongoose =require("mongoose");
var  moment =require("moment");

var calendarSchema = new mongoose.Schema({

name:{type:String,
	unique:true,
	validate: [{
		// test syntax of email
		validator: function(value){
			if(value == "") return false;
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

	title: {type:String,required: [true, 'event name required']},
	description: {type:String},
	author: {type:String},
	color: {type:String},
	start: {type:Date,timezone:'locale'},
	end: {type:Date,timezone:'locale'}
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




Calendar.prototype.delete = function(nameCalendar,callback){
	
	var response = {action: false, message:''};
	CalendarModel.findOneAndRemove(
			{
				name: nameCalendar
			},
			function(error,eventFinded){
				if(!error){
					if(eventFinded){
						response.action = true;
						response.message = 'Your calendar has been seccessfully deleted';
					}
					else
						response.message = 'The calendar does not exist';				
				}
				else{
					for(var e in  error.errors)response.message += error.errors[e].message + ', ';
				}
				callback(response);
			});
}






Calendar.prototype.addEvent = function(nameCalendar,dataEvent,callback){
	

	var response = {creation: false, message:''};
	
	// validate start and end date before add
	var startDate = moment(dataEvent.start);
	var endDate = moment(dataEvent.end);
	if(!startDate.isValid())
		response.message = "Start date is not valide";
	else if(!endDate.isValid())
		response.message = "End date is not valide";
	else if(startDate >= endDate)
		response.message = "Start date need to be less then End date";
	else {

		CalendarModel.findOne({
			name: nameCalendar,
			events: {$elemMatch: {
				$or: [
					{$and: 
						[{start: {$gte: startDate}},
						 {end: {$lte: endDate}}]},
					{$and:
						[{start: {$lte: startDate}},
						 {end: {$gte: endDate}}]},
					{$and:
						[{start: {$lte: startDate}},
						 {end: {$lte: endDate}},
						 {end: {$gt: startDate}}]},
					{$and:
						[{start: {$gte: startDate}},
						 {end: {$gte: endDate}},
						 {start: {$lt: endDate}}]}
						 ]}
				}
		},function(error,find){
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

	var startDate = moment(newData.start);
	var endDate = moment(newData.end);
	if(!startDate.isValid())
		response.message = "Start date is not valide";
	else if(!endDate.isValid())
		response.message = "End date is not valide";
	else if(startDate >= endDate)
		response.message = "Start date need to be less then End date";
	else {

		CalendarModel.findOne({
			name: nameCalendar,
			events: {$elemMatch: {
				$and: [{
					_id: {$ne: id_event}},
					{$or: [
						{$and: 
							[{start: {$gte: startDate}},
							 {end: {$lte: endDate}}]},
						{$and:
							[{start: {$lte: startDate}},
							 {end: {$gte: endDate}}]},
						{$and:
							[{start: {$lte: startDate}},
							 {end: {$lte: endDate}},
						 	 {end: {$gt: startDate}}]},
						{$and:
							[{start: {$gte: startDate}},
							 {end: {$gte: endDate}},
							 {start: {$lt: endDate}}]}
							 ]}]
				}}
		},function(error,find){
			if(!find){	
			CalendarModel.findOneAndUpdate(
					{
						name: nameCalendar,
						events: {$elemMatch: {_id: id_event,author: newData.author}} 
					},
					{$set: {
						"events.$.title": newData.title,
							"events.$.description": newData.description,
							"events.$.start": startDate,
							"events.$.end": endDate,
							"events.$.color": newData.color
						}},
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




Calendar.prototype.deleteEvent = function(nameCalendar,id_event,author,callback){
	
	var response = {action: false, message:''};
	CalendarModel.findOneAndUpdate(
			{
				name: nameCalendar,
				events: {$elemMatch: {_id: id_event,author: author}}
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
								event.end >= startDate && event.start <= endDate);
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



Calendar.prototype.getEventsInXMin = function(min,callback){
	
	var response = {exists: false, message:'',data: null};
	// validate start and end date before add
	const startDate = moment.utc().milliseconds(0).add(min, 'minutes');
	
	CalendarModel.find({events: {$elemMatch: {
			start: startDate}}
			},{ 'events.$': 1 },function(error,calendarsFinded){
				
				if(!error){
			
					if(calendarsFinded && calendarsFinded.length >0){
						
						response.exists = true;
						response.message = 'here the events';
						response.data = calendarsFinded;
					
					}
					else
						response.message = 'There is no events';
								
				}else
					for(var e in  error.errors)response.message += error.errors[e].message + ', ';
				callback(response);	
			}
		);

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




Calendar.prototype.getCalendarsNames = function(name,callback){
	
	var response = {exists: false,names: null, message:''};

	CalendarModel.find(
			{name: {$regex: name, $options: 'i'}},
			{name: 1},
			function(error,calendars){
				if(!error){
					if(calendars){
						response.exists = true;
						response.message = 'here the list of calendars';
						response.names = calendars;
						}
					else
						response.message = 'no calendars';				
				}
				else
					for(var e in  error.errors)response.message += error.errors[e].message + ', ';
					callback(response);	
			}
		);
}


module.exports = Calendar;