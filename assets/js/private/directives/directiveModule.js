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
    .directive('xlsHtmlTable', function () {
        return {
            restrict: "E",
            scope: {
                'dtItem': '=', // вводимые данные
                'headerTab':'=?' // заголовок таблицы (не  обязательное поле)
            },
            templateUrl: function (elem, attr) {
                return '/js/private/admin/users/views/xls-html.html';
            },
            replace: true,
            link: function (scope) {
                scope.$watch('dtItem', function (value) {
                    if(value){
                        let rows = value.split("\n");
                        let table = angular.element('<table />');
                        for(let y in rows) {
                            let cells = rows[y].split("\t");
                            let row = angular.element('<tr />');
                            for (var x in cells) {
                                row.append('<td>' + cells[x] + '</td>');
                            }
                            table.append(row);
                        }
                        scope.table= '<table class="table xlsTab no-th-top" ><tr><th colspan="1000" >'+scope.headerTab+'</th></tr>'+table.html()+'</table>';
                    }
                });


                //
                //scope.sortBy = function (propertyName) {
                //    scope.reverse = (scope.propertyName === propertyName) ? !scope.reverse : true;
                //    scope.propertyName = propertyName;
                //};
            },
        };
        //return {
        //    link: function (scope, element, attributes) {
        //        var data = scope[attributes["xlsHtml"]];
        //        var property = attributes["property"];
        //        console.log('DDDCCC',data[property]);

        //          function generateTable() {
//        var data = $('textarea[name=excel_data]').val();
//        console.log(data);
//        var rows = data.split("\n");
//
//        var table = $('<table />');
//
//        for(var y in rows) {
//            var cells = rows[y].split("\t");
//            var row = $('<tr />');
//            for(var x in cells) {
//                row.append('<td>'+cells[x]+'</td>');
//            }
//            table.append(row);
//        }
//
//// Insert into DOM
//        $('#excel_table').html(table);
//    }
//            }
//        }
    })
;