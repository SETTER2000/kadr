angular.module('EmergenceModule').controller('AdministrationEmergenceController', ['$scope', '$state', '$http', 'toastr', function ($scope, $state, $http, toastr) {

    $scope.me = window.SAILS_LOCALS.me;
    if (!$scope.me.admin) return $state.go('home');


    $scope.recordSave = 'Запись успешно сохранена!';
    // set-up loading state
    $scope.userList = {
        loading: false
    };

    //$http.get('/user/adminUsers')
    //    .then(function onSuccess(sailsResponse) {
    //
    //        console.log('sailsResponse: ', sailsResponse);
    //        $scope.userList.contents = sailsResponse.data;
    //
    //    })
    //    .catch(function onError(sailsResponse) {
    //        //console.log(sailsResponse);
    //    })
    //    .finally(function eitherWay() {
    //        $scope.userList.loading = false;
    //    });


    $scope.getSetting = function () {
        $http.get('/setting/module/emergence')
            .then(function onSuccess(sailsResponse) {
                console.log('sailsResponse+++: ', sailsResponse);
                $scope.checkSender = sailsResponse.data.checkSender;

            })
            .catch(function onError(sailsResponse) {
                toastr.error(sailsResponse.data,'Ошибка 7010!');
                console.log(sailsResponse.data);
            })
            .finally(function eitherWay() {
                $scope.userList.loading = false;
            });
    };


    $scope.refresh = function () {
        $http.get('/user/adminUsers')
            .then(function onSuccess(sailsResponse) {
                $scope.getSetting();
                //console.log('sailsResponse: ', sailsResponse);
                $scope.userList.contents = sailsResponse.data;

            })
            .catch(function onError(sailsResponse) {
                //console.log(sailsResponse);
            })
            .finally(function eitherWay() {
                $scope.userList.loading = false;
            });
    };
    //
    //$scope.saveAdmin = function (id, change) {
    //
    //    //console.log('id: ', id);
    //    //console.log('change: ', change);
    //    var theRoute = '/user/update-admin/' + id;
    //
    //    // Submit PUT request to Sails.
    //    $http.put(theRoute, {
    //            id: id,
    //            admin: change
    //        })
    //        .then(function onSuccess(sailsResponse) {
    //
    //            // Notice that the sailsResponse is an array and not a single object
    //            // The .update() model method returns an array and not a single record.
    //            // window.location = '#/profile/' + sailsResponse.data[0].id;
    //
    //            // $scope.editProfile.loading = false;
    //            toastr.success($scope.recordSave, '', {timeOut: 1000});
    //            //console.log('sailsResponse: ', sailsResponse);
    //        })
    //        .catch(function onError(sailsResponse) {
    //            // console.log(sailsResponse);
    //            // Otherwise, display generic error if the error is unrecognized.
    //            $scope.editProfile.errorMsg = 'Произошла непредвиденная ошибка: ' + (sailsResponse.data || sailsResponse.status);
    //
    //        })
    //        .finally(function eitherWay() {
    //            $scope.editProfile.loading = false;
    //        });
    //
    //};
    //
    //$scope.saveKadr = function (id, change) {
    //    var theRoute = '/user/update-kadr/' + id;
    //    $http.put(theRoute, {
    //            id: id,
    //            kadr: change
    //        })
    //        .then(function onSuccess(sailsResponse) {
    //            toastr.success($scope.recordSave, '', {timeOut: 1000});
    //            //console.log('sailsResponse: ', sailsResponse);
    //        })
    //        .catch(function onError(sailsResponse) {
    //            $scope.editProfile.errorMsg = 'Произошла непредвиденная ошибка: ' + (sailsResponse.data || sailsResponse.status);
    //        })
    //        .finally(function eitherWay() {
    //            $scope.editProfile.loading = false;
    //        });
    //};


    $scope.saveData = function (id, change) {

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


    $scope.checkAll = function (change) {
        let route = '/user/update-emergence-all';
        $http.put(route, {change: change})
            .then(function onSuccess(response) {
                console.log('change222: ', change);
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


    $scope.checkSend = function (change) {
        let route = '/setting/check-sender';
        $http.put(route, {change: change, module:'emergence'})
            .then(function onSuccess(response) {
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