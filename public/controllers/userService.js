var serviceApp = angular.module('serviceApp', []);

serviceApp.factory('superCache', ['$cacheFactory', function($cacheFactory) {
    var cache = $cacheFactory('super-cache')
    return {
        setData: function(user) {
            cache.put('user', user)
        },
        getData: function() {
            return cache.get('user');
        }
    }
}]);
serviceApp.factory('submissionService', function() {
    var submissions = [];
    return {
        setData: function(submissions) {
            this.submissions = submissions;
        },
        getData: function() {
            return this.submissions;
        }
    }
});
