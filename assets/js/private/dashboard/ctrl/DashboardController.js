angular.module('DashboardModule')
//.constant('baseUrl', 'http://localhost:1337')
    .controller('DashboardController', ['$scope', '$window','$state', '$stateParams', 'Users', 'toastr', '$resource','$rootScope',
        function ($scope, $window,$state, $stateParams, Users, toastr, $resource,$rootScope) {
            // $scope.deleteEdit = function () {
            //     // $emit - отправка события от текущего scope к родительским scope
            //     // $scope.$emit("deleteUser", item);
            //     // $broadcast - отправка события всем scope от rootScope
            //     // $rootScope.$broadcast("deleteUser", {
            //     //     message: 'GOOOO'
            //     // });
            //     $rootScope.$broadcast("deleteUser", {
            //         message: 'GOOOO'
            //     });
            // };
            //$scope.itemsResource = $resource(baseUrl);

            console.log($window.SAILS_LOCALS.me);
            $scope.data = $window.SAILS_LOCALS.me;

            $scope.sendRequest = function () {
                var promise = $http.post('/user');
                //console.log(promise);
                promise.then(fullfilled, rejected);
                return false
            };

            $scope.refresh = function () {
                $scope.item = Users.get({id: $routeParams.id}, function (users) {
                    $scope.users = users;
                    // кол-во пользователей
                    // console.log($scope.users.length);
                    // console.log($scope.users);
                }, function (err) {
                    if (err) console.log(err.message);
                });
            };
            
            function fullfilled(response) {
                console.log('Status: ' + response.status);
                console.log('Type: ' + response.headers('content-type'));
                console.log('Length: ' + response.headers('content-length'));
                console.log('Length: ' + response.data);
                $scope.items = response.data.users;
            }

            $scope.refresh();
        }]);