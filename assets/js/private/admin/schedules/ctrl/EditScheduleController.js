'use strict';
angular.module('ScheduleModule')
    .controller('EditScheduleController', ['$scope', '$http', '$parse', 'toastr', 'toastrConfig', '$interval', '$templateCache', '$state', 'Schedules', 'moment', 'Positions', 'Departments', 'Vacations', 'Users', '$stateParams', 'FileUploader', '$timeout', '$q', '$log', '$rootScope',
        function ($scope, $http, $parse, toastr, toastrConfig, $interval, $templateCache, $state, Schedules, moment, Positions, Departments, Vacations, Users, $stateParams, FileUploader, $timeout, $q, $log, $rootScope) {
            $scope.me = window.SAILS_LOCALS.me;
            $scope.edit = $state.includes('home.admin.schedules.edit');
            var info = {
                changed: 'Изменения сохранены!',
                passChange: 'Пароль обновлён!',
                error: function (num) {
                    if (!angular.isNumber(num)) return;
                    return 'Ошибка ' + num + '!';
                },
                warning: 'ВНИМАНИЕ!',
                requiredJpg: 'Расширение файла должно быть jpg.',
                isSimilar: 'Есть похожий: ',
                ok: 'OK!',
                objectDelete: 'Объект удалён.',
                newOk: 'Новый график создан.',
                passDefault: '111111',
                redirectSelf: 'home.admin.schedules',
                messageErr: 'Сообщение не установлено!',
                filedErr: function (nameFiled, text) {
                    if (!angular.isString(text)) return;
                    return 'Поле ' + nameFiled + ' - ' + text + '!';
                },
                ru: 'ru',
                dateFormat: "d.m.Y",
                dateTimeFormat: "d.m.Y H:i",
                minDate: "01-01-1950",
                maxDate: "31-12-2002"
            };
            $scope.debug = true;
            $scope.comment = false;

            angular.extend(toastrConfig, {
                //"closeButton": true,
                //"debug": false,
                //"newestOnTop": false,
                //"progressBar": true,
                //"positionClass": "toast-top-right",
                //"preventDuplicates": false,
                //"showDuration": "300",
                //"hideDuration": "1000",
                //"timeOut": "5000",
                //"extendedTimeOut": "1000",
                //"showEasing": "swing",
                //"hideEasing": "linear",
                //"showMethod": "fadeIn",
                //"hideMethod": "fadeOut"
            });

            //$scope.examples = ['settings', 'home', 'options', 'other'];
            $scope.year = moment().get('year');

            $scope.examples = [
                {
                    name: '№1',
                    tmpl: '<h1>Уважаемые коллеги!</h1> ' +
                    '<p>В целях исполнения требований Трудового кодекса РФ, а также для обеспечения нормальной работы компании в ' + ($scope.year + 1) + ' году ' +
                    'Генеральным директором подписан приказ о подготовке графика отпусков на ' + ($scope.year + 1) + ' год.</p> ' +
                    '<p>Коллеги, прошу  в срок до  <b>01.12.' + $scope.year + ' </b> ' +
                    'запланировать свои отпуска на ' + ($scope.year + 1) + ' год и внести информацию в единую информационную систему по ' +
                    'адресу: <a href="http://corp/beta/user.php">http://corp/beta/user.php</a></p>' +
                    '<p>&nbsp;</p> <p>' + $scope.me.positions[0].name + '<br> ЗАО НТЦ «Ландата»<br>' + $scope.me.lastName + ' ' + $scope.me.firstName[0] + '. ' + $scope.me.patronymicName[0] + '. </p>'
                },
                {
                    name: '№2',
                    tmpl: 'Шаблон №2 - нет вариантов'
                },
                {
                    name: '№3',
                    tmpl: 'Шаблон №3 - нет вариантов'
                },
                {
                    name: '№4',
                    tmpl: 'Шаблон №4 - нет вариантов'
                }
            ];


            $scope.toogle = function () {
                $scope.comment = ($scope.comment) ? false : true;
            };


            $scope.expr = "start | date:'dd.MM.yyyy HH:mm'";
            $scope.parseExpression = function () {
                var fn = $parse($scope.expr);
                $scope.item.start = $scope.timeDate = fn($scope.item);
            };

            $scope.$watch('year', function (val,old) {
                if(val){
                    $http.get('/schedule/to-years?year=' + val)
                        .then(function (data) {
                            $scope.sumDays = data.data.sumDays;
                        });
                }
            });

            $scope.$watch('schedules', function (val,old) {
                if(val){
                    $http.get('/schedule/to-years?year=' + val.year)
                        .then(function (data) {
                            $scope.sumDays = data.data.sumDays;
                        });
                }
            });


            $scope.radioData = [
                {label: 'работает', value: false},
                {label: 'уволен', value: true},
            ];

            $scope.addPersonName = 'Выбрать согласующих для';
            $scope.addPersonAnnounced = 'Выбрать оповещаемых для';
            $scope.addPersonIntersections = 'Выбрать "пересечения" для';
            $scope.addPersonIAgree = 'Выбрать "я согласующий" для';
            $scope.simulateQuery = false;
            $scope.isDisabled = false;

            $scope.getCountDay = function (arr) {
                if (angular.isArray(arr) && arr.length == 2) {
                    let h = [];
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
                //$scope.to = fpItem.selectedDates[1];
                //console.log('DASSS 1', fpItem.selectedDates[0]);
                //console.log('DASSS 2', fpItem.selectedDates[1]);
                $scope.item.from = fpItem.selectedDates[0];
                $scope.item.to = fpItem.selectedDates[1];
                /**
                 * Кол-во выбраных дней
                 */
                $scope.item.daysSelectHoliday = $scope.getCountDay(fpItem.selectedDates);
                console.log('DAY COUNT', $scope.daysSelectHoliday);

                if (($scope.daysSelectHoliday > 14) && !$scope.item.maxTwoWeek) {
                    toastr.warning(info.maxTwoWeek);
                }


                //console.log('******************************************************* // ************************************* ');
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
            $scope.newState = function (state) {
                alert("Sorry! You'll need to create a Constitution for " + state + " first!");
            };
            $scope.fixYear = function () {
                if (!angular.isNumber($scope.item.year)) {
                    toastr.error('Год введён не корректно!', info.error(8966));
                }
                return;
            };
            // ******************************
            // Internal methods
            // ******************************

            /**
             * Search for states... use $timeout to simulate
             * remote dataservice call.
             */
            $scope.querySearch = function (query) {
                var results = query ? $scope.states.filter(createFilterFor(query)) : $scope.states,
                    deferred;
                if ($scope.simulateQuery) {
                    deferred = $q.defer();
                    $timeout(function () {
                        deferred.resolve(results);
                    }, Math.random() * 1000, false);
                    return deferred.promise;
                } else {
                    return results;
                }
            };

            $scope.searchTextChange = function (text) {
                //console.log('SEARCH', text);
            };


            $scope.selectedItemChange = function (obj) {
                if (angular.isDefined(obj.email)) {
                    obj.del = true;
                    obj.value = $scope.item.id; // у кого удалить
                    //obj.value = obj.id; // кого удалить
                    $http.post('/schedule/delete-matching', obj).then(function (success) {
                        toastr.success(info.changed, success);
                        //$scope.refresh();
                    });
                } else {
                    obj.id = $scope.item.id;
                    $http.post('/schedule/add-matching', obj).then(function (success) {
                        toastr.success(info.changed, success);
                        $scope.refresh();
                    });
                }
                $scope.selectedItem = obj;
            };
            $scope.selectedItemChangeAnnounced = function (obj) {
                if (angular.isDefined(obj.email)) {
                    obj.del = true;
                    obj.value = $scope.item.id; // у кого удалить
                    //obj.value = obj.id; // кого удалить
                    $http.post('/schedule/delete-announced', obj).then(function (success) {
                        toastr.success(info.changed, success);
                        //$scope.refresh();
                    });
                } else {
                    obj.id = $scope.item.id;
                    $http.post('/schedule/add-announced', obj).then(function (success) {
                        toastr.success(info.changed, success);
                        $scope.refresh();
                    });
                }
                $scope.selectedItem = obj;
            };
            $scope.selectedItemChangeIntersections = function (obj) {
                if (angular.isDefined(obj.email)) {
                    obj.del = true;
                    obj.value = $scope.item.id; // у кого удалить
                    //obj.value = obj.id; // кого удалить
                    $http.post('/schedule/delete-intersections', obj).then(function (success) {
                        toastr.success(info.changed, success);
                        //$scope.refresh();
                    });
                } else {
                    obj.id = $scope.item.id;
                    $http.post('/schedule/add-intersections', obj).then(function (success) {
                        toastr.success(info.changed, success);
                        $scope.refresh();
                    });
                }
                $scope.selectedItem = obj;
            };
            $scope.selectedItemChangeIAgree = function (obj) {
                if (angular.isDefined(obj.email)) {
                    obj.del = true;
                    obj.value = $scope.item.id; // у кого удалить
                    //obj.value = obj.id; // кого удалить
                    $http.post('/schedule/delete-iagree', obj).then(function (success) {
                        toastr.success(info.changed, success);
                        //$scope.refresh();
                    });
                } else {
                    obj.id = $scope.item.id;
                    $http.post('/schedule/add-iagree', obj).then(function (success) {
                        toastr.success(info.changed, success);
                        $scope.refresh();
                    });
                }
                $scope.selectedItem = obj;
            };

            /**
             * Запрос кол-ва пользователей в системе
             */
            $scope.getAllUsers = function () {
                let itemsUsers = $scope.itemsUsers = Users.query({},
                    function (users) {
                        console.log('EDIT USERS SCHEDULE', users);


                        $scope.itemsUsers = users;
                        //$scope.getBoss();
                    }, function (err) {
                        console.log(err, 'ОШибка в USERS objects');
                        // активируем по умолчанию создаваемую запись
                        //item.action = true;
                        //item.status = 'Проект';
                        //item.sc = function () {
                        //    return 'Отпуск';
                        //};

                    }
                );
            };


            function createFilterFor(query) {
                let lowercaseQuery = angular.lowercase(query);
                return function filterFn(state) {
                    return (state.value.indexOf(lowercaseQuery) === 0);
                };
            }


            if (!$scope.me.admin && !$scope.me.kadr) $state.go(info.redirectSelf);

            $scope.close = 1;

            $scope.loginAdmin = false;

            $scope.dateOpts = {
                locale: info.ru, // язык
                mode: "range", // диапазон дат выбрать
                dateFormat: info.dateFormat, // формат даты
                allowInput: false, // ручной ввод даты
                inline: false, // календарь открыт: true; false закрыт
                minDate: 'today',
                // Обработчик события на изменения даты
                //onChange: function(selectedDates, dateStr, instance) {
                //    console.log('selectedDates',selectedDates);
                //},
                // Обработчик события на изменения года
                onYearChange: function (selectedDates, dateStr, instance) {
                    //console.log('CHANGE1', instance);
                    $scope.yearFrom = instance.currentYear;
                    //console.log('ESS',  $scope.yearFrom);
                    $scope.$apply();
                },

                //onDayCreate: function (dObj, dStr, fp, dayElem) {
                //    //dayOff.forEach(function (v, k, arr) {
                //    //    if (moment(arr[k], 'DD.MM.YYYY').isSame(dayElem.dateObj)) {
                //    //        dayElem.innerHTML += "<span   class='event busy'></span>";
                //    //    }
                //    //});
                //    celebration.forEach(function (v, k, arr) {
                //        if (moment(arr[k], 'DD.MM.YYYY').isSame(dayElem.dateObj)) {
                //            dayElem.innerHTML += "<span title='На час пораньше'  class='event celebration'>*</span>";
                //        }
                //    });
                //    holiday.forEach(function (v, k, arr) {
                //        if (moment(arr[k], 'DD.MM.YYYY').isSame(dayElem.dateObj)) {
                //            dayElem.innerHTML += "<span title='Праздник'  class='event busy holiday'></span>";
                //        }
                //    });
                //},
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
                //maxDate: info.maxDate // максимальная дата
                //defaultDate: [moment().year($scope.me.interfaces[0].year)._d, moment().year($scope.me.interfaces[0].year)._d] // по умолчанию какая дата отображается
            };

            $scope.minYear = function () {
                let o = moment().add(1, 'year').get('year');
                return o;
            };

            //console.log('YEAAARRRRRRRRR', moment().add(1, 'year').get('year'));
            $scope.dateOpts2 = {
                locale: info.ru,
                //mode: "range",
                time_24hr: true,
                enableTime: true,
                dateFormat: info.dateTimeFormat,
                //minDate: info.minDate
                minDate: 'today', // минимальная дата
                //defaultDate: 'today'
            };

            //
            // $scope.toggleBlur = function (mx) {
            //     //if(!mx) mx.selectedDates = new Date();
            //     ////console.log('mx.selectedDates: ', mx.selectedDates);
            //     ////console.log('SelectedDates XX7:',moment.parseZone(mx.selectedDates[1]).format());
            //     //
            //     //$scope.query.sd = mx.selectedDates;
            //     //$scope.mx = mx.selectedDates;
            //     //$scope.refresh();
            // };

            var uploader = $scope.uploader = new FileUploader({
                url: '/file/upload',
                autoUpload: true,
                removeAfterUpload: true,
                queueLimit: 1

            });


            $scope.options =
                [
                    {display: "Загрузить файл", value: "uploader"}
                ];
            $scope.modeSelect = $scope.options[0];

            $scope.closed = function () {
                if ($scope.close) {
                    $scope.close = false;
                }
                else {
                    $scope.close = true;
                }
            };

            $scope.refresh = function () {
                let item = $scope.item = Schedules.get({id: $stateParams.scheduleId},
                    function (schedules) {
                        console.log('EDIT SCHEDULE *******', schedules);
                        $scope.flatpicker.setDate(schedules.period);
                        $scope.schedules = schedules;
                    }, function (err) {
                        // активируем по умолчанию создаваемую запись
                        item.action = true;
                        item.status = 'Проект';
                        item.countData = 0;
                    }
                );
                $scope.item.year = item.getYear();
                $scope.getAllUsers();
                $scope.item.name = item.getFullName();
            };

            $scope.$watch('item.action', function (value, old) {
                if (value !== undefined && !value) {
                    toastr.warning('Рассылка не будет запущена.<br> Для запуска активируйте проект установив активность.', info.warning);
                }
            });
            $scope.$watch('item.start', function (value) {
                if (value) {
                    if (($scope.item.status === 'Проект' && moment(value, ['DD.MM.YYYY HH:mm']).isBefore(moment()))) {
                        toastr.error('Этот проект не отработал, возможно сервер был не доступен в момент запуска проекта в работу.', info.error(5000),
                            {
                                //"closeButton": true,
                                //"debug": false,
                                //"newestOnTop": false,
                                "progressBar": true
                                //"positionClass": "toast-top-right",
                                //"preventDuplicates": false,
                                //"showDuration": "300",
                                //"hideDuration": "1000",
                                //"timeOut": "5000",
                                //"extendedTimeOut": "1000",
                                //"showEasing": "swing",
                                //"hideEasing": "linear",
                                //"showMethod": "fadeIn",
                                //"hideMethod": "fadeOut"
                            });
                        return;
                    }
                    if ($scope.item.status !== 'Проект' || moment(value, ["DD.MM.YYYY HH:mm"]).isValid() || !$scope.item.action) return;
                    let nm;

                    console.log('FORMAT', value);
                    nm = (moment(value).isSameOrBefore(moment())) ? 'Проект запущен' : 'Запуск проекта';
                    toastr.info(nm + ': ' + moment(value).fromNow() + ',  <br> в ' + moment(new Date(value)).format('llll'), info.warning,
                        {
                            //"closeButton": true,
                            //"debug": false,
                            //"newestOnTop": false,
                            "progressBar": true
                            //"positionClass": "toast-top-right",
                            //"preventDuplicates": false,
                            //"showDuration": "300",
                            //"hideDuration": "1000",
                            //"timeOut": "5000",
                            //"extendedTimeOut": "1000",
                            //"showEasing": "swing",
                            //"hideEasing": "linear",
                            //"showMethod": "fadeIn",
                            //"hideMethod": "fadeOut"
                        });
                }
            });


            $scope.checkStatus = function () {
                return ($scope.item.status === 'Утвержден') ? false : true;
            };

            $scope.$watch('item.year', function (val) {
                if (val) {
                    $scope.year = val;
                    $scope.item.name = '';
                    $scope.item.name = $scope.item.getFullName() + val;
                }
            });


            $scope.delete2 = function (item) {
                item.$delete({id: item.id}, function (success) {
                    toastr.success(info.objectDelete, info.ok);
                    $state.go(info.redirectSelf);
                    // $location.path("/table");
                    // $scope.$apply(function() { $location.path("/admin/schedule"); });
                    // $scope.refresh();
                }, function (err) {
                    console.log(err);
                    toastr.error(err.data,info.error(733));
                })
            };

            $scope.editProfile = {
                properties: {},
                errorMsg: '',
                error: false,
                saving: false,
                loading: false
            };

            $scope.htmlData = '<h4 class="text-danger" ng-cloak>Пожалуйста, вставьте шаблон сообщения!</h4>';


            var reversValue = function (item) {
                var u = item.start;

                //item.birthday = ( item.birthday) ? new Date(moment(item.birthday, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
                item.start = ( item.start) ? new Date(moment(item.start, ['DD.MM.YYYY HH:mm'])) : null;
                //item.dateInWork = (item.dateInWork) ? new Date(moment(item.dateInWork, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
                //item.firedDate = ( item.firedDate) ? new Date(moment(item.firedDate, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
                //item.decree = ( item.decree) ? new Date(moment(item.decree, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
                var q = item.start;

                return item;
            };

            $scope.saveEdit = function (item) {
                item = reversValue(item);
                // console.log('Перед созданием', item);
                if (!item.htmlData) return toastr.error(info.messageErr, info.error(5978));
                if (!item.to) return toastr.error(info.filedErr('"по"', 'не заполнено'), info.error(5828));


                if (angular.isDefined(item.id)) {
                    item.$update(item, function (success) {
                            toastr.success(info.changed);
                            $scope.refresh();
                        },
                        function (err) {
                            toastr.error(err.data, info.error(11445));
                        }
                    );
                } else {
                    if (angular.isDefined(item)
                    //&& angular.isDefined(item.htmlData)
                    // && angular.isDefined(item.lastName)
                    // &&angular.isDefined(item.patronymicName)
                    /*  &&
                     angular.isDefined(item.login) &&
                     angular.isDefined(item.fired) &&
                     angular.isDefined(item.birthday) &&
                     angular.isDefined(item.email)*/
                    ) {
                        let ar = [];
                        ar.push(item.htmlData[0]);
                        item.htmlData = ar;
                        //toastr.success(info.newOk, info.ok);
                        //$state.go('home.admin.schedules');
                        item.$save(item, function (success) {
                                //console.log(success);
                                //location.reload();
                                toastr.success(info.newOk);
                                // /admin/schedule/
                                //$location.path('/profile') ;
                                $state.go('home.admin.schedule', {scheduleId: success.id});
                                //$state.go('home.admin.schedules');
                            },
                            function (err) {
                                toastr.error(err.data, info.error(89336));
                            });
                    }
                }
            };

            $scope.addContact = function () {
                if (angular.isArray($scope.item.contacts)) {
                    $scope.item.contacts.push({type: "телефон", value: ""});
                } else {
                    $scope.item.contacts = [{type: "телефон", value: ""}];
                }
            };

            //$scope.addFurlough = function () {
            //    if (angular.isArray($scope.item.fur)) {
            //        $scope.item.fur.push({type: "отпуск", from: "", to:""});
            //    } else {
            //        $scope.item.fur = [{type: "отпуск", from: "", to: ""}];
            //    }
            //};

            //$scope.removeFurlough = function (obj) {
            //    let furloughs = $scope.item.fur;
            //    for (let i = 0, ii = furloughs.length; i < ii; i++) {
            //        if (obj === furloughs[i]) {
            //            furloughs.splice(i, 1);
            //        }
            //    }
            //};
            $scope.removeContact = function (contact) {
                let contacts = $scope.item.contacts;
                for (let i = 0, ii = contacts.length; i < ii; i++) {
                    if (contact === contacts[i]) {
                        contacts.splice(i, 1);
                    }
                }
            };

            $scope.addSubdivision = function () {
                if (angular.isArray($scope.item.subdivision)) {
                    $scope.item.subdivision.push({});
                } else {
                    $scope.item.subdivision = [{}];
                }
            };

            $scope.removeSubdivision = function (department) {
                for (let i = 0, ii = $scope.item.subdivision.length; i < ii; i++) {
                    if ($scope.item.subdivision[i].id === department.id) {
                        $scope.item.subdivision.splice(i, 1);
                        return;
                    }
                }
            };

            $scope.removeBirthday = function (item) {
                item.birthday = null;
                item = reversValue(item);
                //item.birthday = ( item.birthday) ? new Date(moment(item.birthday, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
                //item.dateInWork = (item.dateInWork) ? new Date(moment(item.dateInWork, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
                //item.firedDate = ( item.firedDate) ? new Date(moment(item.firedDate, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;

                if (angular.isDefined(item.id)) {
                    item.$update(item, function (success) {
                            toastr.success(info.changed);
                            $scope.refresh();
                        },
                        function (err) {
                            //console.log('ERR: ', err);
                            toastr.error(err.data.invalidAttributes, info.error(44006));
                        });
                }
            };

            $scope.removeDateInWork = function (item) {
                item.dateInWork = null;
                item = reversValue(item);
                //item.birthday = ( item.birthday) ? new Date(moment(item.birthday, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
                //item.dateInWork = (item.dateInWork) ? new Date(moment(item.dateInWork, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
                //item.firedDate = ( item.firedDate) ? new Date(moment(item.firedDate, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;

                if (angular.isDefined(item.id)) {
                    item.$update(item, function (success) {
                            toastr.success(info.changed);
                            $scope.refresh();
                        },
                        function (err) {
                            toastr.error(err.data.invalidAttributes, info.error(792));
                        });
                }
            };
            $scope.removeDecree = function (item) {
                item.decree = null;
                item = reversValue(item);
                //item.birthday = ( item.birthday) ? new Date(moment(item.birthday, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
                //item.dateInWork = (item.dateInWork) ? new Date(moment(item.dateInWork, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
                //item.firedDate = ( item.firedDate) ? new Date(moment(item.firedDate, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;

                if (angular.isDefined(item.id)) {
                    item.$update(item, function (success) {
                            toastr.success(info.changed);
                            $scope.refresh();
                        },
                        function (err) {
                            toastr.error(err.data.invalidAttributes, info.error(1564));
                        });
                }
            };
            $scope.removeFired = function (item) {
                item.firedDate = null;
                item = reversValue(item);
                //item.birthday = ( item.birthday) ? new Date(moment(item.birthday, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
                //item.dateInWork = (item.dateInWork) ? new Date(moment(item.dateInWork, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
                //item.firedDate = ( item.firedDate) ? new Date(moment(item.firedDate, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;

                if (angular.isDefined(item.id)) {
                    item.$update(item, function (success) {
                            toastr.success(info.changed);
                            $scope.refresh();
                            //$scope.item.firedDate = success.getFiredDate;
                        },
                        function (err) {
                            //console.log(info.error, err);
                            toastr.error(err.data.invalidAttributes, info.error(90));
                        });
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
                if (angular.isArray($scope.item.furloughs)) {
                    $scope.item.furloughs.push({});
                } else {
                    $scope.item.furloughs = [{}];
                }
            };

            $scope.removePosition = function (obj) {
                $scope.item.positionRemove = [];
                if (!obj.id) $scope.item.positions = [];
                for (let i = 0, ii = $scope.item.positions.length; i < ii; i++) {
                    if ($scope.item.positions[i].id === obj.id) {
                        $scope.item.positions.splice(i, 1);
                        $scope.item.positionRemove.push(obj.id);
                        return;
                    }
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
                $scope.scheduleInfoForm.$setPristine();
            };

            $scope.canRevert = function () {
                return !angular.equals($scope.item, original);
            };

            $scope.refresh();

        }
    ]);
