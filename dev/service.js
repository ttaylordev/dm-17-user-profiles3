(function(){
  'use strict';
  angular.module('userProfiles').service('mainService', ['$http', '$q', function($http, $q) {
    
    var baseUrl = 'http://reqres.in/api/users?page=1';

    this.getUsers = () => {
      var deferred = $q.defer();
      $http({
          method: 'GET',
          url: baseUrl
      }).then(function(response){
        deferred.resolve(response.data.data)
      })
      return deferred.promise;
    }

  }]);
})();
