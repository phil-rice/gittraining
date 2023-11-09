# This is a set of tools for managing training courses based on git

Given a list of emails and details about the course it can

* Create a set of git repos in a target organisation for each email
* Monitor the status of those git repos (for example the number of commits, the state of the git hub actions)

This allows us to quickly set up a training course and monitor the progress of the students.

# Use case 1: initial setup
We are giving a course. We want to give each student a git repo to work in. 

* Put the course details into course.json
* Put the list of students into emails.txt (one email per line)
* Check out the master git repo that we are going to use to create the student repos
* Make sure you are on the correct branch
* `gittraining git setup <branch>` will create the repos. Branch defaults to the current branch
  * It will create a repo for each email in emails.txt
  * It adds the email as a collaborator, with a message for them to accept the invitation
  * It uses the email to derive the name of the repo
  * It is idempotent so it can be run multiple times

# Use case 2: monitoring progress
This is pretty easy
* `gittraining git status` will show the status of all the repos

# Use case 3: the next bit of the course
As we go through courses we want to distribute more things for the people to work on.
For example lesson1 could be intro. Lesson two 'add a controller'. Lesson three 'add a view'. and so on
So we probably just want to push a branch to the students repo

This is exactly the same command as use case 1.

Questions:
Do we want to force push? Do we want to be able to force just one or two emails?
Obviously yes. They will become use cases later

Observations:
* Perhaps one branch is the 'training' branch. It's  under our control. We can checkout and push to it
* That can be the one that the github actions run on.
