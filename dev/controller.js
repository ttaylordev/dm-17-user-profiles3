(function(){
  'use strict';
  angular.module('userProfiles').controller('MainController', ['$scope', 'mainService', function($scope, mainService) {
    $scope.getUsers = () => {
      mainService.getUsers().then(function(dataFromService) {
        $scope.users = dataFromService;
      });
    }

    $scope.getUsers();

  }]);
})();
