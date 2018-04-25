(function (angular) {
    'use strict';
    angular.module('EmergenceModule')
        .controller('ListEmergenceController', ['$scope', '$location', 'ngDialog', '$mdDialog', 'moment', '$http', 'toastr', "$rootScope", '$timeout', '$state', 'Emergences', '$window', function ($scope, $location, ngDialog, $mdDialog, moment, $http, toastr, $rootScope, $timeout, $state, Emergences) {
            $scope.me = window.SAILS_LOCALS.me;
            if (!$scope.me.admin && !$scope.me.kadr) return $state.go('home');
            //if (!$scope.me.kadr && !$scope.me.admin) $state.go('home');
            $scope.$on('defaultRowsTable', function (event, data) {
                //console.log('defaultRowsTable', data); // Данные, которые нам прислали
                return $scope.defaultRows = data.defaultRows;
            });

            $scope.moment = moment();
            /**
             * TODO WEBSOCKET: Подключаемся к сокету. Обработка события badges
             */

            $scope.bdgs = [];

            io.socket.on('badges-emergence', function (data) {
                console.log('badges-emergence', data);
                $scope.bdgs.push(data);
                $scope.$apply();
            });


            $rootScope.$on('ngDialog.closing', function (e, $dialog) {
                //console.log('ngDialog closed: ' + $dialog.attr('id'));
                if ($dialog.attr('aria-describedby') === 'RONA')  $scope.bdgs = [];
                $scope.$apply();
            });


            /**
             * TODO WEBSOCKET: Подключаемся к сокету. Обработка события hello-emergence-list
             */
            io.socket.on('hello-emergence-list', function (data) {
                //console.log('Socket room: ' + data.howdy + ' подключился только что к комнате list!');
                //$scope.items = data.howdy;
                //console.log('Данные события hello', data);
                $scope.refresh();
                //$scope.$apply();
            });

            $scope.clickToOpen = function () {
                ngDialog.open({
                    showClose: true,
                    template: '/js/private/admin/emergences/views/popupTmpl.html',
                    className: 'ngdialog-theme-default',
                    /**
                     * true - позволяет закрыть модальное окно щёлкнув по оверлейному слою
                     */
                    closeByDocument: true,
                    /**
                     * true - закрывать модальное окно при переходе на другую страницу
                     */
                    closeByNavigation: false,
                    /**
                     * false - отключить кэширование шаблона
                     */
                    cache: false,
                    /**
                     * Имя диалогового окна
                     */
                    name: 'emergence',
                    /**
                     * true - установит фокус на элементе закрытия окна и в Chrome
                     * появится синий бордюр вокруг кнопки
                     */
                    trapFocus: false,
                    /**
                     * Ширина окна 400 - это 400px
                     * можно так '40%'
                     */
                    width: 480,
                    /**
                     * true - закрыть можно кнопкой Esc
                     */
                    closeByEscape: true,
                    ariaLabelledById: 'fox',
                    ariaDescribedById: 'RONA',
                    scope: $scope
                });
                //ngDialog.open({ template: '/js/private/admin/emergence/views/popupTmpl.html', className: 'ngdialog-theme-default' });
            };

            io.socket.get('/say/emergence/hello', function gotResponse(data, jwRes) {
                //console.log('Сервер ответил кодом ' + jwRes.statusCode + ' и данными: ', data);
            });
            io.socket.get('/say/emergence/badges', function gotResponse(data, jwRes) {
                //console.log('Сервер ответил кодом состояния ' + jwRes.statusCode + ' и данными: ', data);
            });

            /**
             * TODO WEBSOCKET: End
             */



            $scope.defaultRows = ($scope.me.defaultRows) ? $scope.me.defaultRows : 15;
            //$scope.defaultRows =6;
            $scope.limitRows = [2, 3, 5, 7, 10, 15, 30, 50, 70, 100];
            $scope.currentPage = 1; // инициализируем кнопку постраничной навигации

            $scope.nameHeader = {
                oneArea: 'ФИО',
                twoArea: 'Год',
                threeArea: 'Состояние заявки',
                fourArea: 'C',
                fiveArea: 'До',
                sixArea: 'Кол-во дней',
                sevenArea: 'Создал',
                eightArea: 'Обновил',
                nineArea: 'Собрано данных',
                departmentArea: 'Отдел',
                tenArea: 'Обновил',
                actionArea: 'Активность',
                startKadrArea: 'Кадры',
                finCheckArea: 'Финотдел',
                ahoCheckArea: 'АХО',
                itCheckArea: 'IT',
                createdAtArea: 'Создано',
                updatedAtArea: 'Обновлено',
                title: 'На проверке',
                titleService: 'Проверено',
                startProject: 'Подача заявки',
                textHead: 'Сообщения отправлены',
                outputEmployee: 'Выход сотрудника',
                check: 'выполнено',
                checkKadr: 'начать обработку'
            };


            $scope.added = 'Выход нового сотрудника';
            $scope.showBt = 1;
            // показать формочку выбора кол-ва строк на странице
            $scope.showContIt = ($scope.me.admin) ? 1 : 0;
            $scope.showStr = 0;
            $scope.urlBt = 'home.admin.emergences.create';

            $scope.sort = 'createdAt DESC';// сортировка по умолчанию
            $scope.param = 'lastName';
            $scope.fieldName = 'Внутренний телефон';
            $scope.charText = '';
            $scope.searchText = '';
            $scope.page_number = 0;
            $scope.limitAll = 1000;
            $scope.where = {};
            $scope.alfavit = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Э', 'Ю', 'Я'];
            $scope.enabledButton = false;
            $scope.styleObj = {
                color: false,
                border: false,
                size: false
            };


            if (moment().isLeapYear()) {
                $scope.yearLeap = 'Да!';
            } else {
                $scope.yearLeap = 'Нет';
            }

            $scope.yearLeap = moment(1316116057189).fromNow();

            $scope.message = {
                text: 'hello world!',
                time: new Date()
            };


            /**
             * Фильтры для каждой выбираемой страницы
             *
             */
            $scope.filterTemplate = {
                all: {}, // все
                project: {status: 'Новая'}, // проект
                inWork: {status: 'В работе'}, // в работе
                approved: {status: 'Завершена'}, // утверждён
                notValid: {status: 'Отклонена'} //
            };

            $scope.$watch('modeSelect.value', function (value, old) {
                //console.log('modeSelect OLD', old);
                //console.log('modeSelect NEW', value);
                $scope.ftObj = $scope.filterTemplate[value];
            });
            $scope.$watch('searchText', function (value, old) {
                //console.log('OLD', old);
                //console.log('NEW', value);
                $scope.searchText = value;
                // $scope.refresh();
            });

            $scope.options =
                [
                    {display: "Все", value: "all"},
                    {display: "Новая", value: "project"},
                    {display: "В работе", value: "inWork"},
                    {display: "Завершена", value: "approved"},
                    {display: "Отклонена", value: "notValid"}

                ];
            $scope.modeSelect = $scope.options[0];
            //$scope.tableView = "/js/private/admin/emergence/views/home.admin.emergence.table.html";
            //$scope.listView = "/js/private/admin/emergence/views/home.admin.emergence.list.html";
            //$scope.actionView = "/js/private/admin/emergence/views/home.admin.emergence.action.html";
            //$scope.workView = "/js/private/admin/emergence/views/home.admin.emergence.work.html";
            $scope.getLastName = function (item) {
                $http.post('/att', item)
                    .then(function (attendance) {
                        $scope.differ(attendance);
                        $scope.numPages = Math.floor($scope.items.length / $scope.defaultRows) + 1;
                    });
            };


            $scope.loadOptions = function () {
                return $timeout(function () {
                    $scope.options = $scope.options || [
                            {display: "Работают", value: "work"},
                            {display: "Уволены", value: "list"},
                            {display: "Не активированы / Заблокированы", value: "action"},
                            {display: "Все", value: "table"}
                        ];
                }, 1);
            };


            $scope.getLastName = function (item) {
                $http.post('/att', item)
                    .then(function (attendance) {
                        $scope.differ(attendance);
                        $scope.numPages = Math.floor($scope.items.length / $scope.defaultRows) + 1;
                    });
            };

            $scope.differ = function (attendance) {
                var data = [];
                for (var i = 0; i < attendance.data.length; i++) {
                    (function () { // каждая созданная функция будет работать со своей локальной переменной.
                        var local = i;
                        var a, b;
                        a = moment(attendance.data[local].time_in, ['HH:mm:ss']);
                        b = moment(attendance.data[local].time_out, ['HH:mm:ss']);

                        data.push({
                            getContact: function (fieldName) {
                                return this.date;
                            },
                            'pname': attendance.data[local].pname,
                            'lname': attendance.data[local].lname,
                            'fname': attendance.data[local].fname,
                            'date': attendance.data[local].date,
                            'birthday': attendance.data[local].time_in,
                            'login': attendance.data[local].time_out,
                            'email': attendance.data[local].email,
                            'diff': $scope.getTimeFormatMilliseconds(b.diff(a), 1, 'Неизвестно')
                        });
                    })();
                }
                $scope.items = data;
            };

            /**
             * Проверка на точное соответствие аргумента n числу
             * @param n
             * @returns {boolean}
             */
            $scope.isNumeric = function (n) {
                return !isNaN(parseFloat(n)) && isFinite(n);
            };

            $scope.getTimeFormatMilliseconds = function (milliseconds, secondAdd, mess) {
                if ($scope.isNumeric(milliseconds)) {
                    var a = {};
                    var sec;
                    sec = (secondAdd) ? ':00' : '';
                    // всего минут
                    a.min = (milliseconds / 1000) / 60;
                    // минуты после целого, т.е. часов
                    a.minCeil = (a.min % 60);
                    // Добавляем ведущий ноль
                    a.minCeil = (a.minCeil < 10) ? ('0' + a.minCeil) : a.minCeil;
                    a.hoursCeil = Math.floor(a.min / 60); // минуты после целого, т.е. часов
                    // Добавляем ведущий ноль (один час был: 1 стал 01)
                    a.hoursCeil = (a.hoursCeil < 10) ? ('0' + a.hoursCeil) : a.hoursCeil;
                    milliseconds = a.time = a.hoursCeil + ':' + a.minCeil + sec;
                } else {
                    // Сообщение если отсутствует значение или оно не корректно
                    milliseconds = mess;
                }
                return milliseconds;
            };

            $scope.str = 'Петров';
            $scope.countChar = '4';
            $scope.filedName = 'lastName';


            $scope.goDuble = function () {
                return $scope.go = ($scope.go) ? false : true;
            };


            $scope.$watch('where', function (value) {

                $scope.refresh(value);

            });






            $scope.refresh = function (where) {
                if (where) {
                    $scope.where = where;
                } else {
                    $scope.where = {};
                }
                //$scope.query = {
                //    where: $scope.where,
                //    sort: $scope.sort,
                //    limit: $scope.limitAll,
                //    property: 'lastName',
                //    char: $scope.charText + '%'
                //};
                let whomCreated = (!$scope.me.emergence[0].see) ? $scope.me.id : false;

                $scope.query = {
                    where: $scope.where,
                    sort: $scope.sort,
                    limit: $scope.limitAll,
                    property: 'lastName',
                    whomCreated: whomCreated,
                    char: $scope.charText + '%'
                };

                //console.log('SEEE', $scope.me.emergence[0].see);
                $scope.items = Emergences.query($scope.query, function (emergence) {
                    //console.log('EMERGENCE ITEMS:', emergence);
                    $scope.items = emergence;

                    $scope.countCurrentView = emergence.length;
                    $scope.objectName = emergence;
                    //$scope.numPages = Math.floor(emergence.length / $scope.defaultRows) + 1;
                }, function (err) {
                    toastr.error(err.data.details, 'Ошибка77! ' + err.data.message);
                });

            };

            $scope.getMode = function (t) {
                if (t) {
                    $scope.refresh({"fired": false});
                    $scope.t = false;
                } else {
                    $scope.refresh({"fired": true});
                    $scope.t = true;
                }
            };

            $scope.getPage = function (num) {
                $scope.page_number = num;
            };

            $scope.delete = function (item) {
                item.$delete(item, function (success) {
                    $scope.refresh();
                }, function (err) {
                    console.log(err);
                })
            };

            $scope.propertyName = 'lastName';

            $scope.reverse = false;

            $scope.sortBy = function (propertyName) {
                $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
                $scope.propertyName = propertyName;
            };

            $scope.msd = ['settings', 'home', 'options', 'other'];

            $scope.selectionMode = $scope.msd[0];

            /**
             *  Конструктор хлебных крошек
             * @constructor
             */
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
            breadcrumb.set('Emergences', '/admin/' + $state.current.url);
            $scope.breadcrumbs = breadcrumb;

            //$scope.refresh();
        }]);
})(window.angular);