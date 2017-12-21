'use strict';
angular.module('VacationModule')
    .controller('EditVacationController', ['$scope', '$http', 'toastr', '$interval', '$state', 'Users', 'Vacations', 'moment', 'Positions', 'Departments', '$stateParams', 'FileUploader', '$rootScope',
        function ($scope, $http, toastr, $interval, $state, Users, Vacations, moment, Positions, Departments, $stateParams, FileUploader, $rootScope) {
            $scope.me = window.SAILS_LOCALS.me;

            //var t = moment().twix(new Date('2017-08-24T01:00:00'));
            //console.log('Это текущая дата?: ', t.isCurrent()); // false
            //console.log('Выбрано дней:', t.count('day')); //=> 1
            //console.log('Форматирование: ', t.format());  // 'Jan 25, 1982, 9:30 AM - 1:30 PM'
            //console.log('Простой парсинг времени из даты:', t.simpleFormat("H:mm")); // '9:30 - 1:30'
            //console.log('1',t.isSame("day"));               //=> true
            //console.log('2',t.humanizeLength());            //=> "4 hours"
            //console.log('3',t.count("days"));               //=> 1
            //console.log('4',t.isPast());                   //=> true
            //console.log('5',t.contains("2017-10-25T10:00"А)); //=> true

            /**
             * Выбор отображения года в календаре, при загрузке странице
             * Пользователям показывается текущий год
             * Админу и кадрам год установленный в интерфейсе
             */
            $scope.yearFrom = ($scope.me['kadr'] || $scope.me['admin'] ) ? (($scope.me.interfaces) ? $scope.me.interfaces[0].year : moment().year()) : moment().year();

            var info = {
                changed: 'Изменения сохранены!',
                error: 'Ошибка!',
                isSimilar: 'Есть похожий: ',
                ok: 'OK!',
                objectDelete: 'Объект удалён.',
                newUserOk: 'Успешно создан.',
                redirectSelf: 'home.admin.vacations',
                ru: 'ru',
                dateFormat: "d.m.Y",
                minDate: "01-01-1950",
                //maxDate: function () {
                //
                //
                //
                //},
                maxTwoWeek: '14 дней максимальный период планирования для одного отпуска. Вы можете запланировать несколько отпусков последовательно. ВНИМАНИЕ! Если необходим отпуск более 14 дней рекомендуем согласовать период с руководителем и кадровой службой. ',
            };

            if (!$scope.me.admin && !$scope.me.kadr) $state.go(info.redirectSelf);
            $scope.close = 1;
            $scope.intersect = false;
            $scope.loginAdmin = false;
            $scope.flatpicker = {};
            $scope.selectAvatarUrl = $scope.me.avatarUrl;
            $scope.edit = $state.includes('home.admin.vacations.edit');
            $scope.comment = false;
            $scope.toogle = function () {
                $scope.comment = ($scope.comment) ? false : true;
            };
            $scope.showVacation = {
                loading: false
            };


            $scope.countsChar = function (message) {
                if (!message)return $scope.countCh = undefined;
                $scope.countCh = (900 - message.length);
                return $scope.countCh
            };


            /**
             * TODO Chat
             * Пока нет соединения с комнотой чата,
             * кнопка управления отправки сообщений не активна
             * @type {boolean}
             */
            $scope.hasJoinedRoom = false;
            /**
             * Получить идентификатор отпуска из текущего URL-адреса:
             * /admin/vacations/edit/5a2a6006a6daf7103082dbfb
             */
            $scope.vacationId = window.location.pathname.split('/')[4];
            /**
             * Отправьте запрос сокета, чтобы присоединиться к комнате чата.
             */
            io.socket.put('/vacation/' + $scope.vacationId + '/join', function (data, JWR) {
                // Если что-то пошло не так, обработайте ошибку.
                if (JWR.statusCode !== 200) {
                    console.log('JJJJJJJAA',JWR);
                    if(angular.isString(JWR.body)) toastr.error(JWR.body, info.error);
                    return;
                }
                /**
                 *  Если сервер дал нам свое благословение и указал, что мы
                 *  можем успешно присоединиться к комнате, тогда мы установим это в
                 *  scope, чтобы пользователь мог начать отправлять чаты.
                 *  Обратите внимание, что на этом этапе мы также сможем запустить _receiving_ чаты.
                 *
                 */
                $scope.hasJoinedRoom = true;
                /**
                 * Поскольку io.socket.get () не является объектом angular, нам нужно вызвать
                 * $scope.$apply()
                 * в этом обратном вызове, чтобы наши изменения в scope действительно вступили в силу.
                 */
                $scope.$apply();
            });
            /**
             *  $scope.chats = (window.SAILS_LOCALS.chats) ? window.SAILS_LOCALS.chats : [];
             *  Слушатель события сокетов, который запускается при отправке нового события чата (.broadcast)
             */
            io.socket.on('vacation', function (e) {
                $scope.chats = (angular.isArray($scope.chats)) ? $scope.chats : [];
                // Добавим чат, который мы только что получили
                $scope.chats.push(e);
                /**
                 * Поскольку io.socket.on () не является angular объектом, нам нужно вызвать $scope. $Apply() в
                 * этот обработчик событий, чтобы наши изменения в scope действия действительно вступили в силу.
                 */
                $scope.$apply();
            });

            $scope.sendMessage = function () {
                $scope.vacationId = window.location.pathname.split('/')[4];
                /**
                 * Отправьте запрос сокета, чтобы присоединиться к комнате чата.
                 */
                io.socket.put('/vacation/' + $scope.vacationId + '/join', function (data, JWR) {
                    // Если что-то пошло не так, обработайте ошибку.
                    if (JWR.statusCode !== 200) {
                        console.error(JWR);

                        toastr.error(JWR.body, info.error);
                        // TODO
                        return;
                    }
                    /**
                     *  Если сервер дал нам свое благословение и указал, что мы
                     *  можем успешно присоединиться к комнате, тогда мы установим это в
                     *  scope, чтобы пользователь мог начать отправлять чаты.
                     *  Обратите внимание, что на этом этапе мы также сможем запустить _receiving_ чаты.
                     *
                     */
                    $scope.hasJoinedRoom = true;
                    /**
                     * Поскольку io.socket.get () не является объектом angular, нам нужно вызвать
                     * $scope.$apply()
                     * в этом обратном вызове, чтобы наши изменения в scope действительно вступили в силу.
                     */
                    $scope.$apply();
                });
                if(!$scope.vacationId) toastr.error('ID отпуска к сообщению не установлен',info.error);

                io.socket.post('/vacation/' + $scope.vacationId + '/chat', {
                    message: $scope.message,
                    name: $scope.item.name
                    //owner:'59f855fc58f4be1ccc2d7bf4'
                }, function (data, JWR) {
                    // Если что-то пошло не так, обработайте ошибку.
                    if (JWR.statusCode !== 200) {
                        console.error(JWR);
                        toastr.error(JWR.body, info.error);
                        return;
                    }
                    // Очистите поле сообщения чата. (но сначала сохраним его содержимое, чтобы мы могли добавить его)
                    var messageWeJustChatted = $scope.message;
                    $scope.message = '';

                    $scope.$apply();
                });
            };

            $scope.whenTyping = function (event) {
                io.socket.request({
                    url: '/vacation/' + $scope.vacationId + '/typing',
                    method: 'put'
                }, function (data, JWR) {
                    // Если что-то пошло не так, обработайте ошибку.
                    if (JWR.statusCode !== 200) {
                        console.error(JWR);
                        toastr.error(JWR.body, info.error);
                        return;
                    }
                });
            };//</whenTyping>

            $scope.whenNotTyping = function (event) {
                io.socket.request({
                    url: '/vacation/' + $scope.vacationId + '/stoppedTyping',
                    method: 'put'
                }, function (data, JWR) {
                    // Если что-то пошло не так, обработайте ошибку.
                    if (JWR.statusCode !== 200) {
                        console.error(JWR);
                        toastr.error(JWR.body, info.error);
                        return;
                    }
                });
            };


            function Calendar() {
                this.year = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1, new Date().getFullYear() + 2];

                /**
                 * Праздники и выходные дни по годам,
                 */
                let data = [
                    {
                        "Год/Месяц": "2016",
                        "Январь": "1,2,3,4,5,6,7,8,9,10,16,17,23,24,30,31",
                        "Февраль": "6,7,13,14,20*,21,22,23,27,28",
                        "Март": "5,6,7,8,12,13,19,20,26,27",
                        "Апрель": "2,3,9,10,16,17,23,24,30",
                        "Май": "1,2,3,7,8,9,14,15,21,22,28,29",
                        "Июнь": "4,5,11,12,13,18,19,25,26",
                        "Июль": "2,3,9,10,16,17,23,24,30,31",
                        "Август": "6,7,13,14,20,21,27,28",
                        "Сентябрь": "3,4,10,11,17,18,24,25",
                        "Октябрь": "1,2,8,9,15,16,22,23,29,30",
                        "Ноябрь": "3*,4,5,6,12,13,19,20,26,27",
                        "Декабрь": "3,4,10,11,17,18,24,25,31",
                        "Всего рабочих дней": "247",
                        "Всего праздничных и выходных дней": "119",
                        "Количество рабочих часов при 40-часовой рабочей неделе": "1974",
                        "Количество рабочих часов при 36-часовой рабочей неделе": "1776.4",
                        "Количество рабочих часов при 24-часовой рабочей неделе": "1183.6"
                    },
                    {
                        "Год/Месяц": "2017",
                        "Январь": "1,2,3,4,5,6,7,8,14,15,21,22,28,29",
                        "Февраль": "4,5,11,12,18,19,22*,23,24,25,26",
                        "Март": "4,5,7*,8,11,12,18,19,25,26",
                        "Апрель": "1,2,8,9,15,16,22,23,29,30",
                        "Май": "1,6,7,8,9,13,14,20,21,27,28",
                        "Июнь": "3,4,10,11,12,17,18,24,25",
                        "Июль": "1,2,8,9,15,16,22,23,29,30",
                        "Август": "5,6,12,13,19,20,26,27",
                        "Сентябрь": "2,3,9,10,16,17,23,24,30",
                        "Октябрь": "1,7,8,14,15,21,22,28,29",
                        "Ноябрь": "3*,4,5,6,11,12,18,19,25,26",
                        "Декабрь": "2,3,9,10,16,17,23,24,30,31",
                        "Всего рабочих дней": "247",
                        "Всего праздничных и выходных дней": "118",
                        "Количество рабочих часов при 40-часовой рабочей неделе": "1973",
                        "Количество рабочих часов при 36-часовой рабочей неделе": "1775.4",
                        "Количество рабочих часов при 24-часовой рабочей неделе": "1182.6"
                    },
                    {
                        "Год/Месяц": "2018",
                        "Январь": "1,2,3,4,5,6,7,8,13,14,20,21,27,28",
                        "Февраль": "3,4,10,11,17,18,22*,23,24,25",
                        "Март": "3,4,7*,8,9,10,11,17,18,24,25,31",
                        "Апрель": "1,7,8,14,15,21,22,28*,29,30",
                        "Май": "1,2,5,6,8*,9,12,13,19,20,26,27",
                        "Июнь": "2,3,9*,10,11,12,16,17,23,24,30",
                        "Июль": "1,7,8,14,15,21,22,28,29",
                        "Август": "4,5,11,12,18,19,25,26",
                        "Сентябрь": "1,2,8,9,15,16,22,23,29,30",
                        "Октябрь": "6,7,13,14,20,21,27,28",
                        "Ноябрь": "3,4,5,10,11,17,18,24,25",
                        "Декабрь": "1,2,8,9,15,16,22,23,29*,30,31",
                        "Всего рабочих дней": "247",
                        "Всего праздничных и выходных дней": "118",
                        "Количество рабочих часов при 40-часовой рабочей неделе": "1970",
                        "Количество рабочих часов при 36-часовой рабочей неделе": "1772.4",
                        "Количество рабочих часов при 24-часовой рабочей неделе": "1179.6"
                    },
                    {
                        "Год/Месяц": "2019",
                        "Январь": "1,2,3,4,5,6,7,8,9,10,12,13,19,20,26,27",
                        "Февраль": "2,3,9,10,16,17,22*,23,24,25",
                        "Март": "2,3,7*,8,9,10,16,17,23,24,30,31",
                        "Апрель": "6,7,13,14,20,21,27,28,30*",
                        "Май": "1*,4,5,8*,9,11,12,18,19,25,26",
                        "Июнь": "1,2,8,9,11*,12,15,16,22,23,29,30",
                        "Июль": "6,7,13,14,20,21,27,28",
                        "Август": "3,4,10,11,17,18,24,25,31",
                        "Сентябрь": "1,7,8,14,15,21,22,28,29",
                        "Октябрь": "5,6,12,13,19,20,26,27",
                        "Ноябрь": "2,3,4*,9,10,16,17,23,24,30",
                        "Декабрь": "1,7,8,14,15,21,22,28,29,31*",
                        "Всего рабочих дней": "247",
                        "Всего праздничных и выходных дней": "118",
                        "Количество рабочих часов при 40-часовой рабочей неделе": "1970",
                        "Количество рабочих часов при 36-часовой рабочей неделе": "1772.4",
                        "Количество рабочих часов при 24-часовой рабочей неделе": "1179.6"
                    }
                ];


                let months = [
                    {'Январь': '01'},
                    {'Февраль': '02'},
                    {'Март': '03'},
                    {'Апрель': '04'},
                    {'Май': '05'},
                    {'Июнь': '06'},
                    {'Июль': '07'},
                    {'Август': '08'},
                    {'Сентябрь': '09'},
                    {'Октябрь': '10'},
                    {'Ноябрь': '11'},
                    {'Декабрь': '12'}
                ];

                /**
                 * Официальные праздники РФ
                 */
                let holiday = [
                    '01.01',
                    '02.01',
                    '03.01',
                    '04.01',
                    '05.01',
                    '06.01',
                    '07.01',
                    '08.01',
                    '23.02',
                    '08.03',
                    '01.05',
                    '09.05',
                    '12.06',
                    '04.11'
                ];
                this.getData = function () {
                    return data;
                };
                this.getMonths = function () {
                    return months;
                };
                this.getHolidayRF = function () {
                    return holiday;
                };
            }

            Calendar.prototype.showData = function () {
                return console.log('Доступные данные:', this.getData());
            };
            Calendar.prototype.getYears = function () {
                let data = this.getData();
                let y = this.year;
                let ob = [];
                data.forEach(function (v, k, arr) {
                    let g = v["Год/Месяц"];
                    if (y.indexOf(+g) >= 0) {
                        v.year = g;
                        ob.push(v);
                    }
                });
                return ob;
            };
            Calendar.prototype.getCreateDate = function () {
                let years = this.getYears();
                let m = this.getMonths();
                let days = [];
                for (let k in m) {
                    for (let y in years) {
                        for (let key in years[y]) {
                            if (m[k][key]) {
                                let o = {};
                                o.getOfDay = function () {
                                    let j = [];
                                    let reg = /\*/;
                                    for (let d in this.holiday) {
                                        let day = this.holiday[d];
                                        if (day.match(reg) === null) {
                                            j.push(day + '.' + this.number + '.' + this.year);
                                        }
                                    }
                                    return j;
                                };
                                o.celebration = function () {
                                    let j = [];
                                    let reg = /\*/;
                                    for (let d in this.holiday) {
                                        let day = this.holiday[d];
                                        if (day.match(reg) !== null) {
                                            j.push(day + '.' + this.number + '.' + this.year);
                                        }
                                    }
                                    return j;
                                };
                                o.number = m[k][key];
                                o.month = key;
                                o.year = years[y].year;
                                o.holiday = years[y][key].split(',');
                                days.push(o);
                            }
                        }
                    }
                }
                return days;
            };
            Calendar.prototype.getDayOff = function () {
                let d = this.getCreateDate();
                var ar = [];
                d.forEach(function (v, k, arr) {
                    ar = ar.concat(v.getOfDay());
                });
                return ar;
            };
            Calendar.prototype.getCelebration = function () {
                let d = this.getCreateDate();
                var ar = [];
                d.forEach(function (v, k, arr) {
                    ar = ar.concat(v.celebration());
                });
                return ar;
            };
            Calendar.prototype.getHoliday = function () {
                let h = this.getHolidayRF();
                let y = this.year;
                let arr = [];
                for (let i in y) {
                    for (let d in h) {
                        arr.push(h[d] + '.' + y[i]);
                    }
                }
                return arr;
            };
            Calendar.prototype.getCountDay = function (arr) {
                if (angular.isArray(arr) && arr.length == 2) {
                    let h = this.getHoliday();
                    let t = moment(arr[0]).twix(new Date(arr[1]));
                    let count = +t.count('day');
                    for (let i in h) {
                        if (moment(h[i], 'DD.MM.YYYY').isBetween(arr[0], arr[1])) {
                            count--
                        }
                        if (moment(h[i], 'DD.MM.YYYY').isSame(arr[0])) {
                            count--
                        }
                        if (moment(h[i], 'DD.MM.YYYY').isSame(arr[1])) {
                            count--
                        }
                    }
                    return count;
                }
            };
            /**
             * Метод проверяет,
             * пересекается ли выбраный период с уже созданными ранее периодами
             * @param selectedDates
             */
            Calendar.prototype.checkBetween = function (selectedDates) {
                if (angular.isArray(selectedDates) && selectedDates.length == 2) {



                    //let h = this.getHoliday();
                    //let t = moment(arr[0]).twix(new Date(arr[1]));
                    //let count = +t.count('day');
                    //for (let i in h) {
                    //    if (moment(h[i], 'DD.MM.YYYY').isBetween(arr[0], arr[1])) {
                    //        count--
                    //    }
                    //    if (moment(h[i], 'DD.MM.YYYY').isSame(arr[0])) {
                    //        count--
                    //    }
                    //    if (moment(h[i], 'DD.MM.YYYY').isSame(arr[1])) {
                    //        count--
                    //    }
                    //}
                    //return count;
                }
            };

            let Working = new Calendar();
            let dayOff = Working.getDayOff(); //праздники и выходные
            let holiday = Working.getHoliday(); // праздник
            let celebration = Working.getCelebration(); // пораньше на час


            $scope.iod = function () {
                $http.get('/schedule/max-year').then(function success(response) {
                        return $scope.r = moment(response.data.year, ['YYYY']).endOf("year").format('DD-MM-YYYY');
                    },
                    function errorCallback(response) {
                        //console.log('ERRR==', response);
                    }
                );
            };
            $scope.iod();
            $scope.$watch('r', function (val) {
                if(val) console.log('++++++++++++++++NEW YERA',val); $scope.dateOpts.maxDate = val;
            });


            $scope.dateOpts = {
                locale: info.ru, // язык
                mode: "range", // диапазон дат выбрать
                dateFormat: info.dateFormat, // формат даты
                minDate: 'today', // минимальная дата
                allowInput: true, // ручной ввод даты
                inline: true, // календарь открыт
                // Обработчик события на изменения даты
                //onChange: function(selectedDates, dateStr, instance) {
                //    console.log('selectedDates',selectedDates);
                //},

                // onReady запускается после того, как календарь находится в готовом состоянии
                onReady: [
                    function(selectedDates, dateStr, instance){
                        /**
                         *  Устанавливаем на календарь максимально доступный год,
                         *  который запланирован в Графике отпусков
                         */
                        $http.get('/schedule/max-year').then(function success(response) {
                                instance.config.maxDate = moment(response.data.year, ['YYYY']).endOf("year").format('DD-MM-YYYY');
                            },
                            function errorCallback(response) {
                                //console.log('ERRR==', response);
                            }
                        );

                    },
                    function(selectedDates, dateStr, instance){
                        //...
                    }
                ],
                
                // Обработчик события на изменения года
                onYearChange: function (selectedDates, dateStr, instance) {
                    //console.log('CHANGE1', instance);
                    $scope.yearFrom = instance.currentYear;
                    //console.log('ESS',  $scope.yearFrom);
                    $scope.$apply();
                },
                onDayCreate: function (dObj, dStr, fp, dayElem) {
                    dayOff.forEach(function (v, k, arr) {
                        if (moment(arr[k], 'DD.MM.YYYY').isSame(dayElem.dateObj)) {
                            dayElem.innerHTML += "<span   class='event busy'></span>";
                        }
                    });
                    celebration.forEach(function (v, k, arr) {
                        if (moment(arr[k], 'DD.MM.YYYY').isSame(dayElem.dateObj)) {
                            dayElem.innerHTML += "<span title='На час пораньше'  class='event celebration'>*</span>";
                        }
                    });
                    holiday.forEach(function (v, k, arr) {
                        if (moment(arr[k], 'DD.MM.YYYY').isSame(dayElem.dateObj)) {
                            dayElem.innerHTML += "<span title='Праздник'  class='event busy holiday'></span>";
                        }
                    });
                },
                //disable: [
                //    function(date) {
                //        // отключить каждый  8 ой
                //        return !(date.getDate() % 2);
                //    }
                //]

                //parseDate: function (str) {
                //    console.log('new Date(str)',new Date(str.selectedDates));
                //    return new Date(str.selectedDates);
                //}
                //maxDate: '31-12-2019'// максимальная дата
                //defaultDate: [moment().year($scope.me.interfaces[0].year)._d, moment().year($scope.me.interfaces[0].year)._d] // по умолчанию какая дата отображается
            };


            io.socket.on('interface', function (e) {
                $scope.yearFrom = e.interfaces[0].year;
                /**
                 * Устанавливаем год интерфейса для пересечений
                 */
                $scope.me.interfaces[0].year = e.interfaces[0].year;
                $scope.refresh();
                $scope.$apply();
            });


            $scope.fixTwoWeek = function () {
                if (($scope.daysSelectHoliday > 14) && !$scope.item.maxTwoWeek) {
                    toastr.warning(info.maxTwoWeek);
                    return fpItem.clear();
                }
            };

            /**
             * Это функция срабатывает каждый раз после выбора даты
             * Принимает объект flatpicker c вновь выбранными датами или одной датой
             * по сути это обработчик события onChange в документации Flatpickr
             * https://chmln.github.io/flatpickr/options/#eventsAPI
             *
             * console.log('changeMonth', fpItem.changeMonth(1)) - изменяет текущий месяц на один вперед
             * console.log('changeMonth', fpItem.changeMonth(0, false)) - изменяет текущий месяц на январь, после каждого клика
             *
             * @param fpItem
             * @returns {*}
             */
            $scope.datePostSetup = function (fpItem) {
                $scope.flatpicker = fpItem;
                /**
                 * Кол-во выбраных дней
                 */
                $scope.daysSelectHoliday = Working.getCountDay(fpItem.selectedDates);
                if (($scope.daysSelectHoliday > 14) && !$scope.item.maxTwoWeek) {
                    toastr.warning(info.maxTwoWeek);
                }
                if ($scope.intersection) {
                    let x = [];
                    $scope.intersection.forEach(function (val, key, arr) {
                        if (fpItem.selectedDates[0]) {
                            (moment(fpItem.selectedDates[0]).isBetween(val.from, val.to)) ? val.inr = 1 : val.inr = 0;
                            //console.log('#1Проверяемое число c индексом ноль:', fpItem.selectedDates[0]);
                            //console.log('Входит ли в этот промежуток?:', 'c ' + val.from + ' по ' + val.to + ': ' + val.inr);

                            if (!val.inr) {
                                (moment(fpItem.selectedDates[0]).isSame(val.from) || moment(fpItem.selectedDates[0]).isSame(val.to)) ? val.inr = 1 : val.inr = 0;
                                //console.log('#2 Проверяемое число c индексом ноль:', fpItem.selectedDates[0]);
                                //console.log('Входит ли в этот промежуток?:', 'c ' + val.from + ' по ' + val.to + ': ' + val.inr);
                            }

                        }
                        if (fpItem.selectedDates[1] && !val.inr) {
                            (moment(fpItem.selectedDates[1]).isBetween(val.from, val.to)) ? val.inr = 1 : val.inr = 0;
                            //console.log('#1 Проверяемое число c индексом один:', fpItem.selectedDates[1]);
                            //console.log('Входит ли в этот промежуток?:', 'c ' + val.from + ' по ' + val.to + ': ' + val.inr);
                            if (!val.inr) {
                                (moment(fpItem.selectedDates[1]).isSame(val.from) || moment(fpItem.selectedDates[1]).isSame(val.to)) ? val.inr = 1 : val.inr = 0;
                                //console.log('#2 Проверяемое число c индексом один:', fpItem.selectedDates[1]);
                                //console.log('Входит ли в этот промежуток?:', 'c ' + val.from + ' по ' + val.to + ': ' + val.inr);
                            }
                        }

                        if (fpItem.selectedDates[0] && !val.inr && fpItem.selectedDates[1]) {
                            //console.log('******************************************************* // ************************************* ');
                            (moment(val.from).isBetween(fpItem.selectedDates[0], fpItem.selectedDates[1])) ? val.inr = 1 : val.inr = 0;
                            //console.log('Проверяем отпуск на предмет вхождение в промежуток чисел во вновь выбранном отуске.', val.from);
                            //console.log('Входит ли в этот промежуток?:', 'c ' + fpItem.selectedDates[0] + ' по ' + fpItem.selectedDates[1] + ': ' + val.inr);
                        }
                        //console.log('******************************************************* // ************************************* ');


                        x.push(val);
                    });
                    return $scope.intersection = x;
                }
            };

            /**
             * Очищает непосредственно объект Flatpicker в отличие
             * от revert() которая очищает всю форму
             */
            $scope.clear = function () {
                $scope.flatpicker.clear();
                $scope.intersection.forEach(function (val, key, arr) {
                    val.inr = 0;
                })
            };

            /**
             * Прошедшее время сообщений в чате
             */
            $scope.chatTime = function () {
                let y = [];
                $scope.tm.forEach(function (val, key, arr) {
                    val.time = moment(val.createdAt).fromNow();
                    y.push(val);
                });
                return y;
            };

            $scope.$watch('item.owner.id', function (value, old) {

                $scope.getIntersections(value);
                if (value) {
                    Users.get({id: value}, function (user) {
                        $scope.user = user;
                        if (!$scope.user.avatarUrl) {
                            return $scope.selectAvatarUrl = 'http://via.placeholder.com/150x150';
                        }
                        $scope.selectAvatarUrl = user.avatarUrl;
                        $scope.apply();
                    }, function (err) {
                        console.log('ERRd:', err);
                    });
                }
//
            });

            /**
             * Отпуска из списка пересечений
             */
            $scope.getIntersections = function (id) {
                let query = (id) ? '/vacation/get-intersections/' + id : '/vacation/get-intersections';
                $http.get(query).then(function (response) {
                    $scope.intersection = response.data;
                    $scope.datePostSetup($scope.flatpicker);
                }, function errorCallback(err) {
                    console.log('ERROR:', err);
                });
            };

            $scope.getIntersections();

            $scope.refresh = function () {
                let item = $scope.item = Vacations.get({id: $stateParams.vacationId}, function (vacations) {
                        //console.log('VACATION ITEM:', vacations);
                        $scope.vacations = vacations;
                        $scope.tm = vacations.chats;
                        $scope.chats = $scope.chatTime();
                        $scope.flatpicker.setDate(vacations.name);

                        item.getBirthday();
                        item.getDateInWork();
                        item.getFiredDate();
                        item.getDecree();
                    }, function (err) {
                        // активируем по умолчанию создаваемую запись
                        item.action = true;
                        item.sc = function () {
                            return 'Отпуск';
                        };

                    }
                );
            };

            $scope.delete2 = function (item) {
                console.log('item', item);
                item.$delete({id: item.id}, function (success) {
                    console.log('****!!', success);
                    toastr.success(info.objectDelete, info.ok);
                    $state.go(info.redirectSelf);
                    // $location.path("/table");
                    // $scope.$apply(function() { $location.path("/admin/vacations"); });
                    // $scope.refresh();
                }, function (err) {
                    toastr.error(err, info.error + ' 122! ');
                })
            };

            $scope.getArrIntersection = function (item) {
                return $scope.flatpicker;
            };

            $scope.saveEdit = function (item) {
                $scope.fixTwoWeek();
                if (!angular.isDefined(item))toastr.error('Нет объекта для сохранения.', 'Ошибка!');
                if (!angular.isDefined(item.name)) return toastr.error('Дата не может быть пустой.', 'Ошибка!');
                if (!angular.isDefined(item.furlough)) return toastr.error('Тип отпуска не может быть пустой.', 'Ошибка!');
                item.from = $scope.flatpicker.selectedDates[0];
                item.to = $scope.flatpicker.selectedDates[1];
                item.daysSelectHoliday = +$scope.daysSelectHoliday;
                console.log('XXXXXXXP', $scope.item);
                if (angular.isDefined(item.id) && angular.isDefined(item.name)) {
                    item.$update(item, function (success) {
                            toastr.success(info.changed);
                            $scope.refresh();
                        },
                        function (err) {
                            toastr.error(err.data, info.error + ' 11445!');
                        }
                    );
                } else {
                    if (angular.isDefined(item)) {
                        item.daysSelectHoliday = $scope.daysSelectHoliday;
                        console.log('item:::', item);
                        console.log('furlough::', $scope.furlough);
                        item.$save(item, function (success) {
                                toastr.success(info.newUserOk);
                                //$location.path('/profile') ;
                                $state.go('home.admin.vacation', {vacationId: success.id});
                            },
                            function (err) {
                                //toastr.error(err, 'Ошибка 3990');
                                //console.log('err.data',err.data);
                                toastr.error(err.data, info.error + ' 890');
                            });
                    }
                }
            };

            $scope.addPosition = function () {
                if (angular.isArray($scope.item.positions)) {
                    $scope.item.positions.push({});
                } else {
                    $scope.item.positions = [{}];
                }
            };

            $scope.addFurlough = function () {
                console.log('$scope.item.furloughs', $scope.item.furloughs);
                if (angular.isArray($scope.item.furloughs)) {
                    $scope.item.furloughs.push({});
                } else {
                    $scope.item.furloughs = [{}];
                    //$scope.item.furloughs = [{id:'599d8813b88be82bf00a1771'}];
                }
            };

            $scope.removeFurlough = function (furlough) {
                $scope.item.furloughRemove = [];
                if (!furlough.id) $scope.item.furloughs = [];
                for (let i = 0, ii = $scope.item.furloughs.length; i < ii; i++) {
                    if ($scope.item.furloughs[i].id === furlough.id) {
                        $scope.item.furloughs.splice(i, 1);
                        $scope.item.furloughRemove.push(furlough.id);
                        return;
                    }
                }
            };

            $scope.isCancelDisabled = function () {
                return angular.equals(master, $scope.form);
            };

            $scope.isSaveDisabled = function () {
                return $scope.myForm.$invalid || angular.equals(item, $scope.form);
            };

            let original = angular.copy($scope.item);

            $scope.revert = function () {
                $scope.item = angular.copy(original);
            };

            $scope.canRevert = function () {
                return !angular.equals($scope.item, original);
            };

            $scope.refresh();
        }]);
