var app = angular.module('tschedule', ['ui.router', 'firebase'])

app.controller('HomeCtrl', [
    '$scope',
    '$firebaseAuth',
    '$window',
    function($scope, $firebaseAuth, $window) {

        var auth = $firebaseAuth();

        auth.$onAuthStateChanged(function(user) {
          if (user) {
              $window.location.href = '/user';
          }
        });


        $scope.signin = function() {

            if ($scope.email == '' || $scope.password == '') {
                return;
            }

            $scope.firebaseUser = null;

            auth.$signInWithEmailAndPassword($scope.email, $scope.password)
                .then(function(user) {
                    $scope.firebaseUser = user;
                })
                .catch(function(error) {
                  var errorCode = error.code;
                  var errorMessage = error.message;
                  alert("" + errorCode + ": " + errorMessage);
                });
            $scope.email = '';
            $scope.password = '';
        };

        $scope.signup = function() {

            if ($scope.fname == '' || $scope.lname == '' || $scope.email == '' || $scope.password == '' || $scope.password2 == '') {
                return;
            }

            if ($scope.password != $scope.password2) {
                alert("Passwords don't match");
                $scope.password = '';
                $scope.password2 = '';
                return;
            }

            $scope.firebaseUser = null;

            auth.$createUserWithEmailAndPassword($scope.email, $scope.password)
                .then(function(user) {
                    user.updateProfile({
                      displayName: $scope.fname + " " + $scope.lname,
                      photoURL: "https://www.keita-gaming.com/assets/profile/default-avatar-c5d8ec086224cb6fc4e395f4ba3018c2.jpg"
                    }).then(function(user) {
                      console.log(user.displayName);
                      $scope.fname = '';
                      $scope.lname = '';
                      $scope.email = '';
                      $scope.password = '';
                      $scope.password2 = '';
                    });

                    $scope.firebaseUser = user;
                    alert("Sucessfully created account!");
                })
                .catch(function(error) {
                  var errorCode = error.code;
                  var errorMessage = error.message;
                  alert("" + errorCode + ": " + errorMessage);
                });
        };

        $scope.signinFacebook = function() {
            var provider = new firebase.auth.FacebookAuthProvider();
            auth.$signInWithPopup(provider)
            .then(function(result) {
                var token = result.credential.accessToken;
                $scope.firebaseUser = result.user;
                var photoURL = "";
                $scope.firebaseUser.providerData.forEach(function (profile) {
                  if (profile.providerId==="facebook.com") {
                      photoURL = "https://graph.facebook.com/" + profile.uid + "/picture?height=500"
                  }
                });
                $scope.firebaseUser.updateProfile({
                  photoURL: photoURL
                });
                alert("login successful, " + $scope.firebaseUser.displayName);
            }).catch(function(error) {
                alert("" + error.code + ": " + error.message);
            });
        }

        $scope.forgotPassword = function() {
			if ($scope.email == '') {
				return;
			}
			auth.$sendPasswordResetEmail($scope.email).then(function() {
				alert("Email Sent Succesfully!");
				$window.location.href = "/";
			}).catch(function(error) {
				alert(error);
			});
			$scope.email = '';
        }
    }
]);


app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('signin', {
                url: '/signin',
                templateUrl: '/signin.ejs',
                controller: 'HomeCtrl',
            });
        $stateProvider
            .state('signup', {
                url: '/signup',
                templateUrl: '/signup.ejs',
                controller: 'HomeCtrl',
            });
		$stateProvider
            .state('forgotPassword', {
                url: '/forgotPassword',
                templateUrl: '/forgotPassword.ejs',
                controller: 'HomeCtrl',
            });

        $urlRouterProvider.otherwise('signin');
    }
])
