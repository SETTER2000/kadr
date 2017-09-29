angular.module('CalendarModule')
    .controller('EditCalendarController', ['$scope', 'toastr', '$rootScope', '$http', '$state', 'Calendars', '$stateParams',
        function ($scope, toastr, $rootScope, $http, $state, Calendars, $stateParams) {
            $scope.me = window.SAILS_LOCALS.me;
            Calendars.get({id: $stateParams.calendarId},function (calendars) {
                    $scope.item =calendars;
                    $scope.calendars = calendars;
                }, function (err) {
                    if (err) {
                        toastr.error(err, 'Ошибка EditCalendarController!');
                    }
                });
            $scope.refresh = function () {
                var item = $scope.item = Calendars.get({id: $stateParams.calendarId}, 
                    function (calendars) {
                        // console.log("CALENDAR");
                        // console.log(calendars);
                        $scope.item =calendars;
                    $scope.calendars = calendars;
                }, function (err) {
                    if (err) {
                        toastr.error(err, 'Ошибка EditCalendarController!');
                    }
                });
            };

            $scope.saveEdit = function (item) {
                if (angular.isDefined(item.id)) {
                    item.$update(item, function (success) {
                            toastr.success('Данные обновлены!');
                            $scope.refresh();
                        },
                        function (err) {
                            toastr.error(err, 'Ошибка 3 EditCalendarController!');
                        }
                    );
                } else {
                    $scope.refresh();
                    item.$save(item, function (success) {
                            $scope.refresh();
                            // console.log('SUCCESS: OK!');
                            item.ok();
                        },
                        function (err) {
                            toastr.error(err, 'Ошибка! Возможно ЧПУ не уникален. EditCalendarController!');
                            item.er('Возможно ЧПУ не уникален.');
                        })
                }
            };

            $scope.addContact = function () {
                item.contacts.push({type: 'телефон', value: ''});
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

            $scope.delete = function (item) {
                console.log(item);
                item.$delete(item, function (success) {
                    $scope.refresh();
                    console.log('SUCCESS: OK!');
                    item.ok();
                }, function (err) {
                    console.log('ERROR: ' + err.status);
                    console.log(err);
                    item.er();
                })
            };
            $scope.refresh();
        }]);
