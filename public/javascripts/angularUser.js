var app = angular.module('tschedule', ['firebase'])


app.controller('UserCtrl', [
    '$scope',
    '$firebaseAuth',
    '$window',
    function($scope, $firebaseAuth, $window) {
        var auth = $firebaseAuth();
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
