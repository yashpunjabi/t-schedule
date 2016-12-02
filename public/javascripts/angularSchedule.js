var app = angular.module('tschedule', ['firebase']);
var CURR_SEMESTER = "spring2016";
var professor;

app.controller('ScheduleCtrl', [
    '$scope',
    '$firebaseAuth',
    '$window',
    '$http',
    '$firebaseObject',
    '$firebaseArray',
    function($scope, $firebaseAuth, $window, $http, $firebaseObject, $firebaseArray) {
        var auth = $firebaseAuth();
        var ref = firebase.database().ref();
        $scope.user = null;
        auth.$onAuthStateChanged(function(user) {
          if (user) {
              $scope.user = user;
              getUserProfile();
          }
        });

        $scope.signout = function() {
            auth.$signOut().then(function() {
                $window.location.href = "/";
            }, function(error) {
				alert(error);
            });
        }

        //used in filterBy's
        $scope.greaterThan = function(x, y) {
            return function(item) {
                return item[x] > y;
            }
        }

        $scope.range = function(x) {
            return new Array(x);
        }

        $scope.tableCols = [];
        for(var i = 0; i < 7; i++) {
            var col = [];
            var rowData = {
                hasData: false,
                name: "",
                location: "",
                rowspan: 30
            }
            col.push(rowData);
            $scope.tableCols.push(col);
        }

        getUserProfile = function() {
            //add user to database if new
            ref.child('users').child($scope.user.uid).once('value', function(snapshot) {
                if (!snapshot.val()) {
                    var userData = {
                        'uid': $scope.user.uid,
                        'displayName': $scope.user.displayName,
                        'photoURL': $scope.user.photoURL,
                        'email': $scope.user.email,
                        CURR_SEMESTER: []
                    }
                    ref.child('users').child(userData.uid).set(userData);
                }
            });

            $scope.schedule = $firebaseArray(ref.child('users').child($scope.user.uid).child(CURR_SEMESTER));
            console.log("user profile retrieved");

            //populate calendar
            //TODO
        }


        var SCHOOLS_JSON_URL = "http://coursesat.tech/spring2016/";
        $scope.schools = ["Loading..."];
        $http.get(SCHOOLS_JSON_URL).then(function(response) {
            $scope.schools = response.data['schools'];
        });

        $scope.updateNumbers = function(school) {
            $scope.numbers = null;
            $http.get(SCHOOLS_JSON_URL + school + '/').then(function(response) {
                $scope.numbers = response.data['numbers'];
            });
        }

        $scope.addToSchedule = function() {
            var scheduleData = {
                'school': $scope.school,
                'number': $scope.number,
                'section': ''
            };
            $scope.schedule.$add(scheduleData);
            $scope.school = '';
            $scope.number = '';
        }

        $scope.getName = function(course) {
            var classData = $firebaseObject(ref.child('school').child(course.school).child(course.number))
            classData.$loaded().then(function() {
                return classData.name;
            });
        }


        $scope.delete = function(course) {
            $scope.schedule.$remove(course);
        }

    }
]);

app.controller('CourseListCtrl', [
    '$scope',
    '$firebaseObject',
    '$firebaseArray',
    '$http',
    function($scope, $firebaseObject, $firebaseArray, $http) {

        function getLastName(name) {
            return name.substring(name.lastIndexOf(" ") + 1, name.length);
        }
        var ref = firebase.database().ref();
        var classData = $firebaseObject(ref.child('school').child($scope.course.school).child($scope.course.number));
        classData.$loaded().then(function() {
            $scope.courseName = classData.name;
            $scope.courseSections = classData.sections;
            angular.forEach($scope.courseSections, function(section) {
                angular.forEach(section.instructors, function(instructor) {
                    $http.get("https://ratesbu-wrapper-api.appspot.com/Georgia%20Institute%20of%20Technology/" + getLastName(instructor))
                    .success(function(response) {
                        if (response) {
                            for (var i = 0; i < $scope.courseSections.length; i++) {
                                for (var j = 0; j < $scope.courseSections[i].instructors.length; j++) {
                                    if ($scope.courseSections[i].instructors[j] === instructor) {
                                        $scope.courseSections[i].instructors[j] += " |  ★"+ response.avgRating;
                                    }
                                }
                            }
                        }
                    })
                    .catch(function(next) {
                        console.log(next.status);
                    });
                });
            });
        });

        $scope.dropIt = $scope.course.section === '';

        $scope.selectedSection = {
            val: $scope.course.section
        };

        $scope.updateSection = function() {
            $scope.course.section = $scope.selectedSection.val;
            $scope.schedule.$save($scope.course);
        }
    }
]);
