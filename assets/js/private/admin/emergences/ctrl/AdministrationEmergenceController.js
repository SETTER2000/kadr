angular.module('EmergenceModule').controller('AdministrationEmergenceController', ['$scope', '$state', '$http', 'toastr', function ($scope, $state, $http, toastr) {

    $scope.me = window.SAILS_LOCALS.me;
    if (!$scope.me.admin) return $state.go('home');


    $scope.text = {
        recordSave: 'Запись успешно сохранена!',
        sendOk: 'Рассылка сообщений <strong>включена</strong> для данного модуля. ' +
        'Сообщения на почту должны приходить, при условии, ' +
        'что правильно настроен сервис отправки почты.',
        sendNo: 'Рассылка сообщений <strong>выключена</strong> для данного модуля.',
        action:'Разрешен доступ к модулю',
        see:'Видеть все заявки'
    };

    $scope.userList = {
        loading: false
    };

    $scope.getSetting = function () {
        $http.get('/setting/module/emergence')
            .then(function onSuccess(sailsResponse) {
                $scope.checkSender = sailsResponse.data.checkSender;
            })
            .catch(function onError(sailsResponse) {
                toastr.error(sailsResponse.data, 'Ошибка 7010!');
            })
            .finally(function eitherWay() {
                $scope.userList.loading = false;
            });
    };


    $scope.refresh = function () {
        $http.get('/user/adminUsers')
            .then(function onSuccess(sailsResponse) {
                $scope.getSetting();
                console.log('sailsResponse: ', sailsResponse.data);
                $scope.userList.contents = sailsResponse.data;
            })
            .catch(function onError(sailsResponse) {})
            .finally(function eitherWay() {
                $scope.userList.loading = false;
            });
    };


    $scope.saveData = function (obj, id) {
        //console.log('id: ', id);
        //console.log('obj: ', obj);
        var theRoute = '/user/update-emergence/' + id;
        $http.put(theRoute, obj)
            .then(function onSuccess(response) {
                $scope.refresh();
                toastr.success($scope.text.recordSave);
            })
            .catch(function onError(sailsResponse) {
                console.log(sailsResponse);
                $scope.editProfile.errorMsg = 'Произошла непредвиденная ошибка: ' + (sailsResponse.data || sailsResponse.status);
            })
            .finally(function eitherWay() {
                $scope.editProfile.loading = false;
            });
    };


    $scope.checkAll = function (action) {
        let route = '/user/update-emergence-all';
        $http.put(route, {action: action})
            .then(function onSuccess(response) {
                console.log('change222: ', action);
                console.log('response: ', response);
                $scope.refresh();
                toastr.success($scope.text.recordSave);
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
        $http.put(route, {change: change, module: 'emergence'})
            .then(function onSuccess(response) {
                $scope.refresh();
                if (change) {
                    toastr.success($scope.text.sendOk);
                } else {
                    toastr.success($scope.text.sendNo);
                }

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