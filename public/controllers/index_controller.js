var indexApp = angular.module('indexApp', ['ngAnimate', 'ngRoute', 'serviceApp']);

indexApp.factory('userService', [function(user) {;
    return {
        userGetter: function() {
            return this.user;
        },
        userSetter: function(user) {
            this.user = user;
        }
    };
}])

indexApp.controller('LoginCtrl', ['$scope', '$http', 'superCache', function($scope, $http, superCache) {
    function onSignIn(googleUser) {
        // Useful data for your client-side scripts:
        var profile = googleUser.getBasicProfile();

        // The ID token you need to pass to your backend:
        var id_token = googleUser.getAuthResponse().id_token;
        var user = {
            "id": profile.getId(),
            "full_name": profile.getName(),
            "given_name": profile.getGivenName(),
            "family_name": profile.getFamilyName(),
            "image": profile.getImageUrl(),
            "email": profile.getEmail()
        }
        $.post('/createOrFindUser', user, function(response) {
            console.log(response);
            return response;
        }).then(function(user) {
            window.location.assign("/home/" + user._id);
        });
    };
    window.onSignIn = onSignIn;
}]);
