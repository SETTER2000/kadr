//var translationsRU = {
//    TITLE: 'Наименование',
//    HEADLINE: 'Описание',
//    CHPU: 'ЧПУ',
//    ATTENDANCE: 'Посещаемость',
//    EDIT: 'Редактировать',
//    ACTIVITY: 'Активность',
//    LOCATION: 'Местоположения',
//    INFO: 'Информация',
//    BUTTON_LANG_EN: 'Englisch',
//    BUTTON_LANG_RU: 'Russian',
//    BUTTON_LANG_DE: 'German',
//    NAMESPACE: {
//        PARAGRAPH: 'And it comes with awesome features!'
//    }
//};
//var translationsEN = {
//    TITLE: 'Title',
//    HEADLINE: 'Description',
//    CHPU: 'Friendly URL',
//    ATTENDANCE: 'Attendance',
//    EDIT: 'Edit',
//    ACTIVITY: 'Activity',
//    LOCATION: 'Location',
//    INFO: 'Information',
//    BUTTON_LANG_DE: 'German',
//    BUTTON_LANG_EN: 'English',
//    BUTTON_LANG_RU: 'Russian'
//};
//var translationsDE = {
//    TITLE: 'Titel',
//    HEADLINE: 'Beschreibung',
//    CHPU: 'Freundliche URL!',
//    ATTENDANCE: 'TEILNAHME',
//    EDIT: 'Bearbeiten',
//    ACTIVITY: 'Aktivität',
//    LOCATION: 'Lage',
//    INFO: 'Informationen',
//    BUTTON_LANG_DE: 'Deutsch',
//    BUTTON_LANG_EN: 'Englisch',
//    BUTTON_LANG_RU: 'Russian'
//};

angular.module('CalendarModule', ['ui.router', 'ngResource', 'ngAnimate',  'angularMoment','AttendanceModule'])
    .config(['$stateProvider',  function ($stateProvider) {

        $stateProvider
            .state('home.admin.calendars', {
                url: '/calendars',
                views: {
                    '@': {
                        templateUrl: '/js/private/admin/calendars/tpl/list.tpl.html',
                        controller: 'ListCalendarController'
                    }
                }
            })
            .state('home.admin.calendars.create', {
                url: '/create',
                views: {
                    '@': {
                        templateUrl: '/js/private/admin/calendars/tpl/edit.tpl.html',
                        controller: 'EditCalendarController'
                    }
                }
            })
            .state('home.admin.calendar', {
                url: '/calendar/:calendarId',
                views: {
                    'sidebar@': {templateUrl: '/js/private/admin/calendars/tpl/sidebar.html'},
                    '@': {
                        templateUrl: '/js/private/admin/calendars/tpl/show.tpl.html',
                        controller: 'CalendarController'
                    }
                }
            })
            .state('home.admin.calendar.edit', {
                url: '/edit',
                views: {
                    '@': {
                        templateUrl: '/js/private/admin/calendars/tpl/edit.tpl.html',
                        controller: 'EditCalendarController'
                    }
                }
            })
            .state('home.admin.calendar.show', {
                url: '/show',
                views: {
                    '@home.admin.calendar': {
                        templateUrl: '/js/private/admin/calendars/views/home.admin.calendar.show.html',
                        controller: 'CalendarController'
                    }
                }
            })
            .state('home.admin.calendar.месяц', {
                url: '/месяц',
                views: {
                    '@home.admin.calendar': {
                        //templateUrl: '/js/private/admin/calendars/views/home.admin.calendar.month.html',
                        controller: 'CalendarController'
                    }
                }
            })
            .state('home.admin.calendar.неделя', {
                url: '/неделя',
                views: {
                    '@home.admin.calendar': {
                        //templateUrl: '/js/private/admin/calendars/views/home.admin.calendar.month.html',
                        controller: 'CalendarController'
                    }
                }
            })
            .state("tbody", {
                views: {
                    'tbody@': {
                        templateUrl: "/js/private/admin/calendars/views/view.tbody.html"
                    }
                }
            })
        ;
    }])
    .constant('CONF_MODULE_CALENDAR', {baseUrl: '/calendars/:calendarId'})
    .filter("timeCut", function () {
        // Отрежим нули
        return function (value, toCut) {
            // проверка переменной value на наличие строки
            if (angular.isString(value)) {
                var processedValue = toCut ? value.substr(0, 5) : value;
                return processedValue;
            } else {
                return value;
            }
        };
    })
    .factory('Calendars', function ($resource, CONF_MODULE_CALENDAR) {
        var Calendars = $resource(
            CONF_MODULE_CALENDAR.baseUrl,
            {calendarId: '@id'},
            // Определяем собственный метод update на обоих уровнях, класса и экземпляра
            {
                update: {
                    method: 'PUT'
                }
            }
        );

        //Calendars.prototype.getFullName = function () {
        //    return this.lastName + ' ' + this.firstName + ' ' + this.patronymicName;
        //};

        Calendars.prototype.sc = function () {
            return this.section;
        };
        Calendars.prototype.scs = function () {
            return this.sections;
        };

        Calendars.prototype.ok = function () {
            return alert(this.section + ': ' + this.name + ' изменён!');
        };
        Calendars.prototype.er = function (ms) {
            return alert('ОШИБКА!!! ' + this.name + ' - изменения не приняты! ' + ms);
        };
        Calendars.prototype.getListUrl = function () {
            return '/admin/calendars';
        };
        Calendars.prototype.getEditUrl = function (id) {
            return '/admin/calendar/' + id + '/edit';
        };
        Calendars.prototype.getShowUrl = function (id) {
            return '/admin/calendar/' + id;
        };
        Calendars.prototype.getCreateUrl = function () {
            return '/admin/calendars/create';
        };
        Calendars.prototype.deactivation = function () {
            return ' - деактивирован';
        };

        return Calendars;
    })
    .directive("attendanceCalendar", function () {
        return {
            link: function (scope, element, attributes) {
                scope.data = scope[attributes["attendanceCalendar"]];
                scope.dataPeriod = scope[attributes["period"]];
                //console.log('attendanceCalendar - DIRECTIVES:');
                scope.data.$promise.then(rejectFull);

                scope.$watch('daysPeriod', function (value) {
                    getDtForm();
                    //console.log('HHHH');
                });
                function getDtForm(item) {
                    return item;
                    if (angular.isDefined(item) && angular.isDefined(scope.dataPeriod)) {

                        var numberColumn = '';
                        if (scope.dataPeriod.dForm.indexOf(item.date) > 0) {
                            numberColumn = scope.dataPeriod.dForm.indexOf(item.date);
                            //console.log(numberColumn);
                            //item.numberColumn = numberColumn + 1;

                            //console.log(item);
                            return item;
                        }
                    }
                }

                function rejectFull(t) {
                    scope.data = [];
                    scope.prevData = [];
                    scope.fio = [];
                    if (angular.isArray(t) && t.length > 0) {
                        for (var y = 0; y < t.length; y++) {
                            scope.fio.push(t[y].getFullName());
                        }
                        for (var i = 0; i < t.length; i++) {
                            var intv = moment(t[i].date + " " + t[i].time_in, 'YYYY-MM-DD HH:mm');
                            var outv = moment(t[i].date + " " + t[i].time_out, 'YYYY-MM-DD HH:mm');
                            var subs = outv.diff(intv);
                            var dlit = moment.preciseDiff(intv, outv, true);
                            dlit.getTimeForm = function () {
                                var m = this.minutes;
                                var h = this.hours;
                                h = h < 10 ? "0" + h : h;
                                m = m < 10 ? "0" + m : m;
                                return h + ':' + m;
                            };

                            scope.data.push(
                                getDtForm({
                                    fio: t[i].getFullName(),
                                    dlt: (function () {
                                        return dlit.getTimeForm();
                                    })(),
                                    date: t[i].date,
                                    id: t[i].id,
                                    time_in: t[i].time_in,
                                    time_out: t[i].time_out,
                                    lastName: t[i].getLastName(),
                                    firstName: t[i].getFirstName(),
                                    patronymicName: t[i].getPatronymicName(),
                                    moment_in: intv,
                                    moment_out: outv,
                                    diffMillsec: subs
                                })
                            );
                        }
                    }
                }
            },
            restrict: "A",
            templateUrl: function (element, attributes) {
                var week = '/js/private/admin/calendars/views/home.admin.calendar.week.html';
                var calendar = '/js/private/admin/calendars/views/home.admin.calendar.month.html';
                //var calendar = '/js/private/admin/attendances/tpl/views/view.calendar.html';
                // выбор внешнего шаблона на основе атрибута template
                return attributes["template"] == "calendar" ? calendar : week;
            },
            scope: true  // каждый экземпляр директивы должен работать со своим scope и наследовать scope своего контроллера
            // scope:{} // В данном случае директива создается с изолированным scope - данный scope не участвует в наследовании.

            // true - элемент, которому будет присвоена директива будет заменен разметкой сгенерированной по шаблону
            // false - в элемент, к которому присвоена директива, будет добавлена разметка
            // Для того, чтобы увидеть эффект работы директивы, необходимо открыть инспектор DOM в браузере
            //replace:true
        }
    })
    .directive('calendar', function (Attendances) { // функция компиляции директивы (фабричная функция)
        return {
            restrict: 'E',
            scope: {
                // =daysPeriod - эта переменная из tpl скоупа,
                // слева - переменная (daysPeriod) из шаблона директивы
                daysPeriod: '=daysPeriod',
                refresh: '&'
            },
            templateUrl: '/js/private/admin/calendars/views/home.admin.calendar.month.html',
            replace: true,
            link: function (scope) {

                scope.limit = 2000;
                scope.numPage = 1;
                scope.week = 'week';
                scope.month = 'month';
                scope.nedela = 'неделя';
                scope.mesiac = 'месяц';

                var interval = {
                    start: moment().startOf(scope.globalPeriod).date(1).hours(0).minutes(0).seconds(0).milliseconds(0),
                    end: moment().endOf(scope.globalPeriod)
                };

                scope.getQuery = function (query) {
                    //console.log('query:');
                    //console.log(query);
                    if (!angular.isDefined(query))return;
                    scope.attendance = Attendances.query(
                        query,
                        function (attendanceEmployees, err) {
                            //console.log('QUERY');
                            //console.log(attendanceEmployees);
                            scope.attendance = attendanceEmployees;
                            scope.attendance.$promise
                                .then(function group(result) {
                                    var data = [];
                                    /**
                                     * store - получаем массив уникальных ФИО
                                     * data - начинаем формировать данные для вывода в календарь
                                     */

                                    var store = {};
                                    scope.nameArray = result.map(function (item, i) {
                                        var key = item.getShortName2();
                                        store[key] = true;

                                    });

                                    var str = Object.keys(store);
                                    var lengthDForm = scope.daysPeriod.dForm.length;
                                    for (var i = 0; i < str.length; i++) {
                                        data.push({'fio': str[i], 'data': [], 'objData': new Array(lengthDForm)});
                                    }

                                    result.store = store;
                                    result.data = data;
                                    return result;
                                })
                                .then(function f4(result) {
                                    var periodDate = {};
                                    for (var ie = 0; ie < scope.daysPeriod.dForm.length; ie++) {
                                        var k = scope.daysPeriod.dForm[ie]; // для каждого элемента создаём свойство
                                        periodDate[k] = true; // значение здесь не важно

                                    }

                                    for (var i = 0; i < result.length; i++) {
                                        var shortName = result[i].getShortName2();
                                        var dateResult = result[i].date;
                                        for (var j = 0; j < result.data.length; j++) {
                                            if (result.data[j].fio === shortName) {
                                                var t = {
                                                    'date': result[i].date,
                                                    'result': result[i].result,
                                                    'getDate': function () {
                                                        return this.date;
                                                    }
                                                };
                                                /**
                                                 *  Заполнение матрицы.
                                                 *  Нашли объект с именем.
                                                 *  Нужно понять вставлять ли в массив result.data[j].objData
                                                 *  объект с результатом на эту дату или вставить пустой результат,
                                                 *  чтоб не выводилась в ячейки ни какая информация
                                                 */

                                                var key = scope.daysPeriod.dForm.indexOf(result[i].date);
                                                result.data[j].objData.splice(key, 1, t);
                                            }
                                        }
                                    }
                                    console.log('result.data',result.data);

                                    scope.data = result.data;
                                })
                        }
                    );
                };

                scope.currentPeriod = function (period) {
                    scope.globalPeriod = (period === scope.week) ? scope.week : scope.month;
                    scope.section = (period === scope.week) ? scope.nedela : scope.mesiac;
                    scope.interval = {};
                    scope.interval = interval;
                    scope.interval.start = moment().startOf(scope.globalPeriod).date(1);
                    scope.restart();
                };


                scope.restart = function () {
                    var recurrence;

                    var dForm = [];
                    var daysPeriod = {data: []};

                    //console.log('momentrecur:',  moment().recur({
                    //    start: "01/01/2014",
                    //    end: "01/01/2015"
                    //}));
                    if (angular.isDefined(scope.interval)) {
                        var start = scope.interval.start;
                        var end = scope.interval.end;
                        recurrence = moment().recur(start, end).every(1).days(1);

                        // subtract - вычитание
                        //recurrence.start.subtract(1, 'days');
                        //recurrence.end.subtract(1, 'days');

                        /**
                         *  Массив объектов moment в количестве 31 дня
                         *  Например с 01.03.2017 по 31.03.2017
                         *  либо по 01 следующего месяца, если месяц 30 дней
                         */
                        daysPeriod.data = recurrence.next(31);

                        //console.log('daysPeriod.data[0]: ',daysPeriod.data[0]);
                        scope.getQuery({
                            /**
                             *  timeClear: 1 - чистое время прибывания на работе за день
                             *  timeClear: 0 - общее время на работе за день
                             *  по умолчанию чистое, т.е. true
                             */

                            timeClear: 0,
                            startDate: daysPeriod.data[0].format('YYYY-MM-DD'),
                            endDate: daysPeriod.data[30].format('YYYY-MM-DD')
                            //startDate: '2016-10-01',
                            //endDate: '2016-11-01',
                            // Кол-во строк показываемых на странице
                            //  limit: scope.limit
                        });

                        console.log('daysPeriod.data[0]',daysPeriod.data[0].format('MMMM'));
                        console.log(moment.locale());

                        // Сегодняшняя дата (16.03.2017)
                        daysPeriod.currentDate = moment().format('DD.MM.YYYY');
                        // Текущий месяц (март)
                        daysPeriod.periodMonth = daysPeriod.data[0].format('MMMM');
                        // Текущий год (2017)
                        daysPeriod.periodYear = daysPeriod.data[0].format('YYYY');
                    }
                    else {
                        scope.currentPeriod();
                    }

                    daysPeriod.data.forEach(function (item, i) {
                        if (item.format('YYYY-MM-DD')) {
                            dForm.push(item.format('YYYY-MM-DD'));
                        }
                    });
                    daysPeriod.dForm = dForm;
                    scope.daysPeriod = daysPeriod;
                };

                scope.periodPrevNext = function (n, operator) {
                    var t = 0;
                    var y = scope.interval.end;
                    if (operator == 1) {
                        t = (n) ? (t + n) : t++;
                    } else {
                        t = (n) ? (t - n) : t--;
                    }

                    if (scope.globalPeriod === scope.week) {
                        scope.interval = scope.interval.start.recur().every(1).weeks();
                        scope.interval.end = y.recur().every(1).weeks().start;
                    }
                    if (scope.globalPeriod === scope.month) {
                        scope.interval = scope.interval.start.recur().every(1).months();
                        scope.interval.end = y.recur().every(1).months().start;
                    }

                    scope.interval.start.add(t, scope.globalPeriod);
                    scope.interval.end.add(t, scope.globalPeriod);
                    scope.restart();
                };
                scope.currentPeriod();
                scope.restart();
            }
        };
    })
;