angular.module('SignupModule').controller('SignupController', ['$scope', '$http', 'toastr',
    function ($scope, $http, toastr) {

    $scope.signupForm = {
        loading: false
    };

    $scope.submitSignupForm = function () {
        $scope.signupForm.loading = true;
        $http.post('/user/signup', {
            login: $scope.signupForm.login,
            email: $scope.signupForm.email,
            firstName: $scope.signupForm.firstName,
            lastName: $scope.signupForm.lastName,
            patronymicName: $scope.signupForm.patronymicName,
            birthday: $scope.signupForm.birthday,
            password: $scope.signupForm.password
        }).then(function onSuccess(sailsResponse) {
            window.location = '/admin/users';
            // console.log('sailsResponse:');
            // console.log(sailsResponse);
        }).catch(function onError(sailsResponse) {
            // console.log('sailsResponse:');
            // console.log(sailsResponse);
            var emailAddressAlreadyInUse = sailsResponse.status == 409;
            if (emailAddressAlreadyInUse) {
                toastr.error('Этот email уже зарегистрирован, пожалуйста введите другой email.', 'Ошибка');
                return;
            }

            var loginAlreadyInUse = sailsResponse.status == 410;
            if (loginAlreadyInUse) {
                toastr.error('Этот логин уже зарегистрирован, пожалуйста введите другой логин.', 'Ошибка');
                return;
            }
        }).finally(function eitherWay() {
            $scope.signupForm.location = false;
        })
    };
    
    $scope.loginForm = {
        loading: false
    };
    
    $scope.submitLoginForm = function () {
        $scope.loginForm.loading = true;
        $http.put('/login', {
            email: $scope.loginForm.email,
            password: $scope.loginForm.password
        }).then(function onSuccess(sailsResponse) {
            window.location = '/';
        }).catch(function onError(sailsResponse) {

            // Handle known error type(s).
            // Deleted account
            if (sailsResponse.status == 403) {
                toastr.error(sailsResponse.data, 'Ошибка799!', {
                    closeButton: true
                });
                return;
            }

            if(sailsResponse.status === 400 || 404){
                toastr.error('Не правильный логин/пароль.', 'Ошибка авторизации!', {closeButton:true});
                return;
            }
            toastr.error('Неожиданная ошибка, пожалуйста попробуйте еще раз..', 'Ошибка', {closeButton:true});
            return;
        }).finally(function eitherWay() {
            $scope.loginForm.loading = false;
        });
    };
}]);