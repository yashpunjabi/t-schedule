# T-Schedule

T-Schedule is a course scheduling website to help Georgia Tech students register for classes and plan their week! It was made by Team Rocket (#74) as part of Junior Design.

## Instructions to run

* Clone or download this repository.
* Install npm (node package manager) - [Install instructions](https://nodejs.org/en/download/).
* Open a terminal and navigate to the downloaded t-schedule repository.
* Run the command `npm install` on this terminal - you must be in top level directory (i.e. root) of the project.
* Run `npm start` in the same spot - this process will keep running until you hit Ctrl-C to end it.
* Go to localhost:3000 on a web browser to see the website - the website will not be visible if the process from the previous step is not running
* You need to be connected to the internet for the website to work properly

## v1.0 - Release Notes:

### Login Page
* Sign in with email
* Sign in with facebook
* Register for an account
* Forgot password page to reset password - sends you an email to reset your password
* Redirects if it detects you are already logged in
* If you try to visit a page without logging in, you will be redirected back to this page

### Contact Us Page
* Our email and reddit contact information

### User Profile Page
* If logged in with facebook, it uses your facebook profile picture as your t-schedule user image
* If not, it gives you a default "unknown" user image
* Can change user information like Name, email, and password
* Can change the default user image (uses a Georgia Tech themed honeycomb loading bar)

### Schedule Page
* Select a course
* The course will be shown on the weekly scheduler
* Multiple courses can be added
* RateMyProfessor ratings are shown next to the professor's name while selecting a section
* If classes take place at the same time, an alert will pop-up saying they're conflicting and the new class will be deleted from the schedule.

### Forum Page
* Selection screen to go to a specific course's page
* There is a forum page for each available course
* Prerequisites are shown for each course
* Ability to add a comment to the course's forum page
* Ability to upvote or downvote comments
* Comments are sorted in order of upvotes (highest to lowest)
* Comments display the author's name, profile picture, and the date at which it was made
* Comments can be deleted but only by the user who made them

## v1.0 - Known Issues/Bugs:

If you notice a bug or issue not listed here, please report it in the issues section of this repository.

* BUG: The scheduler has issues handling conflicts when part of a class overlaps with the other. It works if one class time encompasses or is equal to the other class time (e.g. If both classes take place from 2pm-3pm it will work. On the other hand, if one class is from 2pm-3pm and the other is from 2.30pm-3.30pm, there will be a problem)
* ISSUE: Schedule page needs 'CORS everywhere' to be enabled on the browser as the API used for RateMyProfessor does not structure their HTTP headers correctly. If it is not enabled, you will simply not see any RMP ratings
* ISSUE: In the forum pages, 'delete' button is shown for every comment, even if they are not written by the user. You still cannot delete someone else's comment though
* BUG: Comments can be upvoted or downvoted multiple times instead of once per user
