angular.module('Holiday').controller('navPageController',
    ['$location', '$state', '$scope', '$http', 'toastr', function ($location, $state, $scope, $http, toastr) {

        $scope.me = window.SAILS_LOCALS.me;
        $scope.ins = {};


        if($scope.me.switchKadr){
            $scope.ins = {
                title: ($scope.me.kadr) ? 'Зайти как сотрудник' : 'Зайти как кадровик',
                titleName: ($scope.me.kadr) ? ' Кадровик' : ' Сотрудник'
            };
        }

        if($scope.me.switchAdmin){
            $scope.ins = {
                title: ($scope.me.admin) ? 'Зайти как сотрудник' : 'Зайти как админ',
                titleName: ($scope.me.admin) ? ' Админ' : ' Сотрудник'
            };
        }



        $scope.signOut = function () {
            $http.post('/logout')
                .then(function onSuccess(sailsReponse) {
                    window.location = '/';
                })
                .catch(function onError(sailsResponse) {
                    console.error(sailsResponse);
                })
                .finally(function eitherWay() {
                });
        };

        $scope.goSwitch = function () {
            if (!$scope.me.admin && !$scope.me.kadr) $state.go('home');
            //console.log('FFF', $scope.me);
            var theRoute = '/user/right-switch';
            $http.put(theRoute, {
                    id: 1
                })
                .then(function onSuccess(sailsResponse) {
                    toastr.success('Ok!');
                    //if (!$scope.me.admin) $state.go('home');
                    window.location = '/';
                })
                .catch(function onError(sailsResponse) {
                    $scope.editProfile.errorMsg = 'Произошла непредвиденная ошибка: ' + (sailsResponse.data || sailsResponse.status);
                })
                .finally(function eitherWay() {
                    $scope.editProfile.loading = false;
                });
        };

        $scope.loginForm = {};
        $scope.me = window.SAILS_LOCALS.me;
        for (var index in $scope.me.contacts) {
            if ($scope.me.contacts[index].type === 'Внутренний телефон')   $scope.me.phoneInner = $scope.me.contacts[index].value;
        }

        $scope.submitLoginForm = function () {
            $scope.loginForm.loading = true;
            $http.put('/login', {
                    email: $scope.loginForm.login,
                    username: $scope.loginForm.login,
                    password: $scope.loginForm.password
                })
                .then(function onSuccess() {
                    toastr.success('We have a match!', 'Success', {closeButton: true});
                })
                .catch(function onError(sailsResponse) {
                    if (sailsResponse.status == 403) {
                        toastr.error(sailsResponse.data, 'Error', {
                            closeButton: true
                        });
                        return;
                    }
                    if (sailsResponse.status === 400 || 404) {
                        toastr.error('Invalid email or username/password combination.', 'Error', {
                            closeButton: true
                        });
                        return;
                    }

                    toastr.error('An unexpected error occurred, please try again.', 'Error', {
                        closeButton: true
                    });
                    return;

                })
                .finally(function eitherWay() {
                    $scope.loginForm.loading = false;
                });
        };
    }]);
