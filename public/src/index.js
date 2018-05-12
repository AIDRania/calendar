
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


function showCalendar(name){
     $('#calendar').fullCalendar('destroy');
     $('#calendar').fullCalendar({
    // put your options and callbacks here
     header: { center: 'month,agendaWeek,agendaDay'
               }, 
     defaultView: 'agendaWeek',
     selectable: true,
     selectHelper: true,
     editable: true,
     events: function(start, end, timezone, callback){
        console.log(moment(start).format('YYYY-MM-DDTHH:mm'));
        console.log(moment(end).format('YYYY-MM-DDTHH:mm'));
        const startDate = moment(start).format('YYYY-MM-DDTHH:mm');
        const endDate = moment(end).format('YYYY-MM-DDTHH:mm');
        getCalendar(name,startDate,endDate,function(res){
          
          var $scope = angular.element($("#errorGetCalendar")).scope();
          $scope.errorMessage = "";
          if(res.exists){
              callback(res.data.events);
          }else{
              $('#calendar').fullCalendar('destroy');
              $scope.errorMessage = res.message;
          }
          $scope.$apply();
        });
     },
     eventRender: function(event, element) {
       
        element[0].className += " btn-outline-success" 
     },
     eventResize: function(event, delta, revertFunc) {
        

        var body = new Object();
        body.name_calendar = CALENDAR_NAME;
        body.id_event = event._id;
        body.data = new Object();
        body.data._id = event._id;
        body.data.title = event.title;
        body.data.description = event.description;
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

       var $scope = angular.element($("#eventModal")).scope();
       $scope.eventClicked = true;
       $scope.idEvent = calEvent._id;
       $scope.event_form.title =calEvent.title;
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
       },

       complete : function(res, statut){
            //console.log(res);
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
       },

       complete : function(res, statut){
            //console.log(res);
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
            callback(res.creation);
       },

       error : function(res, statut, erreur){
            callback(false);
       },

       complete : function(res, statut){
            //console.log(res);
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






function getCalendar(name,start,end,callback){

   $.ajax({
       url : '/getCalendar?name='+name+'&start='+start+'&end='+end,
       type : 'GET', // Le type de la requête HTTP, ici devenu POST
       contentType: "application/json",
       dataType : 'json',
       success : function(res, statut){
            console.log(res);
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
           console.log(res);
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
           console.log(res);
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
           console.log(res);
           callback(res);
       },

       error : function(res, statut, erreur){
            console.log(res);
            callback(res);
       }
    });
}


function deleteEvent(name,id,callback){
 
   $.ajax({
       url : '/deleteEvent',
       type : 'POST', // Le type de la requête HTTP, ici devenu POST
       contentType: "application/json",
       data :  JSON.stringify({name_calendar: name,id_event: id}),
       dataType : 'json',
       success : function(res, statut){
           console.log(res);
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
           console.log(res);
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
           console.log(res);
           callback(res);
       },

       error : function(res, statut, erreur){
            console.log(res);
            callback(res);
       }
    });
}




