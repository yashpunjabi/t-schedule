var app = angular.module('tschedule', ['ui.router', 'firebase', 'ngNotify'])

app.controller('ForumCtrl', [
    '$scope',
    '$firebaseAuth',
    '$firebaseObject',
    '$firebaseArray',
    '$window',
	'ngNotify',
    '$stateParams',
    function($scope, $firebaseAuth, $firebaseObject, $firebaseArray, $window, ngNotify, $stateParams) {
        var auth = $firebaseAuth();
        var ref = firebase.database().ref();


        $scope.user = null;

        $scope.school = $stateParams.school;
        $scope.class = $stateParams.class;

        if ($scope.school && $scope.class) {
            $scope.classInfo = $firebaseObject(ref.child('school').child($scope.school).child($scope.class));
            $scope.comments = $firebaseArray(ref.child('school').child($scope.school).child($scope.class).child('comments'));
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

            // push(comment);
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
                alert("You can't delete other people's comments");
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
                url: '/not-found',
                templateUrl: '/not-found.ejs',
                controller: 'ForumCtrl',
            });
        $urlRouterProvider.otherwise('not-found');
    }
]);
