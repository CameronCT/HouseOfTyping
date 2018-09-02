var app = angular.module('HouseOfTyping', ['ngRoute', 'ngAnimate', 'ngSanitize', 'relativeDate', 'toaster', 'bbModule', 'ui.bootstrap']);

/* Components */
app.component("navigation", {
    templateUrl: 'views/layout/navigation.html'
});

app.component("footer", {
    templateUrl: 'views/layout/footer.html'
});

/* Factory / Services */
app.factory('profiles', function($http) {
    return {
        grabData: function(limit) { 
            return $http.get('app/php/profiles.php?limit=' + limit).then(function(response) { return { res: response }; }); 
        }
    };
});

app.factory('profile', function($http) {
    return {
        grabData: function(id) { 
            return $http.get('app/php/profile.php?name=' + id).then(function(response) { return { res: response }; }); 
        }
    };
});

app.factory('tournaments', function($http) {
    return {
        grabData: function(limit) { 
            return $http.get('app/php/tournaments.php?limit=' + limit).then(function(response) { return { res: response }; }); 
        }
    };
});

app.factory('tournament', function($http) {
    return {
        grabData: function(id) { 
            return $http.get('app/php/tournament.php?id=' + id, { cache: true }).then(function(response) { return { res: response }; }); 
        }
    };
});

app.factory('twitch', function($http) {
    return {
        grabData: function() { 
            return $http.get('app/php/twitch.php', { cache: true }).then(function(response) { return { res: response }; }); 
        }
    };
});

app.factory('news', function($http) {
    return {
        grabData: function(limit) { 
            return $http.get('app/php/news.php?limit=' + limit).then(function(response) { return { res: response }; }); 
        }
    };
});

app.factory('newsletter', function($http) {
    return {
        grabData: function(id) { 
            return $http.get('app/php/newsletter.php?id=' + id).then(function(response) { return { res: response }; }); 
        }
    };
});

/* Controllers */
app.controller('Home', ['$scope', 'tournaments', 'twitch', 'news', function($scope, tournaments, twitch, news) {
    tournaments.grabData(1).then(function(res) {
        $scope.latestTournament = res.res.data;
    });

    tournaments.grabData(6).then(function(res) {
        $scope.Tournaments = res.res.data;
    });

    twitch.grabData().then(function(res) {
        $scope.Streams = res.res.data;
    });

    news.grabData(10).then(function(res) {
        $scope.News = res.res.data;
    }); 
}]);

app.controller('Tournaments', ['$scope', 'tournaments', function($scope, tournaments) {
    $scope.timeNow = new Date();
    $scope.timeNow.toISOString();
    //$scope.timeNow.toISOString();
    tournaments.grabData(50).then(function(res) {
        $scope.list = res.res.data;
    });
}]); 

app.controller('Tournament', ['$http', '$routeParams', '$interval', '$scope', 'toaster', 'tournament', function($http, $routeParams, $interval, $scope, toaster, tournament) {
    tournament.grabData($routeParams.id).then(function(res) {
        $scope.Tournament = res.res.data;
        $interval(function() { $scope.Tournament.Cache = $scope.Tournament.Cache - 1000; }, 1000, 0);
        $interval(function() { $scope.Tournament.Start = $scope.Tournament.Start - 1000; }, 1000, 0);
        $interval(function() { $scope.Tournament.End = $scope.Tournament.End - 1000; }, 1000, 0);
    });

    $scope.timeNow = new Date();
    $scope.timeNow.toISOString();

    $scope.submitParticipate = function(data) {

        data.tourneyID = $routeParams.id;

        $http.post('app/php/participate.php', data)
        .then(
            function success(response) {
                if (response.data.success)
                    toaster.pop('success', 'Awesome!', response.data.success);
                
                if (response.data.error)
                    toaster.pop('error', 'Uh oh!', response.data.error);
            }, 
            function error(msg) { 
                toaster.pop('error', 'Uh oh!', msg.error);
            }
        );
    }
}]);

app.controller('News', ['$scope', 'news', function($scope, news) {
    news.grabData(50).then(function(res) {
        $scope.News = res.res.data;
    });
}]);

app.controller('Newsletter', ['$routeParams', '$scope', 'newsletter', function($routeParams, $scope, newsletter) {
    newsletter.grabData($routeParams.id).then(function(res) {
        $scope.Newsletter = res.res.data;
    });
}]);

app.controller('Profiles', ['$scope', 'profiles', function($scope, profiles) {

    profiles.grabData(50).then(function(res) {
        $scope.limit        = 36;
        $scope.page         = 1;

        $scope.ProfilesData = res.res.data;

        $scope.$watch("page + limit", function() {
            var begin = (($scope.page - 1) * $scope.limit);
            var end = begin + $scope.limit;
            $scope.Profiles = $scope.ProfilesData.slice(begin, end);
        });
    });
}]);

app.controller('Profile', ['$routeParams', '$scope', '$http', 'profile', function($routeParams, $scope, $http, profile) {
    profile.grabData($routeParams.id).then(function(res) {
        $scope.Profile = res.res.data;
        $scope.timeNow = new Date();
        $scope.timeNow.toISOString();
    });
}]);

/* Routes */
app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            controller:     'Home',
            templateUrl:    'views/home.html'
        })
        .when('/about', {
            templateUrl:    'views/about.html'
        })
        .when('/tournaments', {
            controller:     'Tournaments',
            templateUrl:    'views/tournaments.html'
        })
        .when('/tournament/:id', {
            controller:     'Tournament',
            templateUrl:    'views/tournament.html'
        })
        .when('/news', {
            controller:     'News',
            templateUrl:    'views/news.html'
        })
        .when('/news/:id', {
            controller:     'Newsletter',
            templateUrl:    'views/newsletter.html'
        })
        .when('/profiles', {
            controller:     'Profiles',
            templateUrl:    'views/profiles.html'
        })
        .when('/profile/:id', {
            controller:     'Profile',
            templateUrl:    'views/profile.html'
        })
        .otherwise({
            redirectTo: '/'
        });
});

/* Filters */
app.filter('nl2br', function() {
    var span = document.createElement('span');
    return function(input) {
        if (!input) return input;
        var lines = input.split('\n');

        for (var i = 0; i < lines.length; i++) {
            span.innerText = lines[i];
            span.textContent = lines[i];  //for Firefox
            lines[i] = span.innerHTML;
        }
        return lines.join('<br />');
    }
});

/* App */
app.run(['$rootScope', '$http', function($rootScope, $http) {
    $rootScope.JSDate = function(str){
        if(!str)return null;
        return new Date(str);
    }

    $http.get('app/php/config.php', { cache: true }).then(function(response) { 
        $rootScope.config = response.data;
    });

}]);

/* Non Angular */
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})