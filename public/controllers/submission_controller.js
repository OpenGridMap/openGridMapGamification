var subApp = angular.module('subApp', ['ngAnimate', 'ngRoute', 'angularGrid', 'uiGmapgoogle-maps', 'serviceApp']);
// subApp.config(function($httpProvider) {
//     $httpProvider.interceptors.push('myHttpInterceptor');
//     var spinnerFunction = function(data, headersGetter) {
//         // todo start the spinner here
//         //alert('start spinner');
//         $('#mydiv').show();
//         return data;
//     };
//     $httpProvider.defaults.transformRequest.push(spinnerFunction);
// })

// subApp.factory('myHttpInterceptor', function($q, $window) {
//     return function(promise) {
//         return promise.then(function(response) {
//             // do something on success
//             // todo hide the spinner
//             //alert('stop spinner');
//             $('#mydiv').hide();
//             return response;

//         }, function(response) {
//             // do something on error
//             // todo hide the spinner
//             //alert('stop spinner');
//             $('#mydiv').hide();
//             return $q.reject(response);
//         });
//     };
// });

subApp.factory("userService", function() {
    var user = {};
    user.save = function(user) {
        user.value = user;
    }
    user.read = function() {
        return user.value;
    }
    return user;
});




subApp.controller('Sub_Ctrl', ['$scope', '$http', '$window', '$timeout', function($scope, $http, $window, $timeout) {
    var shadow_copy = [];
    $scope.submissions = [];
    $scope.submissions_pos = [];

    $scope.searchText = '';
    $scope.comment = '';

    $scope.rateMap = new Object();
    $scope.likeMap = new Object();
    $scope.postMap = new Object();
    $scope.likePostMap = new Object();

    // check if user rated before or not to display correctly
    $scope.isRated = function(id) {
        for (r in $scope.userRatings) {
            if (($scope.userRatings[r].submission_id) == id) {
                var div = $('#' + id);
                div.removeClass('alert-success');
                div.addClass('alert-danger');
                $('#' + id + '> div').css('pointer-events', 'none');
                return true;
            }
        }
        return false;

    };
    // get all submissions from pgis
    $.get('http://vmjacobsen39.informatik.tu-muenchen.de/submissions', function(response) {
        $scope.submissions = response;
    }).then(function() {
        $.get('/getAllAverageSubmissionRate', function(response) {
            $scope.rateMap = response;
        }).then(function() {
            $.get('/getAllLikesAndDislikes', function(response) {
                $scope.likeMap = response;
            }).then(function() {
                $.get('/getAllSubmissionPosts', function(response) {
                    $scope.postMap = response;
                }).then(function() {
                    for (var s in $scope.submissions) {

                        $scope.submissions_pos.push({
                            "submission": $scope.submissions[s],
                            "rating": $scope.rateMap[$scope.submissions[s].id] ? $scope.rateMap[$scope.submissions[s].id] : 1,
                            "likes": $scope.likeMap[$scope.submissions[s].id] ? $scope.likeMap[$scope.submissions[s].id].likes : 0,
                            "dislikes": $scope.likeMap[$scope.submissions[s].id] ? $scope.likeMap[$scope.submissions[s].id].dislikes : 0,
                            "posts": $scope.postMap[$scope.submissions[s].id] ? $scope.postMap[$scope.submissions[s].id] : [],
                            "map": {
                                center: {
                                    latitude: $scope.submissions[s].points[0].latlng[0],
                                    longitude: $scope.submissions[s].points[0].latlng[1]
                                },
                                zoom: 12
                            },
                            "options": { scrollwheel: false },
                            "marker": {
                                id: $scope.submissions[s].points[0].id,
                                coords: {
                                    latitude: $scope.submissions[s].points[0].latlng[0],
                                    longitude: $scope.submissions[s].points[0].latlng[1]
                                },
                                options: { draggable: false }
                            }
                        });

                    }
                    shadow_copy = $scope.submissions_pos;
                });
            });
        });
    });

    $timeout(function() {
        $('#mydiv').hide();
    }, 7000);


    //search functionality
    $scope.search = function() {
        var foundItems = [];
        $scope.submissions_pos = shadow_copy;
        if (!$scope.searchText) {
            $scope.submissions_pos = shadow_copy;
        } else {
            for (var sp in $scope.submissions_pos) {
                var tag = $scope.submissions_pos[sp].submission.points[0].properties.tags.power_element_tags[0],
                    user = $scope.submissions_pos[sp].submission.user;
                if ((tag.indexOf($scope.searchText) != -1) || (user.indexOf($scope.searchText) != -1)) {
                    foundItems.push($scope.submissions_pos[sp]);
                }
            }
            $scope.submissions_pos = foundItems;
        }
    };

    //rating 
    var user_id = parseURL(window.location.href).pathname.split('/');
    user_id = user_id[user_id.length - 1];
    $scope.userRatings = [];

    //get all user ratings from system    
    $http({
            method: 'GET',
            url: '/getAllSubmissionRate/' + user_id
        })
        .then(function successCallback(response) {
                $scope.userRatings = response.data;
            },
            function errorCallback(response) {
                console.log(err)
            });

    // init like and dislike widgets for submissions
    $scope.incLike = function(id) {
        var likes = $('#like-' + id);
        var dislikes = $('#dislike-' + id);
        likes.text(parseInt(likes.text()) + 1);
        var obj = {
            "submission_id": id,
            "user_id": user_id,
            "likes": parseInt(likes.text()),
            "dislikes": parseInt(dislikes.text())
        };

        $.post('/likeAndDislikeSubmission', obj, function(response) {});
    }

    $scope.incDislike = function(id) {
        var likes = $('#like-' + id);
        var dislikes = $('#dislike-' + id);
        dislikes.text(parseInt(dislikes.text()) - 1);
        var obj = {
            "submission_id": id,
            "user_id": user_id,
            "likes": parseInt(likes.text()),
            "dislikes": parseInt(dislikes.text())
        };

        $.post('/likeAndDislikeSubmission', obj, function(response) {});
    }

    // init like and dislike widgets for posts
    $scope.incLikePost = function(id) {
        var likes = $('#likePost-' + id);
        var dislikes = $('#dislikePost-' + id);
        likes.text(parseInt(likes.text()) + 1);
        var obj = {
            "post_id": id,
            "user_id": user_id,
            "likes": parseInt(likes.text()),
            "dislikes": parseInt(dislikes.text())
        };

        $.post('/likeAndDislikePost', obj, function(response) {});
    }

    $scope.incDislikePost = function(id) {
        var likes = $('#likePost-' + id);
        var dislikes = $('#dislikePost-' + id);
        dislikes.text(parseInt(dislikes.text()) - 1);
        var obj = {
            "post_id": id,
            "user_id": user_id,
            "likes": parseInt(likes.text()),
            "dislikes": parseInt(dislikes.text())
        };

        $.post('/likeAndDislikePost', obj, function(response) {});
    }

    //calcuate the overall rating of a submission
    $scope.getAverageRating = function(id) {
        if (!rateMap[id]) {
            return 1;
        }
        return rateMap[id];
    }

    //save athe rate of a submission by a user
    $scope.rate = function(param, id) {
        var rating_object = {
            "submission_id": id,
            "rating": param,
            "user_id": user_id
        }; // save new rating
        $http.post('/rateSubmission', rating_object, function(response) {}).then(function() {
            $.get('/getAllSubmissionRate/' + user_id, function(response) {
                $scope.userRatings = response;

            }).then(function() {
                $.get('/getAllAverageSubmissionRate', function(response) {
                    return response;
                }).then(function(response) {
                    for (i in $scope.submissions_pos) {
                        $scope.$apply(function() {
                            $scope.submissions_pos[i].rating = response[$scope.submissions_pos[i].submission.id];
                        });
                        $scope.$digest();
                    }

                }).then(function() {
                    $scope.isRated(id);
                });
            });
        });
    };

    //create post
    $scope.createPost = function(obj) {
        var comment = document.getElementById('icon_prefix' + obj.submission.id).value;
        var post = {
            "submission_id": obj.submission.id,
            "user_id": user_id,
            "comment_string": comment,
            "rating": 0
        };

        $.post('/createSubmissionPost', post, function(response) {
            document.getElementById('icon_prefix' + obj.submission.id).value = '';
            var comment = response;
            var likes_dislikes = {
                "likes": 0,
                "dislikes": 0
            };

            for (s in $scope.submissions_pos) {
                if ($scope.submissions_pos[s].submission.id == obj.submission.id) {
                    $scope.$apply(function() {
                        var posts = $scope.submissions_pos[s].posts;
                        posts.push({
                            "comment": comment,
                            "likes_dislikes": likes_dislikes
                        });
                        $scope.submissions_pos[s].posts = posts;
                    });
                    $scope.$digest();

                }
            }
        });
    }
}]);

// parsing brower url for user id and submission id 
function parseURL(url) {
    var parser = document.createElement('a'),
        searchObject = {},
        queries, split, i;
    // Let the browser do the work
    parser.href = url;
    // Convert query string to object
    queries = parser.search.replace(/^\?/, '').split('&');
    for (i = 0; i < queries.length; i++) {
        split = queries[i].split('=');
        searchObject[split[0]] = split[1];
    }
    return {
        protocol: parser.protocol,
        host: parser.host,
        hostname: parser.hostname,
        port: parser.port,
        pathname: parser.pathname,
        search: parser.search,
        searchObject: searchObject,
        hash: parser.hash
    };
}

// creating star rating directive for angular
subApp.directive('starRating', function() {
    return {
        scope: {
            rating: '=',
            maxRating: '@',
            readOnly: '@',
            click: "&",
            mouseHover: "&",
            mouseLeave: "&"
        },
        restrict: 'EA',
        template: "<div style='display: inline-block; margin: 0px; padding: 0px; cursor:pointer;' ng-repeat='idx in maxRatings track by $index'> \
                    <img ng-src='{{((hoverValue + _rating) <= $index) && \"http://www.codeproject.com/script/ratings/images/star-empty-lg.png\" || \"http://www.codeproject.com/script/ratings/images/star-fill-lg.png\"}}' \
                    ng-Click='isolatedClick($index + 1)' \
                    ng-mouseenter='isolatedMouseHover($index + 1)' \
                    ng-mouseleave='isolatedMouseLeave($index + 1)'></img> \
            </div>",
        compile: function(element, attrs) {
            if (!attrs.maxRating || (Number(attrs.maxRating) <= 0)) {
                attrs.maxRating = '5';
            };
        },
        controller: function($scope, $element, $attrs) {
            $scope.maxRatings = [];

            for (var i = 1; i <= $scope.maxRating; i++) {
                $scope.maxRatings.push({});
            };

            $scope._rating = $scope.rating;

            $scope.isolatedClick = function(param) {
                if ($scope.readOnly == 'true') return;

                $scope.rating = $scope._rating = param;
                $scope.hoverValue = 0;
                $scope.click({
                    param: param
                });
            };

            $scope.isolatedMouseHover = function(param) {
                if ($scope.readOnly == 'true') return;

                $scope._rating = 0;
                $scope.hoverValue = param;
                $scope.mouseHover({
                    param: param
                });
            };

            $scope.isolatedMouseLeave = function(param) {
                if ($scope.readOnly == 'true') return;

                $scope._rating = $scope.rating;
                $scope.hoverValue = 0;
                $scope.mouseLeave({
                    param: param
                });
            };
        }
    };
});
