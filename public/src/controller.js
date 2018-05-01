
var app = angular.module("myApp", ["ngRoute"]);
console.log("ANGULAR");
app.config(['$routeProvider',function($routeProvider) {
    $routeProvider
    .when("/home", {
        templateUrl : "views/calendar.html",
        controller  : "calendarController" 
    })
    .when("/calendars", {
        templateUrl : "views/calendars.html",
        controller  : "calendarsConroller"
    })
    .when("/profile", {
        templateUrl : "views/profile.html",
        controller  : "profileConroller"
    })
    .when("/registration", {
        templateUrl : "views/registration.html",
        controller  : "registrationConroller"
    })
    .otherwise({
            redirectTo: '/home'
        });
   
}]);


app.controller('calendarController',['$scope',function($scope){

   // $scope.message = "Calendar";
   showCalendar();
   
}]);

app.controller('calendarsConroller',['$scope',function($scope){
    $scope.message = "Calendars";
}]);

app.controller('profileConroller',['$scope',function($scope){
    $scope.message = "Profile";
    $scope.login = login;
    $scope.logout = logout;
}]);
app.controller('registrationConroller',['$scope',function($scope){
    $scope.message = "Registration";
}]);
