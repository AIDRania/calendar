
//initialization of angularjs app
var app = angular.module("myApp", ['ngRoute','ngCookies','moment-picker','colorpicker-dr']);

app.run(function($rootScope, $location, userService) {
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        userService.checkSession(function(session){
            if(!session){
                userService.logOut();
            }
          
            if (next.$$route && next.$$route.authorizedLogin && !userService.isConnected())
                $location.path("login");
            else if(next.$$route && !next.$$route.authorizedLogin && userService.isConnected())
                $location.path("home");
            else if(next.$$route && next.$$route.authorizedLogin 
                && next.$$route.authorizedAdmin && !userService.haveRight('ADMINISTRATION')){
                console.log("YES");
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
        authorizedLogin: true,
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
    .otherwise({
            redirectTo: '/home'
        });
   
}]);



app.controller('mainController',['$scope','$location','userService',function($scope,$location,userService){
    $scope.message =userService.isConnected();
    $scope.isConnected = userService.isConnected();

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
                   $scope.message =userService.isConnected(); 
                });
}]);

app.controller('calendarController',['$scope',function($scope){
   $scope.event_form = {};
   $scope.event_form.title = "";
   $scope.event_form.description = "";
   $scope.event_form.start = "";
   $scope.event_form.end = ""; 
   $scope.event_form.color = "";
   $scope.errorMessage = "";
   $scope.getCalendar = function(name){
    CALENDAR_NAME = $scope.calendar_name;
        showCalendar(name);
   };

   $scope.newEvent = function(event_form){
        var body = new Object();
        body.name_calendar = CALENDAR_NAME;
        body.data = event_form;
        console.log(body);

        addEvent(body,function(res){
            if(res.creation){
                $scope.showSucces = true;
                $scope.showError = false;
                $("#calendar").fullCalendar('refetchEvents');
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
        body.data._id = $scope.idEvent;

        updateEvent(body,function(res){
            if(res.action){
                $scope.showSucces = true;
                $scope.showError = false;
                $("#calendar").fullCalendar('refetchEvents');
            }else{
                $scope.showSucces = false;
                $scope.showError = true;
            }
            $scope.messageEvent = res.message;
            $scope.$apply();
        });

   }



   $scope.deleteEvent = function(id){
    
    console.log(CALENDAR_NAME,id);
    deleteEvent(CALENDAR_NAME,id,function(res){

        if(res.action){
                $scope.showSucces = true;
                $scope.showError = false;
                $("#calendar").fullCalendar('refetchEvents');
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
        //console.log(data);
        login(data,function(res){
            console.log(res);
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

    $scope.submitRegistrationForm = function(data){

        registration(data,function(isCreated){
            $location.path("home");
            $location.replace();
            $scope.$apply();
            //$location.apply();
            console.log($location);
            
        });
    }
}]);

app.controller('adminProfileConroller',['$scope','$location',
            function($scope,$location){
    $scope.search = {users: []};
    $scope.errorMessageGetProfile = "";
    $scope.showError = false;
    $scope.showProfil = false;
    $scope.showSuccesSave = false;
    //$scope.creation = "test";
    $scope.$watch('email', function (val) {
        
        if(val != '' && val != undefined){
            getEmails(val,function(res){
                
                if(res.isExists){
                    console.log(res.emails);
                    $scope.search.users = res.emails;
                }
            });
        }else
            $scope.search.users = [];
    });

    $scope.getProfile = function(email){
        getProfile(email,function(res){
            console.log(res);
            if(res.isExists){
                $scope.userData = res.user;
                $scope.showProfil = true;
                $scope.showError  = false;
                $scope.errorMessageGetProfile = "";
                $scope.rights = res.user.privileges;
                $scope.allRights = ['CREATION','MODIFICATION','DELETION','ADMINISTRATION'];
            }else{
                $scope.showProfil = false;
                $scope.errorMessageGetProfile = res.message;
                $scope.showError = true;
            }
            $scope.$apply();
        });
    }

  $scope.assignRight = function(email,right){
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

    $scope.createCalendar = function(name){
        console.log("OK");
        createCalendar({name: $scope.name},function(res){
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

    $scope.getCalendarInfos = function(name){
        console.log("22");
        getCalendarInfos(name,function(res){
            console.log(res);
            if(res.exists){
                console.log(res);
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
            $scope.$apply();
        });
    }

    $scope.removeCalendar = function(email,right){
      }

}]);
