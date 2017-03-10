angular.module('AttendanceModule')
    .controller('CalendarAttendanceController', ['$scope','$state', '$stateParams', 'Attendances','Calendars',
        function ($scope, $state, $stateParams, Attendances,Calendars) {

            $scope.statName = 'Календарь посещаемости';
            $scope.tbody = '/js/private/admin/attendances/tpl/views/view.tbody.html';


            //$scope.itemsCalendars = Calendars.get({'slug':'attendances'}, function (calendars) {
            //    $scope.calendars = calendars;
            //    console.log('$SCOPE.CALENDARS');
            //    console.log($scope.calendars);
            //});
            console.log('$SCOPE.ITEMScALENDARS');
            console.log($scope.itemsCalendars);
            /**
             * Метод query выполняет запрос на сервер и возвращает коллекцию,
             * которая содержит объекты с данными и дополнительными методами
             * которые используются для взаимодействия с данными на сервере $delete, $get, $remove, $save
             *
             * Так же можно определять свои методы для конструктора в фабрике модуля.
             * В данном конструкторе добавлен метод Users.getFullName()
             */
            $scope.defaultRows = 150;
            $scope.limitRows = [30, 50, 70, 100];
            $scope.currentPage = 1; // инициализируем кнопку постраничной навигации

            $scope.sort = 'date';
            $scope.limitAll = 1000;
            $scope.selectCount = 0;

            $scope.items = Attendances.query({limit: $scope.limitAll, sort: $scope.sort}, function (attendances) {
                $scope.attendances = attendances;
                $scope.numPages = attendances.length;
                console.log('ATTENDANCES: ');
                console.log($scope.attendances);
                console.log($scope.attendances.length);
                $scope.numPages = Math.floor(attendances.length / $scope.defaultRows) + 1;
            });
            console.log('ITEMS');
            console.log($scope.items);
            //$scope.item = CalendarAttendance.query({}, function (attendances) {
            //    $scope.item = attendances;
            //    $scope.numPages = attendances.length;
            //    console.log('ATTENDANCES: ');
            //    console.log($scope.attendances);
            //    console.log($scope.item.length);
            //    //
            //    //
            //    //$scope.numPages = Math.floor(attendances.length / $scope.defaultRows) + 1;
            //    //// $scope.items = attendances;
            //    //// $scope.differ(attendances);
            //
            //});
            //$scope.refresh = function () {
            //    $scope.item = Calendars.get({id: $stateParams.calendarId}, function (calendars) {
            //        $scope.calendars = calendars;
            //        // кол-во пользователей
            //        // console.log($scope.users.length);
            //        // console.log($scope.users);
            //    }, function (err) {
            //        if (err) console.log(err.message);
            //    });
            //};

            // $scope.toggleSelected = function () {
            //     $scope.selected = !$scope.selected;
            // };
            // $scope.isSelected = function () {
            //     return $scope.selected;
            // };
            //console.log($scope.items.login);


            // Обновление элемента
            //$scope.update = function (item) {
            //    item.$save();
            //    //$scope.currentView = 'table';
            //};


            //$scope.currentItem = ;
            // редеактирование существующего или создание нового элемента
            //$scope.editOrCreate = function (item) {
            //    $scope.currentItem = 'GOOOOOO';
            //    $location.path("/user/edit");
            //
            //};
            //$scope.goToViewEdit = function () {
            //    $location.path("/user/edit");
            //};


            // конструктор хлебных крошек
            function BreadCrumb() {
                var name;
                var path;
                this.arr = [];
            }

            BreadCrumb.prototype.add = function () {
                this.arr.push({name: this.name, path: this.path});
            };
            BreadCrumb.prototype.set = function (name, path) {
                this.name = name;
                this.path = path;
                this.add();
            };
            BreadCrumb.prototype.getAll = function () {
                return this.arr;
            };

            var breadcrumb = new BreadCrumb();
            breadcrumb.set('Home', '/');
            breadcrumb.set('Admin', '/admin');
            breadcrumb.set('Attendances', '/admin/attendances');
            breadcrumb.set('Calendar', '/admin/attendances/calendar');
            $scope.breadcrumbs = breadcrumb;


            //$scope.refresh();
        }])
;
