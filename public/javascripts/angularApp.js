var app = angular.module('tschedule', ['ui.router', 'firebase', 'ngNotify'])

app.controller('HomeCtrl', [
    '$scope',
    '$firebaseAuth',
    '$window',
	'ngNotify',
    function($scope, $firebaseAuth, $window, ngNotify) {

        var auth = $firebaseAuth();

        //get currently logged in user
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
				  ngNotify.set('Your email or password is incorrect', {
				      position: 'top',
					  duration: 350,
					  sticky: true
				  });
                });
            $scope.email = '';
            $scope.password = '';
        };

        //Creates a user. Displays alerts if there are problems
        $scope.signup = function() {

            if ($scope.fname == '' || $scope.lname == '' || $scope.email == '' || $scope.password == '' || $scope.password2 == '') {
                return;
            }

            if ($scope.password != $scope.password2) {
                ngNotify.set('Passwords do not match', {
				      position: 'top',
					  duration: 350,
					  sticky: true
				});
                $scope.password = '';
                $scope.password2 = '';
                return;
            }

            $scope.firebaseUser = null;

            auth.$createUserWithEmailAndPassword($scope.email, $scope.password)
                .then(function(user) {
                    user.updateProfile({
                      displayName: $scope.fname + " " + $scope.lname,
                      //default avatar/photo
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
					ngNotify.set('Account Successfully created!', {
				      position: 'top',
					  duration: 350
					});
                })
                .catch(function(error) {
                  var errorCode = error.code;
                  var errorMessage = error.message;
				  ngNotify.set("" + errorCode + ": " + errorMessage, {
				      position: 'top',
					  duration: 350
				  });
                });
        };

        $scope.signinFacebook = function() {
            var provider = new firebase.auth.FacebookAuthProvider();
            auth.$signInWithPopup(provider)
            .then(function(result) {
                var token = result.credential.accessToken;
                $scope.firebaseUser = result.user;
                $scope.firebaseUser.providerData.forEach(function (profile) {
                  if (profile.providerId==="facebook.com") {
                      if ($scope.firebaseUser.photoURL==="" || $scope.firebaseUser.photoURL ==="https://www.keita-gaming.com/assets/profile/default-avatar-c5d8ec086224cb6fc4e395f4ba3018c2.jpg") {
                          //set facebook photo as default user image
                          $scope.firebaseUser.updateProfile({
                            photoURL: "https://graph.facebook.com/" + profile.uid + "/picture?height=500"
                          });
                      }
                  }
                });
            }).catch(function(error) {
				ngNotify.set("" + error.code + ": " + error.message, {
				      position: 'top',
					  duration: 350,
					  sticky: true
				});
            });
        }

        $scope.forgotPassword = function() {
			if ($scope.email == '') {
				return;
			}
			auth.$sendPasswordResetEmail($scope.email).then(function() {
				ngNotify.set("Email sent Successfully", {
				      position: 'top',
					  duration: 150,
					  sticky: true
				});
				$window.location.href = "/";
			}).catch(function(error) {
				ngNotify.set("" + error, {
				      position: 'top',
					  duration: 350,
					  sticky: true
				});
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
