var app = angular.module('tschedule', ['ui.router', 'firebase', 'ngNotify'])

app.controller('ForumCtrl', [
    '$scope',
    '$http',
    '$location',
    '$firebaseAuth',
    '$firebaseObject',
    '$firebaseArray',
    '$window',
	'ngNotify',
    '$stateParams',
    function($scope, $http, $location, $firebaseAuth, $firebaseObject, $firebaseArray, $window, ngNotify, $stateParams) {
        var auth = $firebaseAuth();
        var ref = firebase.database().ref();


        $scope.user = null;

        $scope.school = $stateParams.school;
        $scope.class = $stateParams.class;

        if ($scope.school && $scope.class) {
            ref.child('school').child($scope.school).child($scope.class).once('value', function(snapshot) {
                if(!snapshot.val() && !($location.path() === '/search')) {
                    $window.location.href = '/forum#/search';
                }
            });
            $scope.classInfo = $firebaseObject(ref.child('school').child($scope.school).child($scope.class));
            $scope.comments = $firebaseArray(ref.child('school').child($scope.school).child($scope.class).child('comments'));
        }
        if (!$scope.classInfo && !($location.path() === '/search')) {
            $window.location.href = '/forum#/search';
        }

        auth.$onAuthStateChanged(function(user) {
          if (user) {
              $scope.user = user;
          }
        });

        $scope.signout = function() {
            auth.$signOut().then(function() {
                $window.location.href = "/";
            }, function(error) {
				ngNotify.set("Error during signout, try again!", {
				      position: 'top',
					  duration: 350,
					  sticky: true
				});
            });
        }

		$scope.postComment = function() {
			if ($scope.textComment == '') {
				return;
			}

            var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            var date = new Date();
            var dateString = monthNames[date.getMonth()] + " " + date.getDate()
                + ', ' + date.getFullYear();

            var comment = {
                text: $scope.textComment,
                authorUID: $scope.user.uid,
                authorDisplayName: $scope.user.displayName,
                authorPhotoURL: $scope.user.photoURL,
                postedOn: dateString,
                upvotes: 1,
            }

			$scope.comments.$add(comment);

		    $scope.textComment = '';
		}

        $scope.upvote = function(comment) {
            comment.upvotes++;
            $scope.comments.$save(comment);
        }
        $scope.downvote = function(comment) {
            comment.upvotes--;
            $scope.comments.$save(comment);
        }

        $scope.delete = function(comment) {
            if (comment.authorUID === $scope.user.uid) {
                $scope.comments.$remove(comment);
            } else {
                ngNotify.set("You can't delete other people's comments!", {
				      position: 'top',
					  duration: 350,
					  sticky: true
				});
            }
        }


        var SCHOOLS_JSON_URL = "http://coursesat.tech/spring2016/";
        $scope.schools = ["Loading..."];
        if ($location.path() == '/search') {
            $http.get(SCHOOLS_JSON_URL).then(function(response) {
                $scope.schools = response.data['schools'];
            });
        }

        $scope.updateNumbers = function(school) {
            $scope.numbers = null;
            $http.get(SCHOOLS_JSON_URL + school + '/').then(function(response) {
                $scope.numbers = response.data['numbers'];
            });
        }

        $scope.greaterThan = function(x, y) {
            return function(item) {
                return item[x] > y;
            }
        }
    }
]);


app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('forum', {
                url: '/:school/:class',
                templateUrl: '/forum.ejs',
                controller: 'ForumCtrl',
            });
        $stateProvider
            .state('not-found', {
                url: '/search',
                templateUrl: '/not-found.ejs',
                controller: 'ForumCtrl',
            });
        $urlRouterProvider.otherwise('not-found');
    }
]);
