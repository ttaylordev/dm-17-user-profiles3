(function(){
  'use strict';
  angular.module('userProfiles').service('mainService', ['$http', '$q', function($http, $q) {

    this.getUsers = () => {
      var deferred = $q.defer();
      $http({
          method: 'GET',
          url: 'http://reqres.in/api/users?page=1'
      }).then(function(response){
        deferred.resolve(response.data.data)
      })
      return deferred.promise;
    }

  }]);
})();
