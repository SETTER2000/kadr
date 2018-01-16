angular.module('EmergenceModule').controller('AdministrationEmergenceController', ['$scope', '$state', '$http', 'toastr', function ($scope, $state, $http, toastr) {

    $scope.me = window.SAILS_LOCALS.me;
    if (!$scope.me.admin) $state.go('home');


    $scope.recordSave = 'Запись успешно сохранена!';
    // set-up loading state
    $scope.userList = {
        loading: false
    };

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


    $scope.saveAdmin = function (id, change) {

        //console.log('id: ', id);
        //console.log('change: ', change);
        var theRoute = '/user/update-admin/' + id;

        // Submit PUT request to Sails.
        $http.put(theRoute, {
                id: id,
                admin: change
            })
            .then(function onSuccess(sailsResponse) {

                // Notice that the sailsResponse is an array and not a single object
                // The .update() model method returns an array and not a single record.
                // window.location = '#/profile/' + sailsResponse.data[0].id;

                // $scope.editProfile.loading = false;
                toastr.success($scope.recordSave, '', {timeOut: 1000});
                //console.log('sailsResponse: ', sailsResponse);
            })
            .catch(function onError(sailsResponse) {
                // console.log(sailsResponse);
                // Otherwise, display generic error if the error is unrecognized.
                $scope.editProfile.errorMsg = 'Произошла непредвиденная ошибка: ' + (sailsResponse.data || sailsResponse.status);

            })
            .finally(function eitherWay() {
                $scope.editProfile.loading = false;
            });

    };

    $scope.saveKadr = function (id, change) {
        var theRoute = '/user/update-kadr/' + id;
        $http.put(theRoute, {
                id: id,
                kadr: change
            })
            .then(function onSuccess(sailsResponse) {
                toastr.success($scope.recordSave, '', {timeOut: 1000});
                //console.log('sailsResponse: ', sailsResponse);
            })
            .catch(function onError(sailsResponse) {
                $scope.editProfile.errorMsg = 'Произошла непредвиденная ошибка: ' + (sailsResponse.data || sailsResponse.status);
            })
            .finally(function eitherWay() {
                $scope.editProfile.loading = false;
            });
    };


    $scope.saveEmergence = function (id, change) {

        //console.log('id: ', id);
        console.log('change: ', change);
        var theRoute = '/user/update-emergence/' + id;

        // Submit PUT request to Sails.
        $http.put(theRoute, {
                id: id,
                emergence: change
            })
            .then(function onSuccess(sailsResponse) {
                console.log('change22: ', change);
                // Notice that the sailsResponse is an array and not a single object
                // The .update() model method returns an array and not a single record.
                // window.location = '#/profile/' + sailsResponse.data[0].id;

                // $scope.editProfile.loading = false;
                // toastr.options.fadeOut = 1000;
                // toastr.success('Successfully Saved!');
                toastr.success($scope.recordSave, '', {timeOut: 1000});
                //console.log('sailsResponse: ', sailsResponse);
            })
            .catch(function onError(sailsResponse) {
                // console.log(sailsResponse);
                // Otherwise, display generic error if the error is unrecognized.
                $scope.editProfile.errorMsg = 'Произошла непредвиденная ошибка: ' + (sailsResponse.data || sailsResponse.status);

            })
            .finally(function eitherWay() {
                $scope.editProfile.loading = false;
            });

    };



    $scope.saveLeader = function (id, change) {
        var theRoute = '/user/update-leader/' + id;
        $http.put(theRoute, {
                id: id,
                leader: change
            })
            .then(function onSuccess(sailsResponse) {
                toastr.success($scope.recordSave, '', {timeOut: 1000});
                //console.log('sailsResponse: ', sailsResponse);
            })
            .catch(function onError(sailsResponse) {
                $scope.editProfile.errorMsg = 'Произошла непредвиденная ошибка: ' + (sailsResponse.data || sailsResponse.status);
            })
            .finally(function eitherWay() {
                $scope.editProfile.loading = false;
            });
    };


    $scope.saveDeleted = function (id, change) {
        var theRoute = '/user/update-deleted/' + id;
        $http.put(theRoute, {
                id: id,
                deleted: change
            })
            .then(function onSuccess(sailsResponse) {
                toastr.success($scope.recordSave, '', {timeOut: 1000});
                //console.log('sailsResponse: ', sailsResponse);
            })
            .catch(function onError(sailsResponse) {
                $scope.editProfile.errorMsg = 'Произошла непредвиденная ошибка: ' + (sailsResponse.data || sailsResponse.status);
            })
            .finally(function eitherWay() {
                $scope.editProfile.loading = false;
            });
    };
}]);