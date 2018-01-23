angular.module('VacationModule').controller('AdministrationVacationController', ['$scope', '$state', '$http', 'toastr', function ($scope, $state, $http, toastr) {

    $scope.me = window.SAILS_LOCALS.me;
    if (!$scope.me.admin) return $state.go('home');


    $scope.recordSave = 'Запись успешно сохранена!';
    // set-up loading state
    $scope.userList = {
        loading: false
    };


    $scope.refresh= function () {
        $http.get('/user/adminUsers')
            .then(function onSuccess(sailsResponse) {

                console.log('sailsResponse: ', sailsResponse);
                $scope.userList.contents = sailsResponse.data;

            })
            .catch(function onError(sailsResponse) {
                //console.log(sailsResponse);
            })
            .finally(function eitherWay() {
                $scope.userList.loading = false;
            });
    };



    $scope.saveData = function (id, change) {
        console.log('change: ', change);
        var theRoute = '/user/update-vacation/' + id;
        $http.put(theRoute, {
                id: id,
                vacation: change
            })
            .then(function onSuccess(sailsResponse) {
                console.log('change22: ', change);
                toastr.success($scope.recordSave, '', {timeOut: 1000});
            })
            .catch(function onError(sailsResponse) {
                $scope.editProfile.errorMsg = 'Произошла непредвиденная ошибка: ' + (sailsResponse.data || sailsResponse.status);
            })
            .finally(function eitherWay() {
                $scope.editProfile.loading = false;
            });
    };

    $scope.checkAll = function (change) {
        let route = '/user/update-vacation-all';
        $http.put(route,{change:change})
            .then(function onSuccess(response) {
                console.log('change202: ', change);
                $scope.refresh();
                toastr.success($scope.recordSave, '');
                $scope.apply();

            })
            .catch(function onError(sailsResponse) {
                $scope.editProfile.errorMsg = 'Произошла непредвиденная ошибка: ' + (sailsResponse.data || sailsResponse.status);
            })
            .finally(function eitherWay() {
                $scope.editProfile.loading = false;
            });
    };

    $scope.refresh();

}]);