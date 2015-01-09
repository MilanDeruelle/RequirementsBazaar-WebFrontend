'use strict';

/**
 * @ngdoc function
 * @name requirementsBazaarWebFrontendApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the requirementsBazaarWebFrontendApp
 */
angular.module('requirementsBazaarWebFrontendApp')
    .controller('MainCtrl', function ($scope, reqBazService) {

    //Index which requirement in the list is selected
    $scope.selectedIndex = -1;

    $scope.projects = null;
    $scope.components = null;
    $scope.requirements = null;
    $scope.activeUser = {id : '2', firstname : 'Max2', lastname : 'Mustermann2', email : 'Max@Mustermann2.de', admin : 'true', Las2PeerId :'2'};

    $scope.projectLeader = null;
    $scope.componentLeader = null;

    $scope.activeProject = null;
    $scope.activeComponent = null;

    $scope.warningText = 'Confirm deletion !';
    $scope.warningVisible = false;

    //init functions that need to be run when the user enters the page
    function getProjects(){
      reqBazService.getProjects()
        .success(function (projs) {
          $scope.projects = projs;
          $scope.activeProject = $scope.projects[0];
          $scope.selectProj($scope.activeProject);

        })
        .error(function (error) {
          $scope.status = 'Unable to load customer data: ' + error.message;
        });
    }

    //Is called when the user selects a new project
    $scope.selectProj = function (project) {
      $scope.activeProject = project;

      reqBazService.getComponents($scope.activeProject.id,'0','30')
        .success(function (comps) {
          $scope.components = comps;
          $scope.activeComponent = $scope.components[0];
          $scope.selectComp($scope.activeComponent);
        })
        .error(function (error) {
          $scope.status = 'ERROR: ' + error.message;
        });
    };

    //Is called when the user has selected a different component
    $scope.selectComp = function (component) {
      $scope.activeComponent = component;
      getUser($scope.activeComponent.leaderId,'component');
      reqBazService.getRequirementsByComponent($scope.activeProject.id,$scope.activeComponent.id)
        .success(function (reqs) {
          $scope.requirements = reqs;
          for(var i = 0; i<$scope.requirements.length;i++){
            //TODO see if I can come up with something better
            $scope.requirements[i].creator = {firstName : 'loading'};
            $scope.requirements[i].leadDeveloper = {firstName : 'loading'};
            $scope.requirements[i].followers = [];
            $scope.requirements[i].developers = [];
            $scope.requirements[i].contributors = [];
            $scope.requirements[i].attachments = [];
            $scope.requirements[i].comments = [];
            $scope.requirements[i].components = [];
          }
          console.log($scope.requirements);
        })
        .error(function (error) {
          $scope.status = 'ERROR: ' + error.message;
        });
    };

    //Queries for users
    function getUser(id,purpose){
      reqBazService.getUser(id)
        .success(function (user) {
          if(purpose === 'component'){
            $scope.componentLeader = user;
          }else if(purpose === 'project'){
            $scope.projectLeader = user;
          }else{

          }
        })
        .error(function (error) {
          console.log(error.message);
          $scope.status = 'ERROR: ' + error.message;
        });
    }

    //Call the init functions
    getProjects();

    $scope.toggleRequirement = function(clickEvent,req) {
      var collapse = clickEvent.target.parentNode.nextElementSibling;
      if(collapse.getAttribute('data-visible') === 'false'){
        console.log('opened requirement');
        collapse.setAttribute('data-visible', 'true');
        //Get all the missing pieces of information, like leader, follower, votes
        reqBazService.getRequirement(req.id)
          .success(function (requirement) {
            console.log(requirement);
            req.creator = requirement.creator;
            req.attachments = requirement.attachments;
            req.components = requirement.components;
            req.leadDeveloper = requirement.leadDeveloper;
            req.followers = requirement.followers;
            req.developers = requirement.developers;
            req.contributors = requirement.contributors;
          })
          .error(function (error) {
            console.log(error.message);
            alert('Something went wrong, please try again');
          });
      }else{
        collapse.setAttribute('data-visible', 'false');
      }

      //toggle visibility of the requirement
      collapse.toggle();
    };

    $scope.toggleAttachments = function(clickEvent) {
      console.log('toggle attachments');
    };
    $scope.toggleComments = function(clickEvent) {
      console.log('toggle comments');
    };



    //Creates a new component
    $scope.showCreateCompDiv = false;
    $scope.newCompName = '';
    $scope.newCompDesc = '';
    $scope.submitNewComponent = function(){
      if($scope.newCompName !== ''){
        console.log('submit new component');
        //TODO leaderId is not used, as there is no user management yet
        var component = {description: $scope.newCompDesc, name: $scope.newCompName, leaderId: 1, projectId: $scope.activeProject.id};
        reqBazService.createComponent($scope.activeProject.id,component)
          .success(function (message) {
            console.log(message);
            //TODO add the new component to the $scope.component and then set everything to default
            component.id = message.id;
            $scope.activeComponent = component;
            $scope.components.push($scope.activeComponent);
            $scope.clearComponentSubmit();
          })
          .error(function (error) {
            console.log(error.message);
            alert('Something went wrong, please try again');
          });
      }else{
        console.log('Input field empty');
        //TODO Show toast
      }
    };
    $scope.clearComponentSubmit = function(){
      $scope.newCompName = '';
      $scope.newCompDesc = '';
      $scope.showCreateCompDiv = false;
    };
    $scope.initDeleteComponent = function () {
      $scope.warningText = 'Confirm deleting the component !';
      $scope.warningVisible = true;
    };
    $scope.resetDeleteComponent = function(){
      $scope.warningText = 'Confirm deletion !';
      $scope.warningVisible = false;
    };
    $scope.deleteComponent = function(){
      $scope.resetDeleteComponent();
      reqBazService.deleteComponent($scope.activeComponent.id)
        .success(function (message) {
          console.log(message);
          for(var i = 0; i<$scope.components.length;i++){
            if($scope.components[i].id === $scope.activeComponent.id){
              $scope.components.splice(i, 1);
              break;
            }
          }
          $scope.activeComponent = null;
          if($scope.components !== null){
            $scope.activeComponent = $scope.components[0];
          }
        })
        .error(function (error) {
          console.log(error.message);
          alert('Could not delete, please try again');
        });
    };

    //Creating a requirement
    $scope.showCreateReqDiv = false;
    $scope.newReqName = '';
    $scope.newReqDesc = '';
    $scope.submitNewReq = function(){
      if($scope.newReqName !== '' && $scope.newReqDesc !== ''){
        console.log('submit requirement');
        var requirement = {title: $scope.newReqName, description: $scope.newReqDesc, projectId: $scope.activeProject.id, leadDeveloperId : 1, creatorId : 1};
        reqBazService.createRequirement($scope.activeProject.id,$scope.activeComponent.id,requirement)
          .success(function (message) {
            //TODO add the requirement to the list
            console.log(message);
          })
          .error(function (error) {
            console.log(error.message);
          });

        $scope.showCreateReqDiv = false;
      }else{
        console.log('Input field empty');
        //TODO Show toast
      }
    };
    $scope.clearReqSubmit = function(){
      $scope.newReqName = '';
      $scope.newReqDesc = '';
      $scope.showCreateReqDiv = false;
    };



    $scope.showMoreClicked = function ($index) {
      if($scope.selectedIndex == $index){
        $scope.selectedIndex = -1;
      }else{
        $scope.selectedIndex = $index;
      }
    };


    /**
     *
     * Function calls that currently don't do anything or don't work
     *
     */
    //Become a follower of a requirement
    $scope.followRequirement = function(clickEvent,req){
      console.log('become follower');
      reqBazService.addUserToFollowers(req.id)
        .success(function (message) {
          console.log(message);
        })
        .error(function (error) {
          console.log(error.message);
          alert('Something went wrong, please try again');
        });
    };


    $scope.signOut = function(){
      window.alert('TODO sign out');
    };

    $scope.editProfile = function(){
      window.alert('TODO');
    };
  });


