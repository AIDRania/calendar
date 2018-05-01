    
showCalendar = function(){
     $('#calendar').fullCalendar({
    // put your options and callbacks here
     header: { center: 'month,agendaWeek,agendaDay' },
     selectable: true,
     selectHelper: true,
     editable: true,
     events: [
    {
      title  : 'event1',
      start  : '2018-04-28'
    },
    {
      title  : 'event2',
      start  : '2018-04-28',
      end    : '2018-04-29'
    }]
  });

  var calendar = $('#calendar').fullCalendar('getCalendar');

    calendar.on('dayClick', function(date, jsEvent, view) {
        console.log('clicked on ' + date.format());
    });
}


login = function(){
   $.ajax({
       url : '/login',
       type : 'POST', // Le type de la requête HTTP, ici devenu POST
       contentType: "application/json",
       data :  JSON.stringify({
                      email: "test25@gmail.com",
                        password: "admin"
       }),
       dataType : 'json',
       success : function(res, statut){
           console.log(res);
       },

       error : function(res, statut, erreur){
            console.log(res);
       },

       complete : function(res, statut){
            //console.log(res);
       }
    });
}

logout = function(){
   $.ajax({
       url : '/logout',
       type : 'POST', // Le type de la requête HTTP, ici devenu POST
       contentType: "application/json",
       dataType : 'json',
       success : function(res, statut){
           console.log(res);
       },

       error : function(res, statut, erreur){
            console.log(res);
       },

       complete : function(res, statut){
            //console.log(res);
       }
    });
}

registration = function(){
  console.log("OK");
}