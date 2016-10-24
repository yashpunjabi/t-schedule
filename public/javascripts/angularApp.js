var app = angular.module('tschedule', ['ui.router', 'firebase'])

app.controller('HomeCtrl', [
    '$scope',
    '$firebaseAuth',
    '$window',
    function($scope, $firebaseAuth, $window) {

        var auth = $firebaseAuth();

        auth.$onAuthStateChanged(function(user) {
          if (user) {
              $window.location.href = '/schedule';
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
                    alert("Sucessfully logged in!");
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
                    $scope.firebaseUser = user;
                    alert("Sucessfully created account!");
                })
                .catch(function(error) {
                  var errorCode = error.code;
                  var errorMessage = error.message;
                  alert("" + errorCode + ": " + errorMessage);
                });
            $scope.fname = '';
            $scope.lname = '';
            $scope.email = '';
            $scope.password = '';
            $scope.password2 = '';
        };

        //TODO
        $scope.signinFacebook = function() {
            var provider = new firebase.auth.FacebookAuthProvider();
            auth.$signInWithPopup(provider).then(function(result) {
                var token = result.credential.accessToken;
                $scope.firebaseUser = result.user;
                alert("login successful, " + $scope.firebaseUser.displayName);
            }).catch(function(error) {
                alert("" + error.code + ": " + error.message);
            });
        }

        //TODO
        $scope.forgotPassword = function() {
            alert("Coming soon");
        }
    }
]);

app.controller('ScheduleCtrl', [
    '$scope',
    '$firebaseAuth',
    '$window',
    function($scope, $firebaseAuth, $window) {
        var auth = $firebaseAuth();
        var user = auth.currentUser;
        if (user) {
            alert("logged in!");
        } else {
            alert("not logged in");
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
        $urlRouterProvider.otherwise('signin');
    }
])
