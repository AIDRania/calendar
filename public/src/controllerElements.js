app.directive("showWhenConnected", function (userService) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var showIfConnected = function() {
                if(userService.isConnected()) {
                    $(element).show();
                } else {
                    $(element).hide();
                }
            };
 
            showIfConnected();
            scope.$on("connectionStateChanged", showIfConnected);
        }
    };
});


app.directive("hideWhenConnected", function (userService) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var hideIfConnected = function() {
                if(userService.isConnected()) {
                    $(element).hide();
                } else {
                    $(element).show();
                }
            };
 
            hideIfConnected();
            scope.$on("connectionStateChanged", hideIfConnected);
        }
    };
});


app.directive("showWhenConnectedAdmin", function (userService) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var showIfConnectedAdmin = function() {
                if(userService.isConnected() && userService.haveRight('ADMINISTRATION')) {
                    $(element).show();
                } else {
                    $(element).hide();
                }
            };
 
            showIfConnectedAdmin();
            scope.$on("connectionStateChanged", showIfConnectedAdmin);
        }
    };
});


