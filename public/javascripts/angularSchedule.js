var app = angular.module('tschedule', ['firebase']);
var CURR_SEMESTER = "spring2016";

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

        $scope.emptyCalendar = function() {
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
        }
        $scope.emptyCalendar();

        function getUserProfile() {
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

            $scope.schedule.$loaded().then(function() {
                $scope.populateCalendar();
            });
        }

        $scope.populateCalendar = function() {
            angular.forEach($scope.schedule, function(course) {
                var sectionRef = ref.child('school').child(course.school).child(course.number).child('sections').orderByChild('section_id').equalTo(course.section);
                sectionRef.once('value', function(snapshot) {
                    var value = getFirstNonNull(snapshot.val());
                    angular.forEach(value.meetings, function(meeting) {
                        angular.forEach(meeting.days, function(day) {
                            addMeetingToCalendar(course, day, meeting.time, meeting.location);
                        });
                    });
                    console.log($scope.tableCols);
                });
            });
        }

        function getFirstNonNull(values) {
            var val;
            angular.forEach(values, function(value) {
                if (value) {
                    val = value;
                    return;
                }
            });
            return val;
        }

        function addMeetingToCalendar(course, day, time, location) {
            var dayOffset = getDayOffset(day);
            var timeOffset = getTimeOffset(time);
            var timeDuration = getTimeDuration(time);

            console.log(course.school + course.number + "- offset:" + timeOffset + " length:" + timeDuration + " day: " + dayOffset);

            var offset = 0;
            var keepGoing = true;
            // for (var i = 0; i < $scope.tableCols[dayOffset].length; i++) {
            //     var row = $scope.tableCols[dayOffset][i];
            //     var nextRow = null;
            //     if (i < $scope.tableCols[dayOffset].length - 1) {
            //         nextRow = $scope.tableCols[dayOffset][i + 1]
            //     }
            //
            // }
            angular.forEach($scope.tableCols[dayOffset], function(row) {
                console.log(course.school + course.number + " curr offset: " + offset);
                if (offset + row.rowspan > timeOffset && keepGoing) {
                    if (row.hasData) {
                        alert("conflict");
                        $scope.delete(course);
                    } else {
                        var oldRowspan = row.rowspan;
                        var removeIndex = $scope.tableCols[dayOffset].indexOf(row);
                        $scope.tableCols[dayOffset].splice(removeIndex, 1);
                        var addedBefore = 0;
                        if (timeOffset - offset > 0) {
                            var rowData1 = {
                                hasData: false,
                                name: "",
                                location: "",
                                rowspan: (timeOffset - offset)
                            }
                            $scope.tableCols[dayOffset].splice(removeIndex, 0, rowData1);
                            addedBefore = 1;
                        }

                        var rowData2 = {
                            hasData: true,
                            name: course.school + " " + course.number,
                            location: location,
                            rowspan: timeDuration
                        }
                        $scope.tableCols[dayOffset].splice(removeIndex + addedBefore, 0, rowData2);

                        if (timeOffset - offset + timeDuration < oldRowspan) {
                            var rowData3 = {
                                hasData: false,
                                name: "",
                                location: "",
                                rowspan: oldRowspan - (timeDuration + timeOffset - offset)
                            }
                            $scope.tableCols[dayOffset].splice(removeIndex + addedBefore + 1, 0, rowData3);
                        }
                        console.log(course.school + course.number + " added to array for day " + dayOffset + " and offset " + offset);
                    }
                    keepGoing = false;
                }
                if (keepGoing) {
                    offset += row.rowspan;
                    console.log("Offset updated by " + row.rowspan);
                }
            });
        }

        function getDayOffset(day) {
            switch(day) {
                case 'M':
                    return 0;
                    break;
                case 'T':
                    return 1;
                    break;
                case 'W':
                    return 2;
                    break;
                case 'R':
                    return 3;
                    break;
                case 'F':
                    return 4;
                    break;
                case 'S':
                    return 5;
                    break;
                case 'N':
                    return 6;
                    break;
            }
        }

        function getTimeOffset(time) {
            var colonAt = time.indexOf(":");
            var startTime = parseInt(time.substring(0, colonAt).trim());
            var isAm = time.includes("am");
            if (!isAm) {
                startTime += 12;
            }
            startTime -= 8;
            startTime *= 2;
            //in case it is 9:25 or 9:35
            var isHalfHour = time.substring(colonAt, colonAt + 2).includes("3") || time.substring(colonAt, colonAt + 2).includes("2");;
            //in case it is 9:55
            var isEndOfHour = time.substring(colonAt, colonAt + 2).includes("5");
            if (isHalfHour) {
                startTime += 1;
            }
            if (isEndOfHour) {
                startTime += 2;
            }
            return startTime;
        }

        function getTimeDuration(time) {
            var startTime = time.substring(0, time.indexOf("-"));
            var endTime = time.substring(time.indexOf("-") + 1);
            return getTimeOffset(endTime) - getTimeOffset(startTime);
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
            $scope.schedule.$remove(course).then(function() {
                $scope.emptyCalendar();
                $scope.populateCalendar();
            });
        }

    }
]);

app.controller('CourseListCtrl', [
    '$scope',
    '$firebaseObject',
    '$firebaseArray',
    function($scope, $firebaseObject, $firebaseArray) {
        var ref = firebase.database().ref();

        var classData = $firebaseObject(ref.child('school').child($scope.course.school).child($scope.course.number));
        classData.$loaded().then(function() {
            $scope.courseName = classData.name;
            $scope.courseSections = classData.sections;
        });

        $scope.dropIt = $scope.course.section === '';

        $scope.selectedSection = {
            val: $scope.course.section
        };

        $scope.updateSection = function() {
            if ($scope.course.section === $scope.selectedSection.val) {
                return;
            }
            $scope.course.section = $scope.selectedSection.val;
            $scope.schedule.$save($scope.course).then(function() {
                $scope.emptyCalendar();
                $scope.populateCalendar();
            });
        }
    }
]);
