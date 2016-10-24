var app = angular.module('tschedule', ['firebase'])


app.controller('UserCtrl', [
    '$scope',
    '$firebaseAuth',
    function($scope, $firebaseAuth) {
        var auth = $firebaseAuth();

        auth.$onAuthStateChanged(function(user) {
          if (user) {
              $scope.username = user.displayName;
              $scope.email = user.email;
              $scope.photoURL = user.photoURL;
              user.providerData.forEach(function (profile) {
                if (profile.providerId==="facebook.com") {
                    $scope.photoURL = "https://graph.facebook.com/" + profile.uid + "/picture?height=500"
                }
              });
          }
        });

        $scope.cancel = function() {
            alert("Canceled");
        }

        $scope.updateInfo = function() {
            alert("update coming soon");
        }
    }
]);
