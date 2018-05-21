var CALENDAR_NAME = ""; 


app.service("pathService", function($rootScope,$cookieStore) {
    return { 
        path: [],
        getPath: function(){
            return this.path;
        },
        setPath: function(p){
            this.path = [];
            var split = p.split("/");
            for(let i=1;i<split.length;i++)
                this.path.push(split[i]);
        }
    }

});



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
        getEmail(){
            return $cookieStore.get('email');;
        },
        checkSession(callback){
            
            check_session(function(res){
                if(res.session){

                    var expireDate = new Date();
                    expireDate.setMinutes(expireDate.getMinutes() + 1); //after 1 minute
                    $cookieStore.put('email',res.user.email,{expires: expireDate});
                    $cookieStore.put('connection',true,{expires: expireDate});
                    $cookieStore.put('rights',res.user.privileges,{expires: expireDate});
                   localStorage.setItem('photoProfile',res.photoProfile);
                }
                $rootScope.$broadcast("connectionStateChanged");
                callback(res.session);
            });
        },
        logIn: function(callback){
                this.checkSession(function(){
                    //$rootScope.$broadcast("connectionStateChanged");
                    callback();
            });
        }, 
        logOut: function() {
            $cookieStore.remove('email');
            $cookieStore.remove('connection');
            $cookieStore.remove('rights');
            $rootScope.$broadcast("connectionStateChanged");
        }
    };
});
