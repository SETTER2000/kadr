angular.module('VacationFModule')
    .controller('VacationFController', ['$scope', 'toastr', 'VacationsF', '$stateParams',
        function ($scope, toastr, VacationsF, $stateParams) {
            $scope.refresh = function () {
                $scope.item = VacationsF.get({id: $stateParams.vacationId}, function (vacations) {
                    $scope.users = vacations;
                }, function (err) {
                    toastr.error(err.data.details, 'Ошибка - 211! ' + err.data.message);
                });
            };
            $scope.refresh();
        }]);
