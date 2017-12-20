(function (angular) {
    'use strict';
    angular.module('VacationModule')
        .controller('ListVacationController', ['$scope', '$location', 'ngDialog', '$mdDialog', 'moment', '$http', 'toastr', "$rootScope", '$timeout', '$state', 'Vacations', 'Users', '$window', function ($scope, $location, ngDialog, $mdDialog, moment, $http, toastr, $rootScope, $timeout, $state, Vacations, Users) {
            $scope.me = window.SAILS_LOCALS.me;
            if (!$scope.me.kadr && !$scope.me.admin) $state.go('home');

            /**
             * PAGINATION
             */
            $scope.defaultRows = 15;
            $scope.limitRows = [30, 50, 70, 100];
            $scope.currentPage = 1; // инициализируем кнопку постраничной навигации

            $scope.fioArea = 'Период с .. по ..';
            $scope.loginArea = 'Логин';
            $scope.tipArea = 'Тип';
            $scope.statusArea = 'Статус';
            $scope.lastNameArea = 'Владелец';
            $scope.createdAt = 'Создан';
            $scope.updatedAt = 'Изменён';
            $scope.whomUpdatedArea = 'Кем изменён';
            $scope.whomCreatedArea = 'Кем создан';
            $scope.actionsArea = 'Действие';
            $scope.infoArea = 'Пересечения';
            $scope.daysSelectHolidayArea = 'Дней';
            $scope.added = 'Добавить отпуск';
            $scope.children = ['Отпуск по беременности и родам', 'Отпуск по уходу за ребенком'];
            $scope.showBt = 1;
            $scope.countHolidayRF = 28;
            // показать формочку выбора кол-ва строк на странице
            $scope.showContIt = ($scope.me.admin) ? 1 : 0;
            $scope.showStr = 1;
            $scope.urlBt = 'home.admin.vacations.create';
            $scope.showInterfaceYear = true; // показать селектор года
            $scope.sort = 'updatedAt DESC';
            $scope.param = 'lastName';
            $scope.propertyName = 'updatedAt';
            //$scope.propertyName = 'owner.lastName';
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


            /**
             * TODO WEBSOCKET: Подключаемся к сокету обработка события badges
             */
            $scope.bdgs = [];
            io.socket.on('badges-vacation', function (data) {
                console.log('badges-vacation',data);
                $scope.bdgs.push(data);
                $scope.$apply();
            });

            $rootScope.$on('ngDialog.closing', function (e, $dialog) {
                if($dialog.attr('aria-describedby') === 'RONA2') $scope.bdgs = [];
                $scope.$apply();
            });

            /**
             * TODO WEBSOCKET: Подключаемся к сокету обработка события hello
             */
            io.socket.on('hello', function (data) {
                console.log('Socket room: ' + data.howdy + ' подключился только что к комнате list!');
                $scope.items = data.howdy;
                $scope.$apply();
            });

            $scope.clickToOpen = function () {
                ngDialog.open({
                    /**
                     * true - если нужен крестик закрытия в правом верхнем углу окна
                     */
                    showClose: true,
                    template: '/js/private/admin/vacations/views/popupTmpl.html',
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
                    name: 'vacation',
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
                    closeByEscape :  true,
                    ariaLabelledById: 'fox2',
                    ariaDescribedById:'RONA2',
                    scope: $scope
                });
            };

            io.socket.get('/say/vacation/hello', function gotResponse(data, jwRes) {
                console.log('Сервер ответил кодом ' + jwRes.statusCode + ' и данными: ', data);
            });
            io.socket.get('/say/vacation/badges', function gotResponse(data, jwRes) {
                console.log('Сервер ответил кодом состояния ' + jwRes.statusCode + ' и данными: ', data);
            });

            /**
             * TODO WEBSOCKET: End
             */



            io.socket.put('/interfaces/' + $scope.me.id + '/join', function (data, JWR) {
                // If something went wrong, handle the error.
                if (JWR.statusCode !== 200) {
                    console.error(JWR);
                    // TODO
                    return;
                }

                // If the server gave us its blessing and indicated that we were
                // able to successfully join the room, then we'll set that on the
                // scope to allow the user to start sending chats.
                //
                // Note that, at this point, we'll also be able to start _receiving_ chats.
                $scope.hasJoinedRoom = true;
                // Because io.socket.get() is not an angular thing, we have to call $scope.$apply()
                // in this callback in order for our changes to the scope to actually take effect.
                $scope.$apply();
            });


            //$scope.days = moment.duration(2).days();
            //$scope.hours = moment.duration(2).hours();
            //$scope.month = moment.duration().months();
            //$scope.months = moment.duration().asMonths();
            //$scope.seconds = moment.duration(1000).seconds();
            //var a = moment('2016-01-21 09:38:00', ['DD.MM.YYYY HH:mm:ss', 'YYYY-MM-DD HH:mm:ss']);
            //var b = moment('2016-01-21 13:54:00', ['DD.MM.YYYY HH:mm:ss', 'YYYY-MM-DD HH:mm:ss']);
            //$scope.diff = b.diff(a, 'm');
            //$scope.exampleDate = moment().hour(8).minute(0).second(0).toDate();
            //$scope.local = moment().local().format("ddd, hA");
            //$scope.local = moment().local().format("dddd, MMMM Do YYYY, h:mm:ss a");
            //$scope.localTime = moment().local().format();
            //$scope.localTime = moment.parseZone('2016-05-03T22:15:01+02:00').local().format();
            //$scope.localTime = moment().utc().local().hours();
            //var start = moment([2007, 0, 5]);
            //var end = moment([2007, 0, 10]);
            //end.from(start);       // "in 5 days"
            //$scope.end = end.from(start, true); // "5 days"


            var tabs = [
                    {title: '14.11.2017 по 17.11.2017', content: 'Woah...that is a really long title!'},
                    {title: '02.10.2017 по 07.10.2017', content: "Tabs will become paginated if there isn't enough room for them."},
                    {title: '01.10.2017 по 03.10.2017', content: "You can swipe left and right on a mobile device to change tabs."},
                    {
                        title: '15.09.2017 по 05.10.2017',
                        content: "You can bind the selected tab via the selected attribute on the md-tabs element."
                    },
                    {title: '01.10.2017 по 08.10.2017', content: "If you set the selected tab binding to -1, it will leave no tab selected."},
                    {title: '30.10.2017 по 04.11.2017', content: "If you remove a tab, it will try to select a new one."},
                    {
                        title: '08.10.2018 по 10.10.2018',
                        content: "There's an ink bar that follows the selected tab, you can turn it off if you want."
                    },
                    //{ title: 'Seven', content: "If you set ng-disabled on a tab, it becomes unselectable. If the currently selected tab becomes disabled, it will try to select the next tab."},
                    //{ title: 'Eight', content: "If you look at the source, you're using tabs to look at a demo for tabs. Recursion!"},
                    //{ title: 'Nine', content: "If you set md-theme=\"green\" on the md-tabs element, you'll get green tabs."},
                    //{ title: 'Ten', content: "If you're still reading this, you should just go check out the API docs for tabs!"},
                    //{ title: 'Eleven', content: "If you're still reading this, you should just go check out the API docs for tabs!"},
                    //{ title: 'Twelve', content: "If you're still reading this, you should just go check out the API docs for tabs!"},
                    //{ title: 'Thirteen', content: "If you're still reading this, you should just go check out the API docs for tabs!"},
                    //{ title: 'Fourteen', content: "If you're still reading this, you should just go check out the API docs for tabs!"},
                    //{ title: 'Fifteen', content: "If you're still reading this, you should just go check out the API docs for tabs!"},
                    //{ title: 'Sixteen', content: "If you're still reading this, you should just go check out the API docs for tabs!"},
                    //{ title: 'Seventeen', content: "If you're still reading this, you should just go check out the API docs for tabs!"},
                    //{ title: 'Eighteen', content: "If you're still reading this, you should just go check out the API docs for tabs!"},
                    //{ title: 'Nineteen', content: "If you're still reading this, you should just go check out the API docs for tabs!"},
                    //{ title: 'Twenty', content: "If you're still reading this, you should just go check out the API docs for tabs!"}
                ],
                selected = null,
                previous = null;
            $scope.tabs = tabs;
            $scope.selectedIndex = 0;
            $scope.$watch('selectedIndex', function (current, old) {
                previous = selected;
                selected = tabs[current];
                if (old + 1 && (old != current)) $log.debug('Goodbye ' + previous.title + '!');
                //if ( current + 1 )                $log.debug('Hello ' + selected.title + '!');
            });
            $scope.addTab = function (title, view) {
                view = view || title + " Content View";
                tabs.push({title: title, content: view, disabled: false});
            };
            $scope.removeTab = function (tab) {
                var index = tabs.indexOf(tab);
                tabs.splice(index, 1);
            };


            if (moment().isLeapYear()) {
                $scope.yearLeap = 'Да!';
            } else {
                $scope.yearLeap = 'Нет';
            }

            $scope.yearLeap = moment(1316116057189).fromNow();


            $scope.inter = {year: moment().year()};

            /**
             * Получить список доступных годов
             */
            $scope.getYears = function () {
                $http.get('/vacation/getYears').then(function success(response) {
                        $scope.options2 = response.data;
                    },
                    function errorCallback(response) {

                    }
                );
            };


            /**
             * Кол-во дн. отпуска выбранных в конкретном году
             */
            $scope.getDays = function () {
                $http.get('/vacation/getNextDays').then(function success(response) {
                        $scope.days = response.data;
                        console.log('POPP:', days);
                    },
                    function errorCallback(response) {

                    }
                );
            };

            /**
             * Получить год с коллекции интерфейса пользователя
             */
            $scope.getInterface = function () {
                $http.get('/interface/get').then(function success(response) {
                        $scope.interface = {name: response.data.year, id: response.data.year};
                        //console.log('INTERFACES+: ', $scope.interface);
                        $scope.me.intarface['name'] = response.data.year;
                        $scope.me.intarface['id'] = response.data.year;
                    },
                    function errorCallback(response) {

                    }
                );
            };
            $scope.getInterface();


            $scope.options =
                [
                    {display: "Активированы", value: "work"},
                    {display: "C детьми", value: "children"},
                    {display: "Не активированы / Заблокированы", value: "action"},
                    {display: "Все", value: "table"}
                ];
            $scope.modeSelect = $scope.options[0];
            $scope.tableView = "/js/private/admin/vacations/views/home.admin.vacations.table.html";
            $scope.childrenView = "/js/private/admin/vacations/views/home.admin.vacations.children.html";
            $scope.actionView = "/js/private/admin/vacations/views/home.admin.vacations.action.html";
            $scope.workView = "/js/private/admin/vacations/views/home.admin.vacations.work.html";

            $scope.loadOptions = function () {
                return $timeout(function () {
                    $scope.options = $scope.options || [
                            {display: "Активированы", value: "work"},
                            {display: "C детьми", value: "children"},
                            {display: "Не активированы / Заблокированы", value: "action"},
                            {display: "Все", value: "table"}
                        ];
                }, 650);
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
                            'getFullName': function () {
                                return this.lname + ' ' + this.fname + ' ' + this.pname;
                            },
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

            $scope.countChar = '4';
            $scope.filedName = 'lastName';

            //$scope.$on('changeInterface', function (event, args) {
            //    console.log('СОбытия на странице frontend', args);
            //});

            //
            //io.socket.on('chat', function (e) {
            //    console.log('new chat received!', e);
            //    //$scope.chats.push({
            //    //    created: e.created,
            //    //    username: e.username,
            //    //    message: e.message,
            //    //    gravatarURL: e.gravatarURL
            //    //});
            //
            //    $scope.$apply();
            //});


            $scope.$watch('where', function (value) {
                $scope.refresh(value);
            });

            $scope.$watch('interface', function (value, old) {
                if (value) {
                    $http.put('/interface/update', {
                            year: value
                        })
                        .then(function onSuccess(sailsResponse) {
                            //console.log('sailsResponse: ', sailsResponse);
                            $scope.getYears();
                            $scope.inter = sailsResponse.data[0];
                            $scope.getDays();

                            $scope.where = {from: {'>=': moment(value['year'], ['YYYY'])}};
                            $rootScope.$broadcast('changeInterface', {
                                message: sailsResponse.data[0]
                            });
                        })
                        .catch(function onError(sailsResponse) {

                            if (sailsResponse.data.status >= 400 < 404) {
                                console.log('ERROR /interface/update:', sailsResponse);
                                //$scope.restoreProfileForm.errorMsg = 'An unexpected error occurred: ' + (sailsResponse.data || sailsResponse.status);
                                //toastr.error('The email/password combination did not match a user profile.', '', {timeOut: 1000});
                                return;
                            }
                        })
                        .finally(function eitherWay() {

                        });
                }
            });


            $scope.objectName = [];

            $scope.refresh = function (where) {
                if (where) {
                    $scope.where = where;
                } else {
                    $scope.where = {};
                }
                $scope.query = {
                    where: $scope.where,
                    sort: $scope.sort,
                    limit: $scope.limitAll,
                    property: 'lastName',
                    char: $scope.charText + '%'
                };
                //console.log(' MY QUERY:', $scope.query);
                $scope.items = Vacations.query($scope.query, function (vacations) {
                    console.log('Vacations ITEMS22:', vacations);
                    $scope.objectName = [];
                    $scope.countCurrentView = vacations.length;
                    //$scope.me.interface = vacations.interfaces[0].year;
                    for (var u = 0; u < vacations.length; u++) {
                        $scope.objectName.push(vacations[u].getOwner());
                    }
                    //console.log('$scope.objectName', $scope.objectName);
                    $scope.numPages = Math.floor(vacations.length / $scope.defaultRows) + 1;
                }, function (err) {
                    toastr.error(err.data, 'Ошибка! ');
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


            $scope.reverse = true;

            $scope.sortBy = function (propertyName) {
                $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : true;
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
            breadcrumb.set('Vacations', '/admin/' + $state.current.url);
            $scope.breadcrumbs = breadcrumb;

            $scope.refresh();
        }]);
})(window.angular);