var app = angular.module('tschedule', ['firebase']);


app.controller('UserCtrl', [
    '$scope',
	'$firebaseObject',
	'$firebaseArray',
    '$firebaseAuth',
    '$window',
    function($scope, $firebaseObject, $firebaseArray,$firebaseAuth, $window, ImageService) {
        var auth = $firebaseAuth();
		var ref = firebase.database().ref();
		var obj = $firebaseObject(ref);
		var arr = $firebaseArray(ref);
        $scope.user = null;
		

        auth.$onAuthStateChanged(function(user) {
          if (user) {
              $scope.user = user;
              $scope.username = user.displayName;
              $scope.email = user.email;
              $scope.photoURL = user.photoURL;
          }
        });

        $scope.cancel = function() {
            $scope.newPassword = '';
            $scope.confirmNewPassword = '';
			console.log($scope.user)
        }
		
		$scope.stepsModel = [];
		
		$window.onload = function(e) {
			$scope.imageIsLoaded;
		}
		
		$scope.upload_image = function(event) {
			if ($scope.stepsModel.length > 0) {
				return
			}
			var files = event.target.files; //FileList object
			for (var i = 0; i < files.length; i++) {
				 var file = files[i];
					 var reader = new FileReader();
					 reader.onload = $scope.imageIsLoaded; 
					 reader.readAsDataURL(file);
			}
			
			console.log($scope.stepsModel)
		}
				
		$scope.imageIsLoaded = function(e){
			$scope.$apply(function() {
				$scope.stepsModel.push(e.target.result);
			});
		}

        $scope.signout = function() {
            auth.$signOut().then(function() {
                $window.location.href = "/";
            }, function(error) {
                alert("Error during sign out. Try again", error);
            });
        }

        $scope.updateInfo = function() {
            if ($scope.username != $scope.user.displayName) {
                $scope.user.updateProfile({
                    displayName: $scope.username,
                    photoURL: $scope.user.photoURL
                }).then(function() {
                    alert("Name updated!");
                });
            }
            if ($scope.email != $scope.user.email) {
                $scope.user.updateEmail($scope.email).then(function() {

                }, function(error) {
                    alert("There was an error", error, "\n sign out and sign back in and then try again");
                })
            }
            if ($scope.newPassword != "" && $scope.newPassword == $scope.confirmNewPassword) {
                $scope.user.updatePassword($scope.newPassword).then(function() {
                    alert("Password updated!");
                    $scope.newPassword = '';
                    $scope.confirmNewPassword = '';
                }, function(error) {
                    alert("There was an error", error, "\n sign out and sign back in and then try again");
                })
            }
        }
    }
]);

app.factory('ImageService', function() {
  return {
      imageArray : []
  };
});
