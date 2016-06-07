var subApp = angular.module('subApp', ['ngAnimate', 'ngRoute', 'angularGrid', 'uiGmapgoogle-maps', 'serviceApp']);

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


subApp.controller('RankCtrl', ['$scope', '$http', '$window', '$timeout', function($scope, $http, $window, $timeout) {
    $scope.ranking = [];

    $scope.calculateRanking = function() {
        $.get('/getAllUserRankings', function(response) {
            $scope.ranking = response;
            //checkRanking($scope.ranking);
        });
    };

    $scope.calculateRanking();
}]);

function checkRanking(rank) {
    var user_id = parseURL(window.location.href).pathname.split('/');
    user_id = user_id[user_id.length - 1];
    var message = '';
    var obj = {};
    for (r in rank) {
        if (rank[r].user._id == user_id) {
            if (rank[r].totalPoints > 50 && rank[r].totalPoints < 150) {
                obj = { "user_id": user_id, "badge": "BEGINNERS" };
                $.post('/createBadge', obj, function(response) {
                    if (response == 'newlycreated') {
                        message = 'CONGTRATULATIONS !!!! you have just earned the BEGINNERS badge ..';
                        var $toastContent = $('<span>' + message + '</span>');
                        Materialize.toast($toastContent, 5000);
                    }
                });

            }

            if (rank[r].totalPoints > 150 && rank[r].totalPoints < 500) {
                obj = { "user_id": user_id, "badge": "INTERMIDIATE" };
                $.post('/createBadge', obj, function(response) {
                    if (response == 'newlycreated') {
                        message = 'CONGTRATULATIONS !!!! you have just earned the INTERMIDIATE badge ..';
                        var $toastContent = $('<span>' + message + '</span>');
                        Materialize.toast($toastContent, 5000);
                    }
                });
            }

            if (rank[r].totalPoints > 500 && rank[r].totalPoints < 1000) {
                obj = { "user_id": user_id, "badge": "MASTER" };
                $.post('/createBadge', obj, function(response) {
                    if (response == 'newlycreated') {
                        message = 'CONGTRATULATIONS !!!! you have just earned the MASTER badge ..';
                        var $toastContent = $('<span>' + message + '</span>');
                        Materialize.toast($toastContent, 5000);
                    }
                });
            }

            if (rank[r].totalPoints > 1000 && rank[r].totalPoints < 5000) {
                obj = { "user_id": user_id, "badge": "EXPERT" };
                $.post('/createBadge', obj, function(response) {
                    if (response == 'newlycreated') {
                        message = 'CONGTRATULATIONS !!!! you have just earned the EXPERT badge ..';
                        var $toastContent = $('<span>' + message + '</span>');
                        Materialize.toast($toastContent, 5000);
                    }
                });
            }

            if (rank[r].totalPoints > 5000) {
                $.post('/createBadge', obj, function(response) {
                    obj = { "user_id": user_id, "badge": "OUT OF THIS WORLD" };
                    if (response == 'newlycreated') {
                        message = 'CONGTRATULATIONS !!!! you have just earned the OUT OF THIS WORLD badge ..';
                        var $toastContent = $('<span>' + message + '</span>');
                        Materialize.toast($toastContent, 5000);
                    }
                });

            }
        }
    }
};


subApp.controller('Sub_Ctrl', ['$scope', '$http', '$window', '$timeout', function($scope, $http, $window, $timeout) {

    $scope.distance = function(lat1, lon1, lat2, lon2, unit) {
        var radlat1 = Math.PI * lat1 / 180
        var radlat2 = Math.PI * lat2 / 180
        var theta = lon1 - lon2
        var radtheta = Math.PI * theta / 180
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist)
        dist = dist * 180 / Math.PI
        dist = dist * 60 * 1.1515
        if (unit == "K") { dist = dist * 1.609344 }
        if (unit == "N") { dist = dist * 0.8684 }
        return dist
    };
    var shadow_copy = [];
    $scope.submissions = [];
    $scope.my_submissions = [];
    $scope.submissions_pos = [];

    $scope.searchText = '';
    $scope.comment = '';

    $scope.userHasSubmissions = false;

    $scope.rateMap = new Object();
    $scope.likeMap = new Object();
    $scope.postMap = new Object();
    $scope.likePostMap = new Object();

    var user_id = parseURL(window.location.href).pathname.split('/');
    user_id = user_id[user_id.length - 1];

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

    // check if any badges earned 
    $.get('/getAllUserRankings', function(response) {
        checkRanking(response);
    });
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
                }).then(function() {
                    var foundItems = [];
                    $.get('/getUserPgisId/' + user_id, function(response) {
                        if (response) {
                            for (sub in $scope.submissions_pos) {
                                if (response.pgis_id == $scope.submissions_pos[sub].submission.user_id) {
                                    foundItems.push($scope.submissions_pos[sub]);
                                }
                            }
                            $scope.$apply(function() {

                                $scope.my_submissions = [1, 3, 4];
                            });
                        }
                    });
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
                    user = $scope.submissions_pos[sp].submission.user,
                    latlng = $scope.searchText.split(" ");
                if (latlng.length > 1) {
                    var distance = $scope.distance(latlng[0], latlng[1], $scope.submissions_pos[sp].submission.points[0].latlng[0], $scope.submissions_pos[sp].submission.points[0].latlng[1], 'K');
                    //round to 3 decimal places
                    if ((Math.round(distance * 1000) / 1000) <= 50) {
                        foundItems.push($scope.submissions_pos[sp]);
                    }
                } else if ((tag.indexOf($scope.searchText) != -1) || (user.indexOf($scope.searchText) != -1)) {
                    foundItems.push($scope.submissions_pos[sp]);
                }
            }
            $scope.submissions_pos = foundItems;
        }
    };

    //rating 
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
    $scope.incLike = function(id, owner_id) {
        var likes = $('#like-' + id);
        var dislikes = $('#dislike-' + id);
        likes.text(parseInt(likes.text()) + 1);
        var obj = {
            "submission_id": id,
            "pgis_owner_id": owner_id,
            "user_id": user_id,
            "likes": parseInt(likes.text()),
            "dislikes": parseInt(dislikes.text())
        };

        $.post('/likeAndDislikeSubmission', obj, function(response) {
            // check if any badges earned 
            $.get('/getAllUserRankings', function(response) {
                checkRanking(response);
            });
        });
    }

    $scope.incDislike = function(id, owner_id) {
        var likes = $('#like-' + id);
        var dislikes = $('#dislike-' + id);
        dislikes.text(parseInt(dislikes.text()) - 1);
        var obj = {
            "submission_id": id,
            "pgis_owner_id": owner_id,
            "user_id": user_id,
            "likes": parseInt(likes.text()),
            "dislikes": parseInt(dislikes.text())
        };

        $.post('/likeAndDislikeSubmission', obj, function(response) {
            $.get('/getAllUserRankings', function(response) {
                checkRanking(response);
            });
        });
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

        $.post('/likeAndDislikePost', obj, function(response) {
            // check if any badges earned 
            $.get('/getAllUserRankings', function(response) {
                checkRanking(response);
            });
        });
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

        $.post('/likeAndDislikePost', obj, function(response) {
            // check if any badges earned 
            $.get('/getAllUserRankings', function(response) {
                checkRanking(response);
            });
        });
    }

    //calcuate the overall rating of a submission
    $scope.getAverageRating = function(id) {
        if (!rateMap[id]) {
            return 1;
        }
        return rateMap[id];
    }

    //save athe rate of a submission by a user
    $scope.rate = function(param, id, owner_id) {
        var rating_object = {
            "pgis_owner_id": owner_id,
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
                }).then(function() {
                    // check if any badges earned 
                    $.get('/getAllUserRankings', function(response) {
                        checkRanking(response);
                    });
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
        }).then(function() {
            // check if any badges earned 
            $.get('/getAllUserRankings', function(response) {
                checkRanking(response);
            });
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
subApp.directive('onErrorSrc', function() {
    return {
        link: function(scope, element, attrs) {
            element.bind('error', function() {
                if (attrs.src != attrs.onErrorSrc) {
                    attrs.$set('src', attrs.onErrorSrc);
                }
            });
        }
    }
});
