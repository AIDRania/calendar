var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'lounesfeniri',
    pass: '#Lounes1993#'
  }
});

var sendMail = function(email,password,callback){ 
var mailOptions = {
  from: 'lounesfeniri@gmail.com',
  to: email,
  subject: 'Your calendar password',
  html: '<b>email: </b>'+email+'<br/>'+
  		'<b>password: </b>'+password+'</br>'
};

transporter.sendMail(mailOptions, function(error, info){
	var response = {sent: false, message: ''};
  if (error) {
  	console.log(error);
  	response.message = "Mail not sent. "+error;
    callback(response);
  } else {
    response.sent = true;
    response.message = 'Email sent: ' + info.response;
    callback(response);
  }
});
}

module.exports = sendMail;