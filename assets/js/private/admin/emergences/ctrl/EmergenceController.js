angular.module('ScheduleModule')
    .controller('ScheduleController', ['$scope', '$state','toastr', 'moment', 'Schedules', '$stateParams',
        function ($scope,$state,toastr, moment, Schedules, $stateParams) {
            //$scope.message = moment({start:'1995-12-25',end:'2000-10-10'}).year(2009).hours(0).minutes(0).seconds(0);
            /**
             * Метод query выполняет запрос на сервер и возвращает коллекцию,
             * которая содержит объекты с данными и дополнительными методами
             * которые используются для взаимодействия с данными на сервере $delete, $get, $remove, $save
             *
             * Так же можно определять свои методы для конструктора в фабрике модуля.
             * В данном конструкторе добавлен метод Schedules.getFullName()
             */

            $scope.refresh = function () {
                $scope.item = Schedules.get({id: $stateParams.scheduleId}, function (schedules) {
                    console.log('schedules', schedules);
                    $scope.schedules = schedules;
                }, function (err) {
                    toastr.error(err.data.details, 'Ошибка - 889! ' + err.data.message);
                });
            };

            $scope.refresh();
        }]);
