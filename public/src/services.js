var CALENDAR_NAME = ""; 


app.service("userService", function($rootScope,$cookieStore) {
    return { 
        isConnected: function() {
            return $cookieStore.get('connection');
        },
        haveRight: function(right){
            var rights = $cookieStore.get('rights');
            return rights?rights.includes(right):false;
        },
        getRights: function(){
            var rights = $cookieStore.get('rights');
            return rights;
        },

        checkSession(callback){
            check_session(function(res){
                if(res.session){
                    var expireDate = new Date();
                    expireDate.setMinutes(expireDate.getMinutes() + 1); //after 1 minute
                    $cookieStore.put('connection',true,{expires: expireDate});
                    $cookieStore.put('rights',res.user.rights,{expires: expireDate});
                    console.log(res.user.rights);
                }
                $rootScope.$broadcast("connectionStateChanged");
                callback(res.session);
            });
        },
        logIn: function(callback){
                this.checkSession(function(){
                    $rootScope.$broadcast("connectionStateChanged");
                    callback();
            });
        }, 
        logOut: function() {
            $cookieStore.remove('connection');
            $cookieStore.remove('rights');
            $rootScope.$broadcast("connectionStateChanged");
        }
    };
});
