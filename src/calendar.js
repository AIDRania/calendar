var  mongoose =require("mongoose")

//mongoose.connect('mongodb://localhost:27017/calendar', { autoIndex: true });
mongoose.connect('mongodb://raid:Aidrania1994@ds111390.mlab.com:11390/calendar', { autoIndex: true });
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
				validator: function(value){if(value == "1") return false;
											return true;},
				message: 'ERROR TITLE EVENT'
			}
	},
	author: {type:String},
	start_date: {type:Date},
	end_date: {type:Date}
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
			
			console.log("VALIDATE START");
			if(!error){
				console.log("NO ERROR VAIDATE");
				calendarModel.save(function(err, savedCalendar){
					if(err){
						console.log("SAVE ERROR");
						response.creation = false;
						response.message = 'Error during creation in data base';

					}else{
						console.log("NO SAVE ERROR");
						response.creation = true;
						response.message = 'your calendar has been seccessfully created';
					}
				callback(response);
				});
			}else{ 
				console.log("ERROR VALIDATE");
				//response.creation = false;
				for(var e in  error.errors)response.message += error.errors[e].message + ', ';
				callback(response);
			}
	});
}



Calendar.prototype.addEvent = function(nameCalendar,dataEvent,callback){
	
	var response = {creation: false, message:''};
	console.log("ADDEVENT START");
	CalendarModel.findOneAndUpdate(
			{name: nameCalendar},
			{$push: {events: dataEvent}},
			{runValidators: true},
			function(error,eventFinded){
				console.log("INSIDE QUERRY");
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
}


Calendar.prototype.deleteEvent = function(nameCalendar,id_event,callback){
	
	var response = {action: false, message:''};
	console.log("DELETEEVENT START");
	CalendarModel.findOneAndUpdate(
			{name: nameCalendar,
			 events: {_id: id_event}
			},
			{$pull: {events: {_id: id_event}}},
			{runValidators: true},
			function(error,eventFinded){
				console.log("INSIDE QUERRY");
				if(!error){
					console.log("NO ERROR");
					if(eventFinded){
						response.action = true;
						response.message = 'Your event has been seccessfully deleted';
					}
					else
						response.message = 'The calendar does not exist';				
				}
				else{
					console.log("YES ERROR");
					for(var e in  error.errors)response.message += error.errors[e].message + ', ';
				}
				console.log("END");	
				callback(response);
				
			}

		);
}




module.exports = Calendar;