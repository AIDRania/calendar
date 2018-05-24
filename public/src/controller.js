
//initialization of angularjs app
var app = angular.module("myApp", ['ngRoute','ngCookies','moment-picker','colorpicker-dr','flow']);

app.run(function($rootScope, $location, userService,pathService) {
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        userService.checkSession(function(session){
            if(!session && userService.isConnected()){
                userService.logOut();
            }

            if (next.$$route && next.$$route.authorizedLogin && !userService.isConnected())
                $location.path("login");
            else if(next.$$route && !next.$$route.authorizedLogin && userService.isConnected())
                $location.path("home");
            else if(next.$$route && next.$$route.authorizedLogin 
                && next.$$route.authorizedAdmin && !userService.haveRight('ADMINISTRATION')){
                $location.path("home"); 
                }
            $rootScope.$apply();
        });
    }); 
});

app.config(['$routeProvider',function($routeProvider) {
    $routeProvider
    .when("/home", {
        templateUrl : "views/calendar.html",
        controller  : "calendarController",
        authorizedLogin: false,
        authorizedAdmin: false
    }) 
    .when("/login", {
        templateUrl : "views/login.html",
        controller  : "loginController",
        authorizedLogin: false,
        authorizedAdmin: false
    })
    .when("/profile", {
        templateUrl : "views/profile.html",
        controller  : "profileConroller",
        authorizedLogin: true,
        authorizedAdmin: false
        })
    .when("/administration/profile", {
        templateUrl : "views/administration/adminProfile.html",
        controller  : "adminProfileConroller",
        authorizedLogin: true,
        authorizedAdmin: true
    })
    .when("/administration/calendar", {
        templateUrl : "views/administration/adminCalendar.html",
        controller  : "adminCalendarConroller",
        authorizedLogin: true,
        authorizedAdmin: true
    })
    .when("/registration", {
        templateUrl : "views/registration.html",
        controller  : "registrationConroller",
        authorizedLogin: false,
        authorizedAdmin: false
    })
    .when("/about", {
        templateUrl : "views/about.html",
        authorizedLogin: false,
        authorizedAdmin: false
    })
    .when("/contact", {
        templateUrl : "views/contact.html",
        authorizedLogin: false,
        authorizedAdmin: false
    })

    .otherwise({
            redirectTo: '/home'
        });
   
}]);


app.config(['flowFactoryProvider', function (flowFactoryProvider) {
     flowFactoryProvider.defaults = {
    permanentErrors: [404, 500, 501],
    maxChunkRetries: 1,
    chunkRetryInterval: 5000,
    simultaneousUploads: 4,
    singleFile: true
  };
    // You can also set default events:
    flowFactoryProvider.on('catchAll', function (event) {
     
    });
    // Can be used with different implementations of Flow.js
    // flowFactoryProvider.factory = fustyFlowFactory;
}]);





app.controller('mainController',['$scope','$location','userService','pathService',
                            function($scope,$location,userService,pathService){
   $scope.email = userService.getEmail();
    
   $scope.$on("$routeChangeStart", function (event, next, current) {
        pathService.setPath($location.url())
        $scope.path = pathService.getPath();
   });

     $scope.logout = function(){
        logout(function(res){
            if(res.logout){
                userService.logOut();
                $location.url("login");
                $scope.$apply();
            }
        });

    }

    $scope.$on("connectionStateChanged",function(){
                   $scope.email = userService.getEmail();
                });
}]);

app.controller('calendarController',['$scope','userService',function($scope,userService){
   $scope.event_form = {};
   $scope.event_form.title = "";
   $scope.event_form.description = "";
   $scope.event_form.start = "";
   $scope.event_form.end = ""; 
   $scope.event_form.color = "";
   $scope.errorMessage = "";
   

    $scope.search = {names: []};
    $scope.$watch('name', function (val) {
     
        if(val != '' && val != undefined){
            getCalendarsNames(val,function(res){  
                        
                if(res.exists){
                    $scope.search.names = res.names;
                    
                    $scope.$apply();
                }
            });
        }else
            $scope.search.names = [];
    });



   $scope.getCalendar = function(name){
    CALENDAR_NAME = name;
    showCalendar(name,userService.isConnected());
       };
   $scope.getCalendar("DEFAULT"); // get default calendar at first

   $scope.newEvent = function(event_form){
        var body = new Object();
        body.name_calendar = CALENDAR_NAME;
        body.data = event_form;
        body.data.start = moment(body.data.start).format();
        body.data.end = moment(body.data.end).format();
        console.log(body.data.start);
        console.log(body.data.end);
        addEvent(body,function(res){
            if(res.creation){
                $scope.showSucces = true;
                $scope.showError = false;
                $('#eventModal').modal('hide');
            }else{
                $scope.showSucces = false;
                $scope.showError = true;
            }
            $scope.messageEvent = res.message;
            $scope.$apply();
        });

   }

    $scope.updateEvent = function(event_form){
        var body = new Object();
        body.name_calendar = CALENDAR_NAME;
        body.id_event = $scope.idEvent;
        body.data = event_form;
        body.data.start = moment(body.data.start).format();
        body.data.end = moment(body.data.end).format();
        updateEvent(body,function(res){
            if(res.action){
                $scope.showSucces = true;
                $scope.showError = false;
            }else{
                $scope.showSucces = false;
                $scope.showError = true;
            }
            $scope.messageEvent = res.message;
            $scope.$apply();
        });

   }



   $scope.deleteEvent = function(id){
    
    
     if (!confirm("are you sure you want to delete this event!")) return;

    deleteEvent(CALENDAR_NAME,id,$scope.event_form.author,function(res){
        if(res.action){
                $scope.showSucces = true;
                $scope.showError = false;
                $('#eventModal').modal('hide');
            }else{
                $scope.showSucces = false;
                $scope.showError = true;
            }
            $scope.messageEvent = res.message;
            $scope.$apply();
    });
   }
}]);

app.controller('profileConroller',['$scope','$location','userService',function($scope,$location,userService){

     getProfile(userService.getEmail(),function(res){
            if(res.isExists){
                $scope.userData = res.user;
            }else{
                $scope.logout();
            }
             $scope.$apply();
        });

    $scope.logout = function(){
        logout(function(res){
            if(res.logout){
                userService.logOut();
                $location.path("home");
                $location.replace();
                $scope.$apply();

            }
        });
    }
}]);


app.controller('loginController',['$scope','$location','$cookieStore','userService',
        function($scope,$location,$cookieStore,userService){
     
      $scope.show = false;
      $scope.submitLoginForm = function(data){

        login(data,function(res){
        
            if(res.isExists){
                $scope.show = false;
                userService.logIn(function(){
                    $location.path("home");
                    $location.replace();
                    $scope.$apply();
                });
            }else{
                $scope.show = true;
                $scope.errorMessageLogin = res.message;
                $scope.$apply();
            }
        });
      }
}]);

app.controller('registrationConroller',['$scope','$location',function($scope,$location){

    $scope.registration_form = new Object();
    $scope.registration_form.photoProfile = "images/menProfile.jpg";
    $scope.photoSelected = false;
    $scope.updateGebnder = function(gender){
        if(gender == "male" && !$scope.photoSelected)
            $scope.registration_form.photoProfile = "images/menProfile.jpg";
        if(gender == "female" && !$scope.photoSelected)
            $scope.registration_form.photoProfile = "images/womenProfile.jpg";
          
    }

    $scope.processFiles = function(files){
        //if(file[0])
         if(files[0].file.type.indexOf("image") == -1){
            alert("You need to select an image file");
            return;
         }
        if(files[0].file.size > 5000000){
            alert("this image is too large");
            return;
         }
         
         var fileReader = new FileReader();
         fileReader.readAsDataURL(files[0].file); // just the first image
         fileReader.onload = function (event) {

                $scope.registration_form.photoProfile = event.target.result;
                $scope.photoSelected = true;
                $scope.$apply();    
        };
        
      }



    $scope.submitRegistrationForm = function(data){

        registration(data,function(res){
            if(res.creation){
            $scope.showError = false;
            $scope.showSucces = true;
            $scope.succesMessageRegistration = res.message;
            setTimeout(function(args) {     
                $location.path("home");
                $location.replace();
                $scope.$apply();
            },4000);
        }else{
            $scope.showError = true;
            $scope.showSucces = false;
            $scope.errorMessageRegistration = res.message;
        }
        $scope.$apply();
        });
    }
}]);

app.controller('adminProfileConroller',['$scope','$location',
            function($scope,$location){
    $scope.search = {users: []};
    $scope.errorMessageGetProfile = "";
    $scope.email = "";
    $scope.showError = false;
    $scope.showProfil = false;
    $scope.showSuccesSave = false;
     $scope.allRights = ['CREATION','MODIFICATION','DELETION','ADMINISTRATION'];
    $scope.$watch('email', function (val) {
        
        if(val != '' && val != undefined){
            getEmails(val,function(res){                
                if(res.isExists){
                    $scope.search.users = res.emails;
                    $scope.$apply();
                }
            });
        }else
            $scope.search.users = [];
    });

    $scope.getProfile = function(email){
        getProfile(email,function(res){
            if(res.isExists){
                $scope.userData = res.user;
                $scope.showProfil = true;
                $scope.showError  = false;
                $scope.errorMessageGetProfile = "";
                $scope.rights = res.user.privileges;
               
            }else{
                $scope.showProfil = false;
                $scope.errorMessageGetProfile = res.message;
                $scope.showError = true;
            }
            $scope.$apply();
        });
    }

  $scope.assignRight = function(email,right){
        if(right == undefined){
            $scope.errorMessageGetProfile = "You need to select a right you want to add";
            $scope.showError = true;
            return;
        }
        assignRight(email,right,function(res){
            if(res.assign)
                $scope.showError = false;
            else{
                $scope.errorMessageGetProfile = res.message;
                $scope.showError = true;
            }
            $scope.getProfile(email);
        });
     }

$scope.removeRight = function(email,right){
        removeRight(email,right,function(res){
            if(res.remove)
                $scope.showError = false;
            else{
                $scope.errorMessageGetProfile = res.message;
                $scope.showError = true;
            }
            $scope.getProfile(email);
        });
     }

}]);


app.controller('adminCalendarConroller',['$scope','$location',
            function($scope,$location){

    $scope.search = {names: []};
    $scope.$watch('name', function (val) {
     
        if(val != '' && val != undefined){
            getCalendarsNames(val,function(res){  
                     
                if(res.exists){
                    $scope.search.names = res.names;  
                    $scope.$apply();
                }
            });
        }else
            $scope.search.names = [];
    });

    $scope.createCalendar = function(name){
        createCalendar({name: name},function(res){
             if(res.creation){
                $scope.showError  = false;
                $scope.showSuccesCreate = true;
                $scope.succesMessagecreateCalendar = res.message;
            }else{
                $scope.showError  = true;
                $scope.showSuccesCreate = false;
                $scope.errorMessage = res.message;
            }
            $scope.showCalendarInfos = false;
            $scope.$apply();
        });
    }


    $scope.deleteCalendar = function(name){

        if (!confirm("are you sure you want to delete this event!")) return;

        deleteCalendar({name_calendar: name},function(res){
             if(res.action){
                $scope.showError  = false;
                $scope.showSuccesCreate = false;
                $scope.showSuccesDelete = true;
                $scope.showCalendarInfos = false;
                $scope.succesMessageDeleteCalendar = res.message;
            }else{
                $scope.showError  = true;
                $scope.showSuccesCreate = false;
                $scope.showSuccesDelete = false;
                $scope.errorMessage = res.message;
                $scope.showCalendarInfos = true;
            }
            
            $scope.$apply();
        });
    }



    $scope.getCalendarInfos = function(name){
        getCalendarInfos(name,function(res){
            
            if(res.exists){
                
                $scope.data = res.data;
                $scope.showCalendarInfos = true;
                $scope.showError  = false;
                $scope.errorMessage = "";
            }else{
                $scope.showCalendarInfos = false;
                $scope.errorMessage = res.message;
                $scope.showError = true;
            }
            $scope.showSuccesCreate = false;
            $scope.showSuccesDelete = false;
            $scope.$apply();
        });
    }

}]);
