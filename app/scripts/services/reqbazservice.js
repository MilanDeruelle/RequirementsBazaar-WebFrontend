'use strict';

/**
 * @ngdoc service
 * @name requirementsBazaarWebFrontendApp.reqBazService
 * @description
 * # reqBazService
 * Service in the requirementsBazaarWebFrontendApp.
 */
angular.module('requirementsBazaarWebFrontendApp')
  .service('reqBazService', function reqBazService($http) {
    var url = 'http://localhost:8080/bazaar/';

    //Access token
    var accessTokenURL = '';
    var accessTokenURL2 = '';
    this.setAccessToken = function(token){
      if(token !== undefined){
        accessTokenURL = '/?access_token='+token;
        accessTokenURL2 = '&access_token='+token;
      }
    };

    var paginate = function (url,page,per_page){
      if((typeof page !== 'undefined') && (typeof per_page !== 'undefined'))
      {
        url += '?page=' + page + '&per_page=' + per_page;
        url = url + accessTokenURL2;
      }else{
        url = url + accessTokenURL;
      }
      return url;
    };

    /// PROJECTS
    this.getProjects = function (page, per_page) {
      var projectUrl = url + 'projects';
      return $http.get(paginate(projectUrl,page,per_page));
    };

    this.createProject = function(project) {
      var projectUrl = url + 'projects'+accessTokenURL;
      return $http.post(projectUrl, project);
    };

    this.getProject = function (projectId) {
      var projectUrl = url + 'projects';
      return $http.get(projectUrl + '/' + projectId+accessTokenURL);
    };

    ///COMPONENTS

    this.getComponents = function(projectId,page, per_page){
      var componentUrl = url + 'projects/' + projectId + '/components';
      return $http.get(paginate(componentUrl,page,per_page));
    };

    this.createComponent = function(projectId, component) {
      var componentUrl = url + 'projects/' + projectId + '/components'+accessTokenURL;
      return $http.post(componentUrl, component);
    };

    this.getComponent = function (componentId) {
      var componentUrl = url + 'projects/' + 0 + '/components';
      return $http.get(componentUrl + '/' + componentId+accessTokenURL);
    };

    this.deleteComponent = function(projectId,componentId){
      var componentUrl = url + 'projects/' + projectId + '/components';
      return $http.delete(componentUrl + '/' + componentId+accessTokenURL);
    };

    ///REQUIREMENTS
    this.getRequirementsByProject = function(projectId, page, per_page){
      var reqUrl = url + 'projects/' + projectId + '/requirements';
      return $http.get(paginate(reqUrl,page,per_page));
    };

    this.getRequirementsByComponent = function(projectId,componentId,page,per_page){
      var reqUrl = url + 'projects/' + projectId + '/components/' + componentId + '/requirements';
      return $http.get(paginate(reqUrl,page,per_page));
    };

    this.createRequirement = function(projectId, componentId, requirement){
      var reqUrl = url + 'projects/' + projectId + '/components/' + componentId + '/requirements'+accessTokenURL;
      return $http.post(reqUrl, requirement);
    };

    this.getRequirement = function(requirementId){
      var reqUrl = url + 'projects/' + 0 + '/components/' + 0 + '/requirements';
      return $http.get(reqUrl + '/' + requirementId+accessTokenURL);
    };

    this.deleteRequirement = function(requirementId) {
      var reqUrl = url + 'projects/' + 0 + '/components/' + 0 + '/requirements';
      return $http.delete(reqUrl + '/' + requirementId+accessTokenURL);
    };

    //DEV LIST

    this.addUserToDevelopers = function(requirementId){
      var devUrl = url + 'projects/' + 0 + '/components/' + 0 + '/requirements/' + requirementId + '/developers';
      return $http.post(devUrl+accessTokenURL);
    };

    this.removeUserFromDevelopers = function(requirementId){
      var devUrl = url + 'projects/' + 0 + '/components/' + 0 + '/requirements/' + requirementId + '/developers';
      return $http.delete(devUrl+accessTokenURL);
    };

    ///FOLLOWER LIST

    //
    this.addUserToFollowers = function(requirementId){
      var followUrl = url + 'projects/' + 0 + '/components/' + 0 + '/requirements/' + requirementId + '/followers';
      return $http.post(followUrl+accessTokenURL);
    };

    this.removeUserFromFollowers = function(requirementId){
      var followUrl = url + 'projects/' + 0 + '/components/' + 0 + '/requirements/' + requirementId + '/followers';
      return $http.delete(followUrl+accessTokenURL);
    };

    ///VOTE
    this.addVote = function(requirementId, isDownvote){
      var voteUrl = url + 'projects/' + 0 + '/components/' + 0 + '/requirements/' + requirementId + '/vote';
      if (isDownvote){
        voteUrl += '?direction=down';
      } else {
        voteUrl += '?direction=up';
      }
      return $http.post(voteUrl+accessTokenURL2);
    };

    //naming is wrong
    //this.removeUserFromDevelopers = function(requirementId){
    //  var followUrl = url + 'projects/' + 0 + '/components/' + 0 + '/requirements' + requirementId + '/vote';
    //  return $http.delete(reqUrl);
    //};

    /// COMMENTS

    this.getComments = function(requirementId, page, per_page){
      var commentUrl = url + 'projects/' + 0 + '/components/' + 0 + '/requirements/' + requirementId + '/comments';
      return $http.get(paginate(commentUrl,page,per_page));
    };

    this.createComment = function(requirementId,comment){
      var commentUrl = url + 'projects/' + 0 + '/components/' + 0 + '/requirements/' + requirementId + '/comments'+accessTokenURL;
      //commentUrl = commentUrl + accessTokenURL;
      return $http.post(commentUrl, comment);
    };

    this.deleteComment = function(commentId){
      var commentUrl = url + 'projects/' + 0 + '/components/' + 0 + '/requirements/' + 0 + '/comments';
      return $http.delete(commentUrl + '/' + commentId+accessTokenURL);
    };

    ///ATTACHMENTS
    //TODO Attachment Type? I think it is not implemented on backend
    this.createAttachment = function(attachmentType, attachment){
      var attachmentUrl = url + 'projects/' + 0 + '/components/' + 0 + '/requirements/' + 0 + '/attachments';

      attachmentUrl+= '?attachmentType' + attachmentType;

      return $http.post(attachmentUrl+accessTokenURL, attachment);
    };

    this.deleteAttachment = function(attachmentId){
      var attachmentUrl = url + 'projects/' + 0 + '/components/' + 0 + '/requirements/' + 0 + '/attachments';
      return $http.delete(attachmentUrl + '/' + attachmentId+accessTokenURL);
    };

    /// USER
    this.getUser = function(userId) {
      var userUrl = url + 'users';
      return $http.get(userUrl + '/' + userId+accessTokenURL);
    };
  });
