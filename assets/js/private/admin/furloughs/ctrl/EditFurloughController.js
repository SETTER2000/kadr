angular.module('FurloughModule')
    .controller('EditFurloughController', ['$scope', '$state','toastr', 'Furloughs', '$stateParams', '$rootScope',
        function ($scope, $state,toastr, Furloughs, $stateParams, $rootScope) {
            $scope.me = window.SAILS_LOCALS.me;
            $scope.editObj = $state.includes('home.admin.furloughs.edit');
            //if(!$scope.me.admin) $location.path('/') ;

            $scope.refresh = function () {
                var item = $scope.item = Furloughs.get({id: $stateParams.furloughId}, function (furloughs) {
                    $scope.furloughs = furloughs;
                    item.getBirthday();
                    item.getDateInWork();
                    item.getFiredDate();
                }, function (err) {
                    // активируем по умолчанию создаваемую запись
                    item.action = true;
                    item.sc = function () {
                        return 'Тип отпуска';
                    };

                });
            };

            $scope.delete = function (item) {
                console.log(item);
                item.$delete(item, function (success) {
                    toastr.success('Объект удалён.','OK! ');
                    $state.go('home.admin.furloughs');
                }, function (err) {
                    toastr.error(err,'Ошибка 3 EditFurloughController!');
                })
            };

            $scope.saveEdit = function (item) {
                if (angular.isDefined(item.id)) {
                    item.$update(item, function (success) {
                            toastr.success('Данные обновлены!');
                            $scope.refresh();
                        },
                        function (err) {
                            toastr.error(err.message,'Ошибка!');
                        }
                    );
                } else {
                    $scope.refresh();
                    item.$save(item,function (success) {
                            toastr.success('Новая должность создана.');
                            $state.go('home.admin.furlough', {furloughId: success.id});
                    },
                    function (err) {
                        toastr.error(err.data,'Ошибка 101!');
                        //toastr.error(err.data.originalError.errmsg,'Ошибка! EditFurloughController!');
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
