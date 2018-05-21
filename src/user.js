var  mongoose =require("mongoose")

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
photoPath:{type:String},
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
			enum: ['CREATION','MODIFICATION','DELETION','ADMINISTRATION'],
			}],
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
	  			response.user = {}
	  			response.user.email = userFinded.email;
	  			response.message = 'you are loged in';
	  		}else response.message = 'The e-mail or password you\'ve entered is incorrect';
	  		callback(response);
		});
	}else{
		response.message = 'you must fill in all the fields';
		callback(response);
	}
}


User.prototype.getPassword = function(callback){
	var response = {isExists: false,user: null,message:''};
	const email = this.data.email;
	console.log(email);
	if(email != null){
		UserModel.findOne({email: email},function(err, userFinded){
			if(err)
				for(var e in  err.errors)
				response.message += error.errors[e].message + ', ';
	  		else if(userFinded){
	  			response.isExists = true;
	  			response.user = {}
	  			response.user.email = userFinded.email;
	  			response.user.password = userFinded.password;			
	  			response.message = 'password finded';
	  		}else response.message = 'The e-mail you\'ve entered does not exists';
	  		callback(response);
		});
	}else{
		response.message = 'you must fill in the email field';
		callback(response);
	}
}


User.prototype.getProfile = function(callback){
	var response = {isExists: false,user: null,message:''};
	const email = this.data.email;

	UserModel.findOne({email: email},{password: 0},function(err, userFinded){
		if(err)
			for(var e in  err.errors)
				response.message += error.errors[e].message + ', ';
  		else {
  			if(userFinded){
  			response.isExists = true;
  			//userFinded.password = null; //not show password
  			response.user = userFinded;
  			response.message = 'Informations of profile';
  			}
  			else response.message = 'The e-mail you\'ve entered is incorrect';
  		}
  		callback(response);
	});
}


User.prototype.getEmails = function(callback){
	var response = {isExists: false,emails: null,message:''};
	const email = this.data.email;

	UserModel.find({email: {$regex: email, $options: 'i'}},{email: 1,photoPath:1,_id:0},{limit: 5},function(err, usersFinded){
		
		if(err)
			for(var e in  err.errors)
				response.message += error.errors[e].message + ', ';
  		else {
  			if(usersFinded){
  			response.isExists = true;
  			response.emails = usersFinded;
  			response.message = 'Liste of emails';
  			}
  			else response.message = 'The e-mail you\'ve entered is incorrect';
  		}
  		callback(response);
	});
}


User.prototype.getMyRights = function(callback){
	
	const email = this.data.email;
	var response = {isExists: false,email: email,rights: null,message:''};
	UserModel.findOne({email: email},{privileges: 1},function(err, userFinded){
		if(err)
			for(var e in  err.errors)
				response.message += error.errors[e].message + ', ';
  		else {
  			if(userFinded){
  			response.isExists = true;
  			response.rights = userFinded.privileges;
  			response.message = 'Informations of rights';
  			}
  			else response.message = 'Your e-mail doesn\'t exists';
  		}
  		callback(response);
	});
}


User.prototype.haveRight = function(right,callback){
	

	UserModel.findOne({email: this.data.email},{privileges: 1},function(err, userFinded){
		if(err)
			callback(false);
  		else {
  			if(userFinded){
  			
  			callback(userFinded.privileges.includes(right));
  			}
  			else callback(false);
  		}
	});
}


User.prototype.create = function(callback){
	var userModel = new UserModel(this.data); 
	var response = {creation: false, message:''};
	userModel.validate(function(error){
			
			if(!error){	
				userModel.save(function(err, savedUser){
					if(err){			
						response.creation = false;
						response.message = 'Error during creation in data base';
					}else{

						response.creation = true;
						response.message = 'your account has been seccessfully created';
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

User.prototype.assignRights = function(callback){
	var response = {assign: false, message: ""};
	const email = this.data.email;
	var rights = this.data.rights;
	if(rights.includes('ADMINISTRATION')){
		rights = rights.concat(['CREATION','MODIFICATION','DELETION','ADMINISTRATION']);
	}
	UserModel.findOneAndUpdate(
		{email: email},
		{$addToSet: {privileges: {$each: rights}}},
		{runValidators: true},
		function(error,userFinded){
			
			if(!error){
				if(userFinded){
					response.assign = true;
					response.message = 'The rights has been seccessfully added';
				}
				else
					response.message = 'The user does not exist';				
			}
			else
				for(var e in  error.errors)response.message += error.errors[e].message + ', ';
			callback(response);
		}

	);
}

User.prototype.removeRights = function(callback){
	var response = {remove: false, message: ""};
	const email = this.data.email;
	var rights = this.data.rights;
	rights.push('ADMINISTRATION'); // if you remove any right ==> he can't keep administration right
	UserModel.findOneAndUpdate(
		{email: email},
		{$pull: {privileges: {$in: rights}}},
		{runValidators: true},
		function(error,userFinded){
			console.log(error);
			if(!error){
				if(userFinded){
					response.remove = true;
					response.message = 'The rights has been seccessfully removed';
				}
				else
					response.message = 'The user does not exist';				
			}
			else
				for(var e in  error.errors)response.message += error.errors[e].message + ', ';
			callback(response);
		}

	);
}




module.exports = User;