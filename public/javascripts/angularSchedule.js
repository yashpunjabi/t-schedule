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

        //get currently signed in user
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

        //used in filterBy's to sort classes in ascending order
        $scope.greaterThan = function(x, y) {
            return function(item) {
                return item[x] > y;
            }
        }

        //helps with looping in the html since only for each loops are allowed
        $scope.range = function(x) {
            return new Array(x);
        }

        //removes all classes from the calendar view
        $scope.emptyCalendar = function() {
            $scope.credits = 0;
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

        //gets user data from the database and populates the calendar view with their classes
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

        //populates the calendar view with the users classes - sums the credit hours count as well
        $scope.populateCalendar = function() {
            angular.forEach($scope.schedule, function(course) {
                var classData = $firebaseObject(ref.child('school').child(course.school).child(course.number));
                classData.$loaded().then(function() {
                    var credits = classData.hours;
                    credits = credits.trim().substring(0, 1);
                    credits = parseInt(credits);
                    $scope.credits += credits;
                });
                //adds each meeting to the calendar
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

        //helps when firebase returns an array instead of a single object
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

        //adds a meeting to the calendar - a course can consist of more than one meeting
        function addMeetingToCalendar(course, day, time, location) {
            var dayOffset = getDayOffset(day);
            var timeOffset = getTimeOffset(time);
            var timeDuration = getTimeDuration(time);

            console.log(course.school + course.number + "- offset:" + timeOffset + " length:" + timeDuration + " day: " + dayOffset);

            var offset = 0; //current position in the array
            var keepGoing = true; //because there is no way to break out of a angular for each loop
            angular.forEach($scope.tableCols[dayOffset], function(row) {
                console.log(course.school + course.number + " curr offset: " + offset);
                if (offset + row.rowspan > timeOffset && keepGoing) {
                    if (row.hasData) {
                        alert("conflict");
                        $scope.delete(course);
                    } else {
                        //removes the current object and adds a class in place
                        //maintains the correct offset by adding more objects in front of or behind the class if needed
                        var oldRowspan = row.rowspan;
                        var currIndex = $scope.tableCols[dayOffset].indexOf(row);
                        $scope.tableCols[dayOffset].splice(currIndex, 1);
                        if (timeOffset - offset > 0) {
                            var rowData1 = {
                                hasData: false,
                                name: "",
                                location: "",
                                rowspan: (timeOffset - offset)
                            }
                            $scope.tableCols[dayOffset].splice(currIndex, 0, rowData1);
                            currIndex += 1;
                        }

                        var rowData2 = {
                            hasData: true,
                            name: course.school + " " + course.number,
                            location: location,
                            rowspan: timeDuration
                        }
                        $scope.tableCols[dayOffset].splice(currIndex, 0, rowData2);
                        currIndex += 1;

                        if (timeOffset - offset + timeDuration < oldRowspan) {
                            var rowData3 = {
                                hasData: false,
                                name: "",
                                location: "",
                                rowspan: oldRowspan - (timeDuration + timeOffset - offset)
                            }
                            $scope.tableCols[dayOffset].splice(currIndex, 0, rowData3);
                        }
                        console.log(course.school + course.number + " added to array for day " + dayOffset + " and offset " + offset);
                    }
                    keepGoing = false; //end the looping
                }
                if (keepGoing) {
                    //increment
                    offset += row.rowspan;
                    console.log("Offset updated by " + row.rowspan);
                }
            });
        }

        //to index into the calendar backing array
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

        //used to insert a class into the calendar backing array at the correct offset
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

        //how long the class is. (1 hour = size 2)
        function getTimeDuration(time) {
            var startTime = time.substring(0, time.indexOf("-"));
            var endTime = time.substring(time.indexOf("-") + 1);
            return getTimeOffset(endTime) - getTimeOffset(startTime);
        }

        //populates the dropdown menu to search for schools
        var SCHOOLS_JSON_URL = "http://coursesat.tech/spring2016/";
        $scope.schools = ["Loading..."];
        $http.get(SCHOOLS_JSON_URL).then(function(response) {
            $scope.schools = response.data['schools'];
        });

        //when a school is picked, this populates the dropdown menu with classes from that school
        $scope.updateNumbers = function(school) {
            $scope.numbers = null;
            $http.get(SCHOOLS_JSON_URL + school + '/').then(function(response) {
                $scope.numbers = response.data['numbers'];
            });
        }

        //pushes a class to the user's database entry
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
            var classData = $firebaseObject(ref.child('school').child(course.school).child(course.number));
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
    '$http',
    function($scope, $firebaseObject, $firebaseArray, $http) {

        function getLastName(name) {
            return name.substring(name.lastIndexOf(" ") + 1, name.length);
        }
        var ref = firebase.database().ref();
        var classData = $firebaseObject(ref.child('school').child($scope.course.school).child($scope.course.number));
        //gets ratemyprofessor rating for each instructor and adds it to the end of their name.
        classData.$loaded().then(function() {
            $scope.courseName = classData.name;
            $scope.courseSections = classData.sections;
            angular.forEach($scope.courseSections, function(section) {
                angular.forEach(section.instructors, function(instructor) {
                    $http.get("https://ratesbu-wrapper-api.appspot.com/Georgia%20Institute%20of%20Technology/" + getLastName(instructor))
                    .success(function(response) {
                        //if the rating is found
                        if (response) {
                            //find the professor in the backing array and append the rating to their name
                            //does not update it in the database so that fresh ratings are used each time
                            for (var i = 0; i < $scope.courseSections.length; i++) {
                                for (var j = 0; j < $scope.courseSections[i].instructors.length; j++) {
                                    if ($scope.courseSections[i].instructors[j] === instructor) {
                                        $scope.courseSections[i].instructors[j] += " ★"+ response.avgRating;
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

        //have the class display the sections by default for classes where the
        //user hasn't chosen a section yet
        $scope.dropIt = $scope.course.section === '';

        //dictionary used to comply with radio button standards
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
