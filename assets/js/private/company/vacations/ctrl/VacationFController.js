angular.module('VacationFModule')
    .controller('VacationFController', ['$scope', 'toastr','$state', 'VacationsF', '$stateParams',
        function ($scope, toastr,$state, VacationsF, $stateParams) {
            $scope.me = window.SAILS_LOCALS.me;
            if (!$scope.me || !$scope.me.vacation) return $state.go('home');


            $scope.refresh = function () {
                $scope.item = VacationsF.get({id: $stateParams.vacationId}, function (vacations) {
                    $scope.users = vacations;
                }, function (err) {
                    toastr.error(err.data.details, 'Ошибка - 211! ' + err.data.message);
                });
            };
            $scope.refresh();
        }]);
