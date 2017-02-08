angular.module('HomepageModule').controller('HomepageController', ['$scope', '$http', 'toastr',
    function ($scope, $http, toastr) {

        $scope.loginForm = {
            loading: false
        };

        $scope.submitLoginForm = function () {
            $scope.loginForm.loading = true;
            $http.put('/login', {
                email: $scope.loginForm.email,
                password: $scope.loginForm.password
            })
                .then(function onSuccess(sailsResponse) {
                    window.location = '/';
                })
                .catch(function onError(sailsResponse) {
                    if(sailsResponse.status === 400 || 404){
                        toastr.error('Не правильный логин/пароль.', 'Ошибка авторизации!', {closeButton:true});
                        return;
                    }
                    toastr.error('Неожиданная ошибка, пожалуйста попробуйте еще раз..', 'Error', {closeButton:true});
                    return;
                })
                .finally(function eitherWay() {
                    $scope.loginForm.loading = false;
                });
        };
    }]);