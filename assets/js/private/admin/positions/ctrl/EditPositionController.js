angular.module('PositionModule')
    .controller('EditPositionController', ['$scope', '$state','toastr', 'Positions', '$stateParams', '$rootScope',
        function ($scope, $state,toastr, Positions, $stateParams, $rootScope) {
            $scope.me = window.SAILS_LOCALS.me;
            if (!$scope.me.admin && !$scope.me.kadr) return $state.go('home');
            $scope.editPosition = $state.includes('home.admin.positions.edit');
            //if(!$scope.me.admin) $location.path('/') ;
            $scope.refresh = function () {
                var item = $scope.item = Positions.get({id: $stateParams.positionId}, function (positions) {
                    $scope.positions = positions;
                    item.getBirthday();
                    item.getDateInWork();
                    item.getFiredDate();
                }, function (err) {
                    if (err) console.log(err.message);
                });
            };

            $scope.delete = function (item) {
                console.log(item);
                item.$delete(item, function (success) {
                    toastr.success('Объект удалён.','OK! ');
                    $state.go('home.admin.positions');
                }, function (err) {
                    toastr.error(err,'Ошибка 3 EditPositionController!');
                })
            };

            $scope.saveEdit = function (item) {
                if (angular.isDefined(item.id)) {
                    item.$update(item, function (success) {
                            toastr.success('Данные обновлены!');
                            $scope.refresh();
                        },
                        function (err) {
                            toastr.error(err.data,'Ошибка!');
                        }
                    );
                } else {
                    $scope.refresh();
                    item.$save(item,function (success) {
                            toastr.success('Новая должность создана.');
                            $state.go('home.admin.position', {positionId: success.id});
                    },
                    function (err) {
                        toastr.error(err.data,'Ошибка! EditPositionController!');
                    });
                }
            };

            $scope.addContact = function () {
                if (angular.isArray(item.contacts)) {
                    item.contacts.push({type: "телефон", value: ""});
                } else {
                    item.contacts = [{type: "телефон", value: ""}];
                }
            };

            $scope.removeContact = function (contact) {
                var contacts = $scope.item.contacts;
                for (var i = 0, ii = contacts.length; i < ii; i++) {
                    if (contact === contacts[i]) {
                        contacts.splice(i, 1);
                    }
                }
            };

            $scope.isCancelDisabled = function () {
                return angular.equals(master, $scope.form);
            };

            $scope.isSaveDisabled = function () {
                return $scope.myForm.$invalid || angular.equals(item, $scope.form);
            };

            var original = angular.copy($scope.item);

            $scope.revert = function () {
                $scope.item = angular.copy(original);
                $scope.passwordRepeat = $scope.item.password;
                $scope.userInfoForm.$setPristine();
            };

            $scope.canRevert = function () {
                return !angular.equals($scope.item, original);
            };

            $scope.refresh();
        }]);
