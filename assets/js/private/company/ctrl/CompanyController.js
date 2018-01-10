angular.module("CompanyModule")
    .controller("CompanyController", ["$scope", "$rootScope", '$location', '$state',
        function ($scope, $rootScope, $location, $state) {
        $scope.me = window.SAILS_LOCALS.me;
        //if (!$scope.me) $state.go('home');
        $scope.options =
            [
                {display: "Таблица", value: "table"},
                {display: "Список", value: "list"},
                {display: "Список с маркерами", value: "budge"},
                {display: "Календарь", value: "calendar"}
            ];
        $scope.data = {counter: 6};

        //io.socket.on('User', function (event) {
        //    console.log('EVENT:');
        //    console.log(event.data);
        //    $scope.$apply();
        //});
        //io.socket.get('/user',{limit:300}, function (resData, jwres) {
        //    console.log('COUNT:');
        //    console.log(resData.length);
        //    $scope.$apply();
        //});
        //$scope.$watch("data.counter", function (newValue, oldValue) {
        //    console.log("Старое значение - " + oldValue + ", новое значение - " + newValue);
        //    //$scope.data.counter = newValue;
        //
        //
        //});
        //$scope.$watch("data.counter", function (newValue, oldValue) {
        //    console.log("Старое значение - " + oldValue + ", новое значение - " + newValue);
        //});

        //$rootScope.$broadcast('foo', $scope.data);
        ////$scope.$on('foo', function (event, args) {
        ////    $scope.data = args;
        ////});
        //$scope.$on('foo2', function (event, args) {
        //    $scope.data = args;
        //});

        //$scope.$watch("data.counter", function (newValue, oldValue) {
        //    //console.log("Старое значение - " + oldValue + ", новое значение - " + newValue);
        //
        //});
        //$scope.$on("countUser", function (event, args) {
        //    //event.stopPropagation(); // останавливаем распространение события
        //    // $scope.info = args.message;
        //    // $scope.delete(args);
        //    $scope.data = args;
        //});
    }]);
