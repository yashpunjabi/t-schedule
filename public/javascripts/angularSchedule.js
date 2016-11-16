var app = angular.module('tschedule', ['firebase'])

app.controller('ScheduleCtrl', [
    '$scope',
    '$firebaseAuth',
    '$window',
    function($scope, $firebaseAuth, $window) {
        var auth = $firebaseAuth();
        $scope.user = null;
		$scope.comments = [];

        auth.$onAuthStateChanged(function(user) {
          if (user) {
              $scope.user = user;
          }
        });

        $scope.signout = function() {
            auth.$signOut().then(function() {
                $window.location.href = "/";
            }, function(error) {
                alert("Error during sign out. Try again", error);
            });
        }

		$scope.postComment = function() {
			if ($scope.textComment == '') {
				return;
			}
			$scope.comments.push($scope.textComment);
		    $scope.textComment = '';
		}
    }
]);
