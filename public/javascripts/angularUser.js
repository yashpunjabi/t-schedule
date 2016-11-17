var app = angular.module('tschedule', ['firebase']);


app.controller('UserCtrl', [
    '$scope',
    '$firebaseAuth',
    '$firebase',
    '$window',
    function($scope, $firebaseAuth, $firebase, $window) {
        var auth = $firebaseAuth();
        var storageRef = firebase.storage().ref();
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
        }


		$scope.upload_image = function(event) {
			var file = event.target.files[0];
            var metadata = {
              'contentType': file.type,
              'user': $scope.user.uid
            };

            $scope.$apply(function () {
                $scope.photoURL = 'https://d13yacurqjgara.cloudfront.net/users/12755/screenshots/1037374/hex-loader2.gif';
            });

            storageRef.child('images/' + $scope.user.uid + "." + file.type).put(file, metadata).then(function(snapshot) {
              console.log('Uploaded a blob or file!');
              console.log(snapshot.downloadURL);

              $scope.$apply(function () {
                  $scope.photoURL = snapshot.downloadURL;
              });



              $scope.user.updateProfile({
                photoURL: snapshot.downloadURL
              });
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
