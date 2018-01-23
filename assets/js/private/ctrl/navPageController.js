angular.module('Holiday').controller('navPageController',
    ['$location', '$state','$scope', '$http', 'toastr', function ($location, $state, $scope, $http, toastr) {

        $scope.me = window.SAILS_LOCALS.me;
        $scope.title=  ($scope.me.admin) ? 'Зайти как сотрудник':'Зайти как админ';
        $scope.titleName=  ($scope.me.admin) ? ' Админ':' Сотрудник';
        //$scope.title=  ($scope.me.kadr) ? 'Зайти как кадровик':'Зайти как сотрудник';

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


        $scope.goRightSwitch = function () {
            // /user/right-switch

            if (!$scope.me.admin) $state.go('home');
            console.log('FFF',$scope.me);

            var theRoute = '/user/right-switch';
            // Submit PUT request to Sails.
            $http.put(theRoute, {
                    id: 1
                })
                .then(function onSuccess(sailsResponse) {

                    // Notice that the sailsResponse is an array and not a single object
                    // The .update() model method returns an array and not a single record.
                    // window.location = '#/profile/' + sailsResponse.data[0].id;

                    // $scope.editProfile.loading = false;
                    toastr.success('Ok!');
                    if (!$scope.me.admin) $state.go('home');
                    window.location = '/';
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
        $scope.loginForm = {};

        $scope.me = window.SAILS_LOCALS.me;
        for(var index in $scope.me.contacts){
            if($scope.me.contacts[index].type === 'Внутренний телефон')   $scope.me.phoneInner=$scope.me.contacts[index].value;
        }




        $scope.submitLoginForm = function () {

            // Set the loading state (i.e. show loading spinner)
            $scope.loginForm.loading = true;

            // Submit request to Sails.
            $http.put('/login', {
                email: $scope.loginForm.login,
                username: $scope.loginForm.login,
                password: $scope.loginForm.password
            })
                .then(function onSuccess() {
                    // Redierct the page now that we've been logged in.
                    // window.location = '/videos';
                    // window.location = '/';
                    toastr.success('We have a match!', 'Success', {closeButton: true});
                })
                .catch(function onError(sailsResponse) {

                    // Handle known error type(s).        
                    // Deleted account
                    if (sailsResponse.status == 403) {
                        toastr.error(sailsResponse.data, 'Error', {
                            closeButton: true
                        });
                        return;
                    }


                    // Invalid username / password combination.
                    if (sailsResponse.status === 400 || 404) {
                        // $scope.loginForm.topLevelErrorMessage = 'Invalid email/password combination.';
                        //
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
