var app = angular.module('tschedule', ['firebase', 'ngNotify'])

app.controller('ForumCtrl', [
    '$scope',
    '$firebaseAuth',
    '$window',
	'ngNotify',
    function($scope, $firebaseAuth, $window, ngNotify) {
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
			$scope.comments.push($scope.textComment);

		    $scope.textComment = '';
		}
    }
]);
