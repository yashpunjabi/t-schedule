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

        //Get class data from the database - redirect to search if not found
        if ($scope.school && $scope.class) {
            ref.child('school').child($scope.school).child($scope.class).once('value', function(snapshot) {
                if(!snapshot.val() && !($location.path() === '/search')) {
                    $window.location.href = '/forum#/search';
                }
            });
            $scope.classInfo = $firebaseObject(ref.child('school').child($scope.school).child($scope.class));
            $scope.comments = $firebaseArray(ref.child('school').child($scope.school).child($scope.class).child('comments'));
        }
        //if class not found, redirect to the search page.
        if (!$scope.classInfo && !($location.path() === '/search')) {
            $window.location.href = '/forum#/search';
        }

        //get currently signed in user
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

        //pushes comment to the database with current date
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

        //for the search page - gets list of schools for dropdown
        var SCHOOLS_JSON_URL = "http://coursesat.tech/spring2016/";
        $scope.schools = ["Loading..."];
        if ($location.path() == '/search') {
            $http.get(SCHOOLS_JSON_URL).then(function(response) {
                $scope.schools = response.data['schools'];
            });
        }

        //when a school is selected in the first dropdown, populate the second one
        //with courses under that school
        $scope.updateNumbers = function(school) {
            $scope.numbers = null;
            $http.get(SCHOOLS_JSON_URL + school + '/').then(function(response) {
                $scope.numbers = response.data['numbers'];
            });
        }

        //to help sort the courses in ascending order
        $scope.greaterThan = function(x, y) {
            return function(item) {
                return item[x] > y;
            }
        }
    }
]);

//routing
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
