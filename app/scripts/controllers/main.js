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

    $scope.toastText = '';

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

            //This adds the missing attributes to the requirements
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



    /*
    * Everything related to creating or deleting a new component
    *
    * */

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
            if(message.id === 'undefined'){
              $scope.toastText = 'Warning: Component was not created !';
              document.getElementById("feedbackToast").show();
            }else {
              $scope.toastText = 'Component was created';
              document.getElementById("feedbackToast").show();

              //The component is added to be the first element
              component.id = message.id;
              $scope.activeComponent = component;
              $scope.components.splice(0, 0, $scope.activeComponent);
              $scope.clearComponentSubmit();
            }
          })
          .error(function (error) {
            console.log(error.message);
            $scope.toastText = 'Warning: Component was not created !';
            document.getElementById("feedbackToast").show();
          });
      }else{
        $scope.toastText = 'Provide a name & description for the component';
        document.getElementById("feedbackToast").show();
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
      reqBazService.deleteComponent($scope.activeProject.id,$scope.activeComponent.id)
        .success(function (message) {
          console.log(message);
          if(message.success !== "true"){
            $scope.toastText = 'Warning: Component was not deleted !';
            document.getElementById("feedbackToast").show();
          }else {
            for (var i = 0; i < $scope.components.length; i++) {
              if ($scope.components[i].id === $scope.activeComponent.id) {
                $scope.components.splice(i, 1);
                break;
              }
            }
            $scope.activeComponent = null;
            if ($scope.components !== null) {
              $scope.activeComponent = $scope.components[0];
            }
            $scope.toastText = 'Component deleted';
            document.getElementById("feedbackToast").show();
          }
        })
        .error(function (error) {
          console.log(error.message);
          $scope.toastText = 'Warning: Component was not deleted !';
          document.getElementById("feedbackToast").show();
        });
    };


    /*
     * Everything related to creating or deleting a new requirement
     *
     * */

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
            console.log(message);
            if(message.id === 'undefined'){
              $scope.toastText = 'Warning: Requirement was not created !';
              document.getElementById("feedbackToast").show();
            }else{
              $scope.toastText = 'Requirement was created';
              document.getElementById("feedbackToast").show();

              //Add missing values to the newly created requirement
              requirement.id = message.id;
              requirement.creator = {firstName : 'loading'};
              requirement.leadDeveloper = {firstName : 'loading'};
              requirement.followers = [];
              requirement.developers = [];
              requirement.contributors = [];
              requirement.attachments = [];
              requirement.comments = [];
              requirement.components = [];

              //Add the requirement to the first position
              $scope.requirements.splice(0, 0, requirement);
              $scope.clearReqSubmit();
            }
          })
          .error(function (error) {
            //This method only catches network errors
            console.log(error.message);
            $scope.toastText = 'Warning: Requirement was not created !';
            document.getElementById("feedbackToast").show();
          });

        $scope.showCreateReqDiv = false;
      }else{
        $scope.toastText = 'Provide a name & description for the requirement';
        document.getElementById("feedbackToast").show();
      }
    };
    $scope.clearReqSubmit = function(){
      $scope.newReqName = '';
      $scope.newReqDesc = '';
      $scope.showCreateReqDiv = false;
    };
    $scope.deleteRequirement = function(req){
      console.log('delete requirement');
      reqBazService.deleteRequirement(req.id)
        .success(function (message) {
          if(message.success !== "true"){
            $scope.toastText = 'Warning: Requirement was not deleted';
            document.getElementById("feedbackToast").show();
          }else{
            // Delete the removed requirement from the list
            for(var i = 0; i<$scope.requirements.length;i++){
              if($scope.requirements[i].id === req.id){
                $scope.requirements.splice(i, 1);
                break;
              }
            }
            $scope.toastText = 'Requirement deleted';
            document.getElementById("feedbackToast").show();
          }
        })
        .error(function (error) {
          //This error only catches network errors
          console.log(error.message);
          $scope.toastText = 'Warning: Requirement was not deleted';
          document.getElementById("feedbackToast").show();
        });
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

    //Call the init functions
    getProjects();

  });


