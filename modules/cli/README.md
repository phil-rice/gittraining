# Use cases

## Reference data
* A list of email addresses
* A github repo that is the primary
* A list of status critieria(?)

## Usecase - setup
* Fork a repo for that user
* Add the user to the repo as a collaborator
* Setup github actions for the repo
For each stage, if that has been done, skip it. This allows us to modify the list

## Usecase - status
* check if the user has a fork of the repo
* check if the user is a collaborator
* check the last github actions run
* check the last commit date
* potentially execute the status critieria... not sure..

## Usecase - getall
clone all the repos in the list, or update them if they already exist


