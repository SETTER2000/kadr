angular.module('PositionModule')
    .controller('PositionController', ['$scope', 'toastr', 'Positions', '$stateParams',
        function ($scope, toastr, Positions, $stateParams) {
            $scope.me = window.SAILS_LOCALS.me;
            if (!$scope.me.admin && !$scope.me.kadr) return $state.go('home');
            $scope.refresh = function () {
                $scope.item = Positions.get({id: $stateParams.positionId}, function (positions) {
                    $scope.users = positions;
                }, function (err) {
                    toastr.error(err.data.details, 'Ошибка - 211! ' + err.data.message);
                });
            };
            $scope.refresh();
        }]);
