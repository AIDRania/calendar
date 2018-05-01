var  mongoose =require("mongoose")

//mongoose.connect('mongodb://localhost:27017/calendar', { autoIndex: true });
mongoose.connect('mongodb://raid:Aidrania1994@ds111390.mlab.com:11390/calendar', { autoIndex: true });
var userSchema = new mongoose.Schema({

email:{type:String,
	unique:true,
	validate: [{
		// test syntax of email
		validator: function(value){
			if(value == "test") return false;
			return true;
		},
		message: '{VALUE} is not a valid e-mail adress'
	},
	{
		// test if email is already exists
		isAsync: true,
		validator: function(value,callback){
			var user = mongoose.model('user');
			user.findOne({'email':value},function (err, userFinded) {
  					if (err) return handleError(err);
  					if(userFinded) {
  						callback(false);
  					}
					else callback(true);
  					});
		},
		message: 'this adress already exists'
	}]
	,
	required: [true, 'User email adress required']
},
last_name:{type:String},
first_name:{type:String},
gender:{type:String},
country:{type:String},
birthday_date:{
	type:Date,
	validator: function(value){
			return true;
		},
	message: '{VALUE} is not a valid date '
},
password:{
	type:String,

	validate:{
	validator:function(value){
	if(value.lenght <3)
	return false;
	return true;	

	},
	message:'the password should be have more then height characters'
},
	required: [true, 'User password is requited']},
privileges:[{
			type: String,
			enum: ['CREATE', 'UPDATE', 'DELETE', 'AMIN']
			} ],
});


var UserModel = mongoose.model('user',userSchema);

var User = function(data){
	this.data = data;
}

User.prototype.login = function(callback){
	var response = {isExists: false,user: null,message:''};
	const email = this.data.email;
	const password = this.data.password;
	if(email != null && password != null){
		UserModel.findOne({'email': email,'password': password},function(err, userFinded){
			if (err) return handleError(err);
	  		if(userFinded){
	  			response.isExists = true;
	  			response.user = userFinded.email;
	  			response.message = 'you are loged in';
	  		}else response.message = 'The e-mail or password you\'ve entered is incorrect';
	  		callback(response);
		});
	}else{
		response.message = 'you must fill in all the fields';
		callback(response);
	}
}



User.prototype.getInfos = function(email,callback){
	var response = {isExists: false,user: null,message:''};
	
	if(email != null){
		UserModel.findOne({'email': email},function(err, userFinded){
			if (err) return handleError(err);
	  		if(userFinded){
	  			response.isExists = true;
	  			userFinded.password = null; //not show password
	  			response.user = userFinded;
	  			response.message = 'your information';
	  		}else response.message = 'The e-mail you\'ve entered is incorrect';
	  		callback(response);
		});
	}else{
		response.message = 'you must fill in all the fields';
		callback(response);
	}
}


User.prototype.create = function(callback){
	var userModel = new UserModel(this.data); 
	var response = {creation: false, message:''};
	userModel.validate(function(error){
			
			console.log("VALIDATE START");
			if(!error){
				console.log("NO ERROR VAIDATE");
				userModel.save(function(err, savedUser){
					if(err){
						console.log("SAVE ERROR");
						response.creation = false;
						response.message = 'Error during creation in data base';

					}else{
						console.log("NO SAVE ERROR");
						response.creation = true;
						response.message = 'your account has been seccessfully created';
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





module.exports = User;