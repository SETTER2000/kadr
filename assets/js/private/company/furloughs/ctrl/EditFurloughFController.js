angular.module('FurloughFModule')
    .controller('EditFurloughFController', ['$scope', '$state', 'toastr', 'FurloughsF', '$stateParams', '$rootScope',
        function ($scope, $state, toastr, FurloughsF, $stateParams, $rootScope) {
            $scope.me = window.SAILS_LOCALS.me;
            $scope.edit = $state.includes('home.company.furloughs.edit');
            //if(!$scope.me.company) $location.path('/') ;
            $scope.data = {
                cb1: false
            };
            $scope.intersecArea= 'учитывает пересечения';
            $scope.intersecNoArea= 'не учитывает пересечения';
            $scope.help = {
                intersec:' Данная опция позволяет установить логику обработки данного типа ' +
                'отпуска в системе. Если не требуется учитывать пересечение отпуска этого типа с ' +
                'собственными уже установленными отпусками, то нужно включить опцию в ' +
                'позицию \"не учитывает пересечения\". В противном случаи сделать наоборот.' +
                ' По умолчанию учитывает пересечения.',
                header:'Информация',
                showHelp: function (text, header) {
                    toastr.info(text, header,{
                        "allowHtml": true,
                        // iconClass:'toast-pink',
                        // autoDismiss: false,
                        // containerId: 'toast-container',
                        // maxOpened: 1,
                        // newestOnTop: true,
                        // positionClass: 'toast-top-right',
                        // // positionClass: 'toast-top-left',
                        // positionClass: "toast-top-full-width",
                         preventDuplicates: true,
                         //preventOpenDuplicates: true,
                        // target: 'body',
                        // // closeButton:true,
                        // extendedTimeOut:1000,
                        // "showDuration": "100",
                        // "hideDuration": "300",
                        // "timeOut": "5000",
                        "progressBar": true
                    });
                }
            };

            $scope.refresh = function () {
                var item = $scope.item = FurloughsF.get({id: $stateParams.furloughId}, function (furloughs) {
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
                    toastr.success('Объект удалён.', 'OK! ');
                    $state.go('home.company.furloughs');
                }, function (err) {
                    toastr.error(err, 'Ошибка 3 EditFurloughFController!');
                })
            };

            $scope.saveEdit = function (item) {
                if (angular.isDefined(item.id)) {
                    item.$update(item, function (success) {
                            toastr.success('Данные обновлены!');
                            $scope.refresh();
                        },
                        function (err) {
                            toastr.error(err.message, 'Ошибка!');
                        }
                    );
                } else {
                    $scope.refresh();
                    item.$save(item, function (success) {
                            toastr.success('Новая должность создана.');
                            $state.go('home.company.furlough', {furloughId: success.id});
                        },
                        function (err) {
                            toastr.error(err.data, 'Ошибка 101!');
                            //toastr.error(err.data.originalError.errmsg,'Ошибка! EditFurloughFController!');
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
