
function notifyMe(message) {
  // Let's check if the browser supports notifications

  if (!("Notification" in window)) {
    alert("This browser does not support system notifications");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification(message);
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== 'denied') {

    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification("Hi there!");
        setTimeout(notification.close.bind(), 4000);
      }
    });
  }

  // Finally, if the user has denied notifications and you 
  // want to be respectful there is no need to bother them any more.
}
var localhost = false;

var socket;
if(localhost)
  socket = io.connect("http://localhost:3001");
else
  socket = io.connect("https://calendars14.herokuapp.com:3000");
socket.on('Calendar',function(data){
  if(data.name == CALENDAR_NAME){
      if(data.action == 'EVENT_CREATE')notifyMe("New event has added");
      if(data.action == 'EVENT_UPDATE')notifyMe("Event has updated");
      if(data.action == 'EVENT_DELETE')notifyMe("Event has deleted");
      $("#calendar").fullCalendar('refetchEvents');
    }
  if(data.action == 'CALENDAR_CREATE')notifyMe("The calendar "+data.name+" has created");
  if(data.action == 'CALENDAR_DELETE')notifyMe("The calendar "+data.name+" has deleted");
});


//notifyMe("HI");

function check_session(callback){
  $.ajax({
       url : '/check_session',
       type : 'GET', // Le type de la requête HTTP, ici devenu POST
       contentType: "application/json",
       dataType : 'json',
       success : function(res, statut){
           callback(res);
       },
       error : function(res, statut, erreur){
            callback(res);
       }
    });
}


function showCalendar(name,isConnected){
     $('#calendar').fullCalendar('destroy');
     $('#calendar').fullCalendar({
    // put your options and callbacks here
     header: { center: 'month,agendaWeek,agendaDay'
               }, 
     defaultView: 'agendaWeek',
     selectable: isConnected,
     selectHelper: isConnected,
     editable: isConnected,
    
     events: function(start, end, timezone, callback){

        const startDate = moment(start).format('YYYY-MM-DDTHH:mm');
        const endDate = moment(end).format('YYYY-MM-DDTHH:mm');
        getCalendar(name,startDate,endDate,function(res){
          
          var $scope = angular.element($("#calendarContainer")).scope();
          $scope.errorMessage = "";
          $scope.showCalendar = false;
          if(res.exists){
              $scope.showCalendar = true;
              $scope.$apply();
              callback(res.data.events);
          }else{
              $('#calendar').fullCalendar('destroy');
              $scope.errorMessage = res.message;
              $scope.$apply();
          }
          
        });
     },
     eventRender: function(event, element) {
        
        element.append(event.description); 
        element.append("<br/><b>"+event.author+"</b>");  
     },
     eventResize: function(event, delta, revertFunc) {
        
        var body = new Object();
        body.name_calendar = CALENDAR_NAME;
        body.id_event = event._id;
        body.data = new Object();
        body.data._id = event._id;
        body.data.title = event.title;
        body.data.color = event.color;
        body.data.description = event.description;
        body.data.author = event.author;
        body.data.start = moment(event.start).format('YYYY-MM-DDTHH:mm');
        body.data.end = moment(event.end).format('YYYY-MM-DDTHH:mm');
        updateEvent(body,function(res){
            if(!res.action)
              revertFunc();    
        });


      },
     eventDrop: function(event, delta, revertFunc) {
        var body = new Object();
        body.name_calendar = CALENDAR_NAME;
        body.id_event = event._id;
        body.data = new Object();
        body.data._id = event._id;
        body.data.title = event.title;
        body.data.description = event.description;
        body.data.author = event.author;
        body.data.color = event.color;
        body.data.start = moment(event.start).format('YYYY-MM-DDTHH:mm');
        body.data.end = moment(event.end).format('YYYY-MM-DDTHH:mm');
        updateEvent(body,function(res){
            if(!res.action)
              revertFunc();    
        });

     },
     select: function(start,end){
       
       var $scope = angular.element($("#eventModal")).scope();
       $scope.eventClicked = false;
       $scope.event_form.title ="";
       $scope.event_form.description ="";
       $scope.showSucces = false;
       $scope.showError = false;
       $scope.event_form.start = moment(start).format('YYYY-MM-DDTHH:mm'); 
       $scope.event_form.end = moment(end).format('YYYY-MM-DDTHH:mm');
       $scope.$apply();
       $('#eventModal').modal('show');
     },
     eventClick: function(calEvent, jsEvent, view) {  
       if(!isConnected)return;
       var $scope = angular.element($("#eventModal")).scope();
       $scope.eventClicked = true;
       $scope.idEvent = calEvent._id;
       $scope.event_form.title =calEvent.title;
       $scope.event_form.author =calEvent.author;
       $scope.event_form.color = event.color;
       $scope.event_form.description = calEvent.description;
       $scope.event_form.start = moment(calEvent.start._i).format('YYYY-MM-DDTHH:mm'); 
       $scope.event_form.end = moment(calEvent.end._i).format('YYYY-MM-DDTHH:mm');
       $scope.showSucces = false;
       $scope.showError = false;
       $scope.$apply();
       $('#eventModal').modal('show');
     }
  });

  var calendar = $('#calendar').fullCalendar('getCalendar');
}


function login(data,callback){
   $.ajax({
       url : '/login',
       type : 'POST', // Le type de la requête HTTP, ici devenu POST
       contentType: "application/json",
       data :  JSON.stringify(data),
       dataType : 'json',
       success : function(res, statut){ 
           callback(res);
       },
       error : function(res, statut, erreur){
            callback(res);
       }
    });
}

function logout(callback){
   $.ajax({
       url : '/logout',
       type : 'POST', // Le type de la requête HTTP, ici devenu POST
       contentType: "application/json",
       dataType : 'json',
       success : function(res, statut){
           callback(res);
       },

       error : function(res, statut, erreur){
            callback(res);
       }
    });
  }

function registration(data,callback){


   $.ajax({
       url : '/createuser',
       type : 'POST', // Le type de la requête HTTP, ici devenu POST
       contentType: "application/json",
       dataType : 'json',
       data :  JSON.stringify(data),
       success : function(res, statut){
            callback(res);
       },

       error : function(res, statut, erreur){
            callback(res);
       }
    });
}


function getProfile(email,callback){

   $.ajax({
       url : '/getProfile?email='+email,
       type : 'GET', // Le type de la requête HTTP, ici devenu POST
       contentType: "application/json",
       dataType : 'json',
       success : function(res, statut){
            callback(res);
       },
       error : function(res, statut, erreur){
            callback(res);
       }
    });
}
function getEmails(email,callback){

   $.ajax({
       url : '/getEmails?email='+email,
       type : 'GET', // Le type de la requête HTTP, ici devenu POST
       contentType: "application/json",
       dataType : 'json',
       success : function(res, statut){
            callback(res);
       },
       error : function(res, statut, erreur){
            callback(res);
       }
    });
}


function getCalendarsNames(name,callback){

   $.ajax({
       url : '/getCalendarsNames?name='+name,
       type : 'GET', // Le type de la requête HTTP, ici devenu POST
       contentType: "application/json",
       dataType : 'json',
       success : function(res, statut){
            callback(res);
       },
       error : function(res, statut, erreur){
            callback(res);
       }
    });
}



function getCalendar(name,start,end,callback){

   $.ajax({
       url : '/getCalendar?name='+name+'&start='+start+'&end='+end,
       type : 'GET', // Le type de la requête HTTP, ici devenu POST
       contentType: "application/json",
       dataType : 'json',
       success : function(res, statut){
            callback(res);
       },
       error : function(res, statut, erreur){
            console.log(res);
            callback(res);
       }
    });
}


function getCalendarInfos(name,callback){

   $.ajax({
       url : '/getCalendarInfos?name='+name,
       type : 'GET', // Le type de la requête HTTP, ici devenu POST
       contentType: "application/json",
       dataType : 'json',
       success : function(res, statut){
            callback(res);
       },
       error : function(res, statut, erreur){
            callback(res);
       }
    });
}

function createCalendar(data,callback){
 
   $.ajax({
       url : '/createCalendar',
       type : 'POST', // Le type de la requête HTTP, ici devenu POST
       contentType: "application/json",
       data :  JSON.stringify(data),
       dataType : 'json',
       success : function(res, statut){
           callback(res);
       },

       error : function(res, statut, erreur){
            console.log(res);
            callback(res);
       }
    });
}

function deleteCalendar(data,callback){
 
   $.ajax({
       url : '/deleteCalendar',
       type : 'POST', // Le type de la requête HTTP, ici devenu POST
       contentType: "application/json",
       data :  JSON.stringify(data),
       dataType : 'json',
       success : function(res, statut){
           callback(res);
       },

       error : function(res, statut, erreur){
            console.log(res);
            callback(res);
       }
    });
}



function addEvent(data,callback){
 
   $.ajax({
       url : '/addEvent',
       type : 'POST', // Le type de la requête HTTP, ici devenu POST
       contentType: "application/json",
       data :  JSON.stringify(data),
       dataType : 'json',
       success : function(res, statut){
           callback(res);
       },

       error : function(res, statut, erreur){
            console.log(res);
            callback(res);
       }
    });
}


function updateEvent(data,callback){
 
   $.ajax({
       url : '/updateEvent',
       type : 'POST', // Le type de la requête HTTP, ici devenu POST
       contentType: "application/json",
       data :  JSON.stringify(data),
       dataType : 'json',
       success : function(res, statut){
           callback(res);
       },

       error : function(res, statut, erreur){
            console.log(res);
            callback(res);
       }
    });
}


function deleteEvent(name,id,author_email,callback){
 
   $.ajax({
       url : '/deleteEvent',
       type : 'POST', // Le type de la requête HTTP, ici devenu POST
       contentType: "application/json",
       data :  JSON.stringify({name_calendar: name,id_event: id,author: author_email}),
       dataType : 'json',
       success : function(res, statut){
           callback(res);
       },

       error : function(res, statut, erreur){
            console.log(res);
            callback(res);
       }
    });
}

function assignRight(email,right,callback){
 
   $.ajax({
       url : '/assignRights',
       type : 'POST', 
       contentType: "application/json",
       data :  JSON.stringify({email: email, rights: [right]}),
       dataType : 'json',
       success : function(res, statut){
           callback(res);
       },
       error : function(res, statut, erreur){
            console.log(res);
            callback(res);
       }
    });
}


function removeRight(email,right,callback){
 
   $.ajax({
       url : '/removeRights',
       type : 'POST', 
       contentType: "application/json",
       data :  JSON.stringify({email: email, rights: [right]}),
       dataType : 'json',
       success : function(res, statut){
           callback(res);
       },
       error : function(res, statut, erreur){
            callback(res);
       }
    });
}




