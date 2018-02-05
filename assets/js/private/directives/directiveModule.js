// данный модуль использует модуль customServices, в котором определен сервис для логирования
angular.module("directiveModule", ["customServices"])
    // AngularJS при вызове фабричной функции анализирует названия ее аргументов и производит
    // внедрение зависимостей - передает экземпляр сервиса для логирования в параметр с именем logService
    .directive("triButton", function (logService) {
        return {
            scope: {counter: "=counter"},
            link: function (scope, element, attrs) {
                element.on("click", function (event) {
                    logService.log("Button click: " + event.target.innerText);
                    scope.$apply(function () {
                        scope.counter++;
                    });
                });
            }
        }
    })

    .directive('tdTable', function () {
        return {
            restrict: "E",
            scope: {
                'searchText': '=',
                'dtItems': '=',
                'filterObject': '=',
                'currentPage': '=',
                'defaultRows': '=',
                'nameHeader': '=',
                'fieldName': '=', // Какой тип контакта показывать по умолчанию
                'me': '='
            },
            templateUrl: function (elem, attr) {
                return '/js/private/admin/users/views/' + attr.type + '-table.html';
            },
            replace: true,
            link: function (scope) {
                scope.$watch('dtItems', function (value) {
                    //console.log('dtItems:', value);
                    scope.items = value;
                });

                scope.sortBy = function (propertyName) {
                    scope.reverse = (scope.propertyName === propertyName) ? !scope.reverse : true;
                    scope.propertyName = propertyName;
                };
            },
        };
    })

;