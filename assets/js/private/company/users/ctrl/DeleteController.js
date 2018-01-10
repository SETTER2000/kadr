angular.module('UserModule').controller('DeleteController', ['$scope', '$http', 'Users', '$routeParams', 'CONF_MODULE',
    function ($scope, $http, Users, $stateParams) {
        $scope.refresh = function () {
            $scope.item = Users.delete({id: $stateParams.id}, function (users) {
                $scope.users = users;
                // кол-во пользователей
                console.log($scope.users.length);
                console.log($scope.users);
            }, function (err) {
                if (err) console.log(err.message);
            });
        };
        $scope.refresh();
    }]);