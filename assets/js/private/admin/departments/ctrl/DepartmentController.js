angular.module('DepartmentModule')
    .controller('DepartmentController', ['$scope', '$state', 'toastr', 'Departments', '$stateParams',
        function ($scope, $state, toastr, Departments, $stateParams) {
            $scope.me = window.SAILS_LOCALS.me;
            if (!$scope.me.admin && !$scope.me.kadr) return $state.go('home');
            //if(!$scope.me.admin) $location.path('/') ;
            /**
             * Метод query выполняет запрос на сервер и возвращает коллекцию,
             * которая содержит объекты с данными и дополнительными методами
             * которые используются для взаимодействия с данными на сервере $delete, $get, $remove, $save
             *
             * Так же можно определять свои методы для конструктора в фабрике модуля.
             * В данном конструкторе добавлен метод Users.getFullName()
             */


            $scope.refresh = function () {
                $scope.item = Departments.get({id: $stateParams.depId}, function (departments) {
                    $scope.departments = departments;
                    // кол-во пользователей
                    // console.log($scope.users.length);
                    // console.log($scope.users);
                }, function (err) {
                    if (err) console.log(err.message);
                });
            };

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

            $scope.refresh();
        }]);
