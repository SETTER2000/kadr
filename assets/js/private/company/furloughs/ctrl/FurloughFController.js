angular.module('FurloughFModule')
    .controller('FurloughFController', ['$scope', 'toastr', 'FurloughsF', '$stateParams',
        function ($scope, toastr, FurloughsF, $stateParams) {
            $scope.refresh = function () {
                $scope.item = FurloughsF.get({id: $stateParams.furloughId}, function (furloughs) {
                    $scope.users = furloughs;
                }, function (err) {
                    toastr.error(err.data.details, 'Ошибка - 211! ' + err.data.message);
                });
            };
            $scope.refresh();
        }]);
