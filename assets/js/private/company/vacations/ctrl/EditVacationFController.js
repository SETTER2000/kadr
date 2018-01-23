'use strict';
angular.module('VacationFModule')
    .controller('EditVacationFController', ['$scope', '$http', 'toastr', '$interval', '$state', 'UsersF', 'VacationsF', 'moment', 'Schedules', 'Departments', '$stateParams', 'FileUploader', '$rootScope', 'calendarService',
        function ($scope, $http, toastr, $interval, $state, UsersF, VacationsF, moment, Schedules, Departments, $stateParams, FileUploader, $rootScope, calendarService) {
            $scope.me = window.SAILS_LOCALS.me;
            if (!$scope.me || !$scope.me.vacation) return $state.go('home');
            $scope.debug = true;

            /**
             * Выбор отображения года в календаре, при загрузке странице
             * Пользователям показывается текущий год
             * Админу и кадрам год установленный в интерфейсе
             */
            $scope.yearFrom = ($scope.me['kadr'] || $scope.me['company'] ) ? (($scope.me.interfaces) ? $scope.me.interfaces[0].year : moment().year()) : moment().year();

            var info = {
                changed: 'Изменения сохранены!',
                error: 'Ошибка!',
                isSimilar: 'Есть похожий: ',
                ok: 'OK!',
                objectDelete: 'Объект удалён.',
                newUserOk: 'Успешно создан.',
                redirectSelf: 'home.company.vacations',
                ru: 'ru',
                dateFormat: "d.m.Y",
                // minDate: "01-01-1950",
                //maxDate: function () {
                //
                //
                //
                //},
                maxTwoWeek: '14 дней максимальный период планирования для одного отпуска. Вы можете запланировать несколько отпусков последовательно. ВНИМАНИЕ! Если необходим отпуск более 14 дней рекомендуем согласовать период с руководителем и кадровой службой. ',
            };

            //if (!$scope.me.company && !$scope.me.kadr) $state.go(info.redirectSelf);
            $scope.close = 1;
            $scope.intersect = false;
            $scope.loginAdmin = false;
            $scope.flatpicker = {};
            $scope.selectAvatarUrl = $scope.me.avatarUrl;
            $scope.edit = $state.includes('home.company.vacation');
            $scope.comment = false;
            $scope.toogle = function () {
                $scope.comment = ($scope.comment) ? false : true;
            };

            $scope.showVacation = {
                loading: false
            };

            $scope.countsChar = function (message) {
                if (!message) return $scope.countCh = undefined;
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
             * /company/vacations/edit/5a2a6006a6daf7103082dbfb
             */
            $scope.vacationId = window.location.pathname.split('/')[4];
            /**
             * Отправьте запрос сокета, чтобы присоединиться к комнате чата.
             */
            io.socket.put('/vacation/' + $scope.vacationId + '/join', function (data, JWR) {
                // Если что-то пошло не так, обработайте ошибку.
                if (JWR.statusCode !== 200) {
                    if (angular.isString(JWR.body)) toastr.error(JWR.body, info.error);
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
                $scope.vacationId = window.location.pathname.split('/')[3];
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
                if (!$scope.vacationId) toastr.error('ID отпуска к сообщению не установлен', info.error);

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


            let dayOff = calendarService.getDayOff(); //праздники и выходные
            let holiday = calendarService.getHoliday(); // праздник
            let celebration = calendarService.getCelebration(); // пораньше на час


            $scope.yearGet = ($scope.edit && $scope.item) ? $scope.item.from : $scope.me.interfaces[0].year;


            $scope.$watch('item.furlough.id', function (val) {
                console.log(' CHANGE $scope.item.furlough.id',  val);
                //console.log(' CHANGE 99 $scope.item.owner.id',  $scope.item.owner.id);
                if (val) {
                    //$scope.item.furlough.id = val;
                    console.log('GET DAYS YEAR: ' , $scope.getDaysYear());
                    if ($scope.me) $scope.getDaysYear();
                }
            });
            //$scope.$watch('remains', function (val) {
            //    console.log('REMAINS ', val);
            //    if (val <= 0) {
            //        console.log('FLAT: ', $scope.flatpicker);
            //        $scope.flatpicker.config._enable = [];
            //        $scope.flatpicker.set('disable', [{from: $scope.flatpicker.config._minDate, to: $scope.flatpicker.config._maxDate}]);
            //    }
            //});

            $scope.getDaysYear = function () {
                console.log('$scope.yearFrom' , $scope.yearFrom);
                console.log('$scope.item.furlough.id' , $scope.item.furlough.id);
                $http.get('/vacation/get-days-to-years?owner=' + $scope.me.id + '&year=' + +$scope.yearFrom + '&furlough=' + $scope.item.furlough.id)
                //$http.get('/vacation/get-days-to-years?owner=' + $scope.me.id + '&year=' + $scope.yearFrom + '&furlough=' + $scope.item.furlough.id)
                    .then(function onSuccess(sailsResponse) {
                        $scope.remains = $scope.remainsDub = 28;
                        console.log('DATTT config', sailsResponse.data);
                        //$scope.flatpicker.set('enable',[ {from:$scope.flatpicker.config._minDate, to:$scope.flatpicker.config._maxDate}]);
                        if (sailsResponse.data.length > 0) {
                            if (sailsResponse.data[0].remains <= 0 && !$scope.edit) {
                                $scope.flatpicker.config._enable = [];
                                $scope.flatpicker.set('disable', [{
                                    from: $scope.flatpicker.config._minDate,
                                    to: $scope.flatpicker.config._maxDate
                                }]);
                            }
                            $scope.remains = $scope.remainsDub = sailsResponse.data[0].remains;
                        } else {
                            $scope.flatpicker.set('enable', [{
                                from: $scope.flatpicker.config._minDate,
                                to: $scope.flatpicker.config._maxDate
                            }]);
                        }
                    })
                    .catch(function onError(sailsResponse) {
                        console.log(sailsResponse);
                    })
                    .finally(function eitherWay() {
                        $scope.userList.loading = false;
                    });
            };


            $scope.$watch('minDateConfig', function (val, old) {
                if (val) {
                    //$scope.getDaysYear(val, $scope.yearFrom);
                }
            });
            $scope.$watch('me.interfaces', function (val, old) {
                if (val) $scope.interFa = val[0].year;
            });


            //$scope.getCountSelectedHolidays = function () {
            //
            //    let qer = '/vacation/to-years?from=' + moment($scope.item.year,['YYYY']).format('YYYY-MM-DD') + '&to=' + moment($scope.item.year,['YYYY']).add(1,'year').format('YYYY-MM-DD');
            //    console.log('YEEEEEE', qer);
            //
            //    $http.get(qer).then(function (success) {
            //        console.log('DD', success.data);
            //        console.log('POPPP', success.data.filter((obj)=> {
            //            return (obj.numSelected > 0) ? obj.numSelected : '';
            //        }));
            //        $scope.countSelectedHolidays = success.data.filter((obj)=> {
            //            return (obj.numSelected > 0) ? obj.numSelected : '';
            //        }).length;
            //    });
            //};
            //
            //$scope.allDaysYearHoliday =  calendarService.getAllWorkHolidayDays($scope.me.interfaces[0].year);
            //$scope.getAllWorkDays = calendarService.getAllWorkDays($scope.me.interfaces[0].year);
            //$scope.getHours40Year = calendarService.getHoursYear($scope.me.interfaces[0].year,40);
            //$scope.getHours36Year = calendarService.getHoursYear($scope.me.interfaces[0].year,36);
            //$scope.getHours24Year = calendarService.getHoursYear($scope.me.interfaces[0].year,24);


            $scope.dateOpts = {
                locale: info.ru, // язык
                mode: "range", // диапазон дат выбрать
                dateFormat: info.dateFormat, // формат даты
                // minDate: 'today', // минимальная дата
                allowInput: true, // ручной ввод даты
                inline: true, // календарь открыт
                //currentYear: $scope.me.interfaces[0].year,
                // Обработчик события на изменения даты
                //onChange: function(selectedDates, dateStr, instance) {
                //    console.log('selectedDates',selectedDates);
                //},
                // defaultDate : ['2018-01-01','2019-12-31'],
                onYearChange: function (selectedDates, dateStr, instance) {
                    console.log('onYearChange', instance.currentYear);
                    /**
                     * Функция сервиса Calendar
                     * Возвращает число праздничных и выходных дней в году всего
                     * 1 аргумент: номер года
                     * 2 аргумент: строка например "Кол-во праздников и выходных в"
                     * Если данных на запрашиваемый год нет ничего не вернёт.
                     */
                    //$scope.getAllWorkDays = calendarService.getAllWorkDays(instance.currentYear);
                    //$scope.allDaysYearHoliday = calendarService.getAllWorkHolidayDays(instance.currentYear);
                    //$scope.getHours40Year = calendarService.getHoursYear(instance.currentYear,40);
                    //$scope.getHours36Year = calendarService.getHoursYear(instance.currentYear,36);
                    //$scope.getHours24Year = calendarService.getHoursYear(instance.currentYear,24);

                    if (instance.currentYear && $scope.item.furlough)$scope.getDaysYear();
                    
                    //$scope.$apply();
                },

                // onReady запускается после того, как календарь находится в готовом состоянии
                onReady: [
                    //function (selectedDates, dateStr, instance){
                    //    let yr = $scope.me.interfaces[0].year;
                    //    console.log('INTERSEC', yr);
                    //    if (!$scope.edit) instance.setDate([2018, 2018], true, "Y");
                    //
                    //},

                    function (selectedDates, dateStr, instance) {
                        let yr = moment($scope.me.interfaces[0].year, ['YYYYY']).format('YYYY-MM-DD');
                        if (!$scope.edit) instance.setDate([yr, yr], true, "Y-m-d");

                        /**
                         *  Устанавливаем на календарь максимально доступный год,
                         *  который запланирован в Графике отпусков
                         */
                        $http.get('/schedule/max-year')
                            .then(function onSuccess(sailsResponse) {
                                // console.log('***************sailsResponse: ', sailsResponse.data.year);
                                instance.config.maxDate = moment(sailsResponse.data.year, ['YYYY']).endOf("year").format('DD-MM-YYYY');

                            })
                            .catch(function onError(sailsResponse) {
                                //console.log(sailsResponse);
                            })
                            .finally(function eitherWay() {
                                $scope.userList.loading = false;

                            });
                    },
                    function (selectedDates, dateStr, instance) {
                        $http.get('/schedule/min-year')
                            .then(function onSuccess(sailsResponse) {

                                instance.config.minDate = $scope.minDateConfig = moment(sailsResponse.data.year, ['YYYY']).startOf("year").format('DD-MM-YYYY');

                                console.log('MIN DATE:', instance.config.minDate);
                            })
                            .catch(function onError(sailsResponse) {
                                //console.log(sailsResponse);
                            })
                            .finally(function eitherWay() {
                                $scope.userList.loading = false;
                            });
                    }
                ],
                onDayCreate: [
                    function (dObj, dStr, fp, dayElem) {
                        if (!$scope.sArr.length) return;
                        $scope.sArr.forEach(function (v, k, arr) {
                            if (moment(arr[k].from).isSame(dayElem.dateObj) || moment(arr[k].to).isSame(dayElem.dateObj) || moment(dayElem.dateObj).isBetween(arr[k].from, arr[k].to)) {
                                //dayElem.style.backgroundImage = '/images/whirlpool.png';
                                //dayElem.style.backgroundImage = "url('/images/45degreee_fabric_@2X.png')";
                                //dayElem.style.backgroundImage = "url('/images/whirlpool.png')";
                                dayElem.style.backgroundImage = "url('/images/leather_1_@2X.png')";
                                dayElem.style.color = "#393939";
                            }
                        });
                    },

                    function (dObj, dStr, fp, dayElem) {
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
                    }],

                onChange: function (dObj, dStr, fp, dayElem) {
                    //console.log('dObj', dObj);
                    let f = calendarService.getCountDay(dObj);
                    if (f && $scope.remains)  $scope.remains = ($scope.remainsDub - f);
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
                // $scope.refresh();
                $scope.$apply();
            });


            $scope.fixTwoWeek = function () {
                if (($scope.daysSelectHoliday > 14) && !$scope.item.maxTwoWeek) {
                    toastr.error(info.maxTwoWeek);
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
                $scope.daysSelectHoliday = calendarService.getCountDay(fpItem.selectedDates);
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

                    UsersF.get({id: value}, function (user) {

                        $scope.user = user;
                        console.log('USER', user);
                        if (!user.avatarUrl) {
                            $scope.selectAvatarUrl = 'http://via.placeholder.com/99x144';
                        }
                        $scope.selectAvatarUrl = user.avatarUrl;
                        $scope.getDaysYear(value, $scope.yearFrom);
                        //$scope.apply();
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
            $scope.sArr = [];
            $scope.rex = function (arr) {

                if (!angular.isArray(arr)) return arr;
                //if ($scope.flatpicker) console.log('$scope.flatpicker', $scope.flatpicker);
                arr.forEach(function (v, k, ar) {
                    //console.log('v.from:',moment(v.from).year());
                    //console.log('v.from+++:',$scope.interFa);
                    if (moment(v.from).year() == $scope.interFa) {
                        //console.log(' NEEEEEEE111', v);
                        $scope.sArr.push(v);
                    }
                });
                return $scope.sArr;
            };

            $scope.$watch('intersection', function (val) {
                //console.log('$scope.intersection4444444:', val);
                if (val)  $scope.rex(val);
            });

            $scope.refresh = function () {
                let item = $scope.item = VacationsF.get({id: $stateParams.vacationId, action:true}, function (vacations) {
                        console.log('VACATION ITEM:', vacations);
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
                item.$delete({id: item.id}, function (success) {
                    toastr.success(info.objectDelete, info.ok);
                    $state.go(info.redirectSelf);
                    // $location.path("/table");
                    // $scope.$apply(function() { $location.path("/company/vacations"); });
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
                if (!angular.isDefined(item)) return toastr.error('Нет объекта для сохранения.', 'Ошибка!');
                if (!angular.isDefined(item.name)) return toastr.error('Дата не может быть пустой.', 'Ошибка!');
                if (!angular.isDefined(item.furlough)) return toastr.error('Тип отпуска не может быть пустой.', 'Ошибка!');
                item.from = $scope.flatpicker.selectedDates[0];
                item.to = $scope.flatpicker.selectedDates[1];
                item.daysSelectHoliday = +$scope.daysSelectHoliday;
                if (item.daysSelectHoliday <= 0) return toastr.error('Не корректно выбраны даты отпуска. Возможно выбраны праздничные дни.', 'Ошибка!');
                if (angular.isDefined(item.id) && angular.isDefined(item.name)) {
                    item.$update(item, function (success) {
                            toastr.success(info.changed);
                            //$scope.refresh();

                            $state.go('home.company.vacations');
                        },
                        function (err) {
                            toastr.error(err.data, info.error + ' 11445!');
                        }
                    );
                } else {
                    if (angular.isDefined(item)) {
                        item.daysSelectHoliday = $scope.daysSelectHoliday;
                        item.$save(item, function (success) {

                                toastr.success(info.newUserOk);
                                //$location.path('/profile') ;
                                $state.reload();
                                //$state.go('home.company.vacation', {vacationId: success.id});
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


            $scope.dub = function (item) {
                //let item = angular.copy($scope.item);
                $http.get('/vacation/dub/' + item.owner.id + '/' + item.furlough.id)
                    .then(function onSuccess(sailsResponse) {

                        $scope.item2 = sailsResponse.data;
                        console.log('--------------RTTT: ', $scope.item2);

                    })
                    .catch(function onError(sailsResponse) {
                        console.log(sailsResponse);
                    })
                    .finally(function eitherWay() {
                        $scope.userList.loading = false;
                    });
                //$state.go('home.company.vacations.create',item);
                $scope.$watch('item2', function (val, old) {
                    console.log('VVal', val);
                    console.log('VVal -old', old);
                    if (val) {
                        $scope.item.owner = $scope.item2.owner;
                        $scope.item.furlough = $scope.item2.furlough;


                    }
                });
                $state.go('home.company.vacations.create', {ownerId: '59661ce496798b6c1ae0624a', furloughId: '599d87cbb88be82bf00a176f'});

            };
            $scope.refresh();

            //if(!edit){
            //
            //    $scope.ownerId = window.location.pathname.split('/')[4];
            //    $scope.furloughId = window.location.pathname.split('/')[5];
            //    $scope.item = {owner:{id:$scope.ownerId}, furlough:{id:$scope.furloughId}}
            //}
        }]);
