'use strict';
angular.module('EmergenceFModule')
    .controller('EditEmergenceFController', ['$scope', '$http', '$parse', 'toastr', 'toastrConfig', '$interval', '$templateCache', '$state', 'EmergencesF', 'moment', 'Departments', 'UsersF', '$stateParams', 'FileUploader', '$timeout', '$q', '$log', '$rootScope',
        function ($scope, $http, $parse, toastr, toastrConfig, $interval, $templateCache, $state, EmergencesF, moment, Departments, UsersF, $stateParams, FileUploader, $timeout, $q, $log, $rootScope) {
            $scope.me = window.SAILS_LOCALS.me;
            if (!$scope.me || !$scope.me.emergence) return $state.go('home');

            $scope.edit = $state.includes('home.company.emergences.edit');
            $scope.titles = {
                startKadr: 'Начать обработку - ',
                endKadr: 'Обработка завершена - ',
                kadrValid: 'Отклонить заявку - ',
                check: 'Выполнено',
                noCheck: 'Не выполнено',
                //kadr:'Кадры. Начать обработку - ',
            };

            $scope.loadDepartments = function () {
                return $timeout(function () {
                    $scope.departments = Departments.query({action: true, limit: 300, sort: 'name'}, function (departments) {
                        //console.log('DEPARTMENTS:', departments);
                        $scope.departments = departments;
                    }, function (err) {
                        toastr.error(err, 'Ошибка ListDepartmentController!');
                    });
                }, 900);
            };

            $scope.close = $scope.edit;
            $scope.onPanel = function () {
                $scope.close = !$scope.close;
            };

            $scope.text = {
                noEmpty: 'Поле не должно быть пустым.',
                noEmptyDate: 'Нет даты.',
                noPatternW: 'Писать только русские буквы.',
                emailPattern: 'Не корректный email.',
                minlengthServer: 'Странное имя для руководителя!?',
                minlength: "Не менее 3 знаков должно быть.",
                minlengthFin: "Не менее 10 знаков должно быть.",
                noEmail: "Не корректный email.",
                maxlength: "Много букв!",
                textPhone: '- Пожалуйста, введите корректно номер телефона.',
                templatePhone: '####',
                headerTab: 'Предоставленное оборудование',
                logChange: 'Лог изменений',
                mindate: 'Дата просрочена',
                maxdate: 'Дата просрочена',
                dateExpired: 'Дата просрочена'
            };
            $scope.titleFinCheck = 'При снятии отметки о выполнении задачи, данные из поля "' + $scope.text.headerTab + '", будут удалены.';
            $scope.amended = 'Внёс изменения';
            var info = {
                changed: 'Изменения сохранены!',
                passChange: 'Пароль обновлён!',
                error: function (num) {
                    if (!angular.isNumber(num)) return;
                    return 'Ошибка ' + num + '!';
                },
                noEmpty: 'Поле не должно быть пустым',
                noPatternW: 'Поле должно содержать только русские буквы',
                noFix: "Введите правильное значение",
                minlength: "Минимум знаков ",
                maxlength: "Максимум знаков ",
                warning: 'ВНИМАНИЕ!',
                requiredJpg: 'Расширение файла должно быть jpg.',
                isSimilar: 'Есть похожий: ',
                ok: 'OK!',
                objectDelete: 'Объект удалён.',
                newOk: 'Новая заявка на выход сотрудника создана.',
                passDefault: '111111',
                redirectSelf: 'home.company.emergences',
                messageErr: 'Сообщение не установлено!',
                filedErr: function (nameFiled, text) {
                    if (!angular.isString(text)) return;
                    return 'Поле ' + nameFiled + ' - ' + text + '!';
                },
                ru: 'ru',
                dateFormat: "d.m.Y",
                dateTimeFormat: "d.m.Y H:i",
                minDate: "01-01-1950",
                maxDate: "31-12-2030"
            };

            $scope.debug = true;
            $scope.comment = false;
            $scope.hideFin = true;

            $scope.shoFin = function () {
                return $scope.hideFin = !$scope.hideFin;
            };


            $scope.ctrl = {
                minDate: new Date(),
                //minDate: new Date(moment().endOf("days")),
                //minDate: new Date(moment().endOf("days").subtract(1, 'days')),
                maxDate: new Date(moment().add(2, 'months')),
                onlyWeekendsPredicate: function (date) {
                    var day = date.getDay();
                    return day === 0 || day === 6;
                }
            };


            $scope.showHints = true;
            $scope.matchPattern = new RegExp('[а-яА-ЯёЁ]+');
            $scope.patternPhone = new RegExp('/^[(][0-9]{3}[)] [0-9]{3}-[0-9]{4}$/');
            //var pattern = '/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/';
            //$scope.emailPattern = new RegExp(pattern);
            $scope.minLength = 3;
            $scope.maxLength = 20;
            $scope.maxLengthFin = 6000;
            $scope.maxLengthIt = 300;
            $scope.maxLengthPost = 70;
            $scope.maxlengthTextarea = 150;

            $scope.getError = function (error) {
                /*
                 serForm.itemFirstName.$error.required
                 serForm.itemFirstName.$error.minlength
                 serForm.itemFirstName.$error.maxlength
                 serForm.itemFirstName.$error.pattern
                 serForm.itemFirstName.$valid
                 */

                if (angular.isDefined(error)) {
                    if (error.required) {
                        return info.noEmpty;
                    }
                    if (error.pattern) {
                        //$scope.showError = true;
                        toastr.error(info.noPatternW, 'Ошибка!');
                        return info.noPatternW;
                    }
                    if (error.minlength) {
                        //$scope.showError = true;
                        return info.minlength + $scope.minLength;
                    }
                    if (error.maxlength) {
                        //$scope.showError = true;
                        return info.maxlength + $scope.maxLength;
                    }
                }
            };


            /**
             * TODO WEBSOCKET: Подключаемся к сокету обработка события hello
             */
            io.socket.on('hello-emergence-edit', function (data) {
                if (!data.howdy)  $state.go('home.company.emergences');
                $scope.refresh();
            });
            io.socket.on('hello-emergence-delete-comment', function (data) {
                if (!data.howdy)  $state.go('home.admin.emergences');
                $scope.$apply(function () {
                    $scope.item.commentItArr = data.howdy.commentItArr;
                });
            });
            io.socket.on('hello-emergence-save-comment', function (data) {
                if (!data.howdy)  $state.go('home.admin.emergences');
                $scope.$apply(function () {
                    $scope.item.commentItArr = data.howdy.commentItArr;
                });
            });
            io.socket.get('/say/emergence/hello', function gotResponse(data, jwRes) {
                //console.log('Сервер ответил кодом ' + jwRes.statusCode + ' и данными: ', data);
            });


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

            $scope.messages = [];

            $scope.to = '';

            $scope.otdel = ' <mark>Отдел не указан</mark> ';
            $scope.post = ' <mark>Должность не указана</mark> ';
            $scope.outputEmployee = ' <mark>Дата выхода не указана</mark> ';
            $scope.fullName = ' <mark>FIO не указано</mark> ';
            $scope.setData = function () {
                $scope.messages[0] = {
                    description: 'Уведомление о выходе нового сотрудника',
                    outputEmployee: '',
                    name: '№1',
                    tmpl: '<h1>Уважаемые, коллеги!</h1>' +
                    '<p> Планируется выход нового сотрудника - ' + $scope.fullName + '  в ' + $scope.otdel + ' на должность ' + $scope.post + '. </p>' +
                    '<p>Предполагаемая дата выхода - ' + moment($scope.outputEmployee, ['DD.MM.YYYY']).format('DD.MM.YYYY') + '. </p>' +
                    '<p>Ссылка на заявку -  <a href="http://kadr/company/emergences">' + $scope.fullName + '</a></p>'
                };
            };
            $scope.$watch('item.departments', function (val, old) {
                if (val) {

                    $scope.departments = val;
                }
            });
            $scope.$watch('item.departments[0].id', function (val, old) {
                if (val) {
                    Departments.get({id: val},
                        function (ems) {
                            //console.log('Watch item.departments[0].id', ems);
                            $scope.otdel = ems.name;
                            $scope.setData();
                            $scope.apply();
                        }, function (err) {
                            console.log('ERRRR PRO 2a:', err);
                        }
                    );

                    //$scope.examples2[0] = {
                    //    description: 'Дополнительное уведомление о не заполненной информации.',
                    //    name: '№1',
                    //    tmpl: '<h1>Уважаемый коллега!</h1> ' +
                    //    '<p>Вы не заполнили график отпусков на следующий календарный год. Просьба проделать данную работу до <b></b></p>'
                    //
                    //};


                }
            });
            $scope.$watch('item.post', function (val, old) {
                if (val) {
                    $scope.post = val;
                    $scope.setData();
                }
            });
            $scope.$watch('item.outputEmployee', function (val, old) {
                if (val) {
                    $scope.outputEmployee = val;
                    $scope.setData();
                }
            });
            $scope.$watch('item.lastName', function (val, old) {
                if (val) {
                    $scope.fullName = $scope.item.getFullName();
                    $scope.setData();
                }
            });
            $scope.$watch('item.firstName', function (val, old) {
                if (val) {
                    $scope.fullName = $scope.item.getFullName();
                    $scope.setData();
                }
            });
            $scope.$watch('item.patronymicName', function (val, old) {
                if (val) {
                    $scope.fullName = $scope.item.getFullName();
                    $scope.setData();
                }
            });

            //new Date(year, month, date, hours, minutes, seconds, ms)
            $scope.dt = new Date(moment().startOf("days").add(3,'hours'));

            console.log('$scope.dt:', $scope.dt);
            console.log('moment().endOf("day"):', moment().endOf("day"));

            $scope.$watch('dt', function (val) {
                if (val) $scope.item.outputEmployee = val;
            });
            $scope.$watch('item.outputEmployee', function (val) {
                if (val) $scope.dt = val;
            });

            $scope.examples2 = [
                {
                    description: 'Дополнительное уведомление о не заполненной информации.',
                    name: '№2',
                    tmpl: 'Шаблон №2 - нет вариантов'
                },
                {
                    description: 'Дополнительное уведомление о не заполненной информации.',
                    name: '№3',
                    tmpl: 'Шаблон №3 - нет вариантов'
                },
                {
                    description: 'Дополнительное уведомление о не заполненной информации.',
                    name: '№4',
                    tmpl: 'Шаблон №4 - нет вариантов'
                }
            ];
            $scope.toOpen = function () {
                $scope.toogle();
                $scope.toogle2();
            };

            $scope.toogle = function () {
                $scope.comment = ($scope.comment) ? false : true;
            };


            $scope.toogle2 = function () {
                $scope.comment2 = ($scope.comment2) ? false : true;
            };


            $scope.expr = "start | date:'dd.MM.yyyy HH:mm'";
            $scope.parseExpression = function () {
                var fn = $parse($scope.expr);
                $scope.item.start = $scope.timeDate = fn($scope.item);
            };

            $scope.expr2 = "outputEmployee | date:'dd.MM.yyyy'";
            $scope.parseExpression2 = function () {
                var fn = $parse($scope.expr2);
                $scope.item.outputEmployee = $scope.timeDate = fn($scope.item);
            };

            //$scope.$watch('year', function (val, old) {
            //    if (val) {
            //        $http.get('/emergence/to-years?year=' + val)
            //            .then(function (data) {
            //                $scope.sumDays = data.data.sumDays;
            //            });
            //    }
            //});
            //href="/vacation/delete-all/'+req.param('year')+'"
            //$scope.addiction = function() {
            //    if(!angular.isNumber(year)) return;
            //    if (val) {
            //        $http.get('/vacation/delete-all/' + year)
            //            .then(function (res) {
            //                console.log('EYYYYYYEEEESS: ', res.data );
            //            });
            //    }
            //};

            //$scope.$watch('emergences', function (val, old) {
            //    if (val) {
            //        $http.get('/emergence/to-years?year=' + val.year)
            //            .then(function (data) {
            //                $scope.sumDays = data.data.sumDays;
            //            });
            //    }
            //});


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
                //console.log('DAY COUNT', $scope.daysSelectHoliday);

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
            //$scope.fixYear = function () {
            //    if (!angular.isNumber($scope.item.year)) {
            //        toastr.error('Год введён не корректно!', info.error(8966));
            //    }
            //    return;
            //};
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
                    $http.post('/emergence/delete-matching', obj).then(function (success) {
                        toastr.success(info.changed, success);
                        //$scope.refresh();
                    });
                } else {
                    obj.id = $scope.item.id;
                    $http.post('/emergence/add-matching', obj).then(function (success) {
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
                    $http.post('/emergence/delete-announced', obj).then(function (success) {
                        toastr.success(info.changed, success);
                        //$scope.refresh();
                    });
                } else {
                    obj.id = $scope.item.id;
                    $http.post('/emergence/add-announced', obj).then(function (success) {
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
                    $http.post('/emergence/delete-intersections', obj).then(function (success) {
                        toastr.success(info.changed, success);
                        //$scope.refresh();
                    });
                } else {
                    obj.id = $scope.item.id;
                    $http.post('/emergence/add-intersections', obj).then(function (success) {
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
                    $http.post('/emergence/delete-iagree', obj).then(function (success) {
                        toastr.success(info.changed, success);
                        //$scope.refresh();
                    });
                } else {
                    obj.id = $scope.item.id;
                    $http.post('/emergence/add-iagree', obj).then(function (success) {
                        toastr.success(info.changed, success);
                        $scope.refresh();
                    });
                }
                $scope.selectedItem = obj;
            };

            /**
             * Запрос кол-ва пользователей в системе
             */
            //$scope.getAllUsers = function () {
            //    let itemsUsers = $scope.itemsUsers = UsersF.query({},
            //        function (users) {
            //            //console.log('EDIT USERS EMERGENCE', users);
            //
            //
            //            $scope.itemsUsers = users;
            //            //$scope.getBoss();
            //        }, function (err) {
            //            console.log(err, 'ОШибка в USERS objects');
            //            // активируем по умолчанию создаваемую запись
            //            //item.action = true;
            //            //item.status = 'Новая';
            //            //item.sc = function () {
            //            //    return 'Отпуск';
            //            //};
            //
            //        }
            //    );
            //};


            function createFilterFor(query) {
                let lowercaseQuery = angular.lowercase(query);
                return function filterFn(state) {
                    return (state.value.indexOf(lowercaseQuery) === 0);
                };
            }


            //$scope.close = 1;

            $scope.loginAdmin = false;


            $scope.dateOpts = {
                locale: info.ru,
                //mode: "range",
                // time_24hr: false,
                // enableTime: false,
                // dateFormat: info.dateTimeFormat,
                dateFormat: info.dateFormat,
                //minDate: info.minDate
                minDate: 'today' // минимальная дата
                //defaultDate: 'today'
            };

            $scope.dateOpts2 = {
                locale: info.ru,
                //mode: "range",
                time_24hr: true,
                enableTime: true,
                dateFormat: info.dateTimeFormat,
                //dateFormat: info.dateFormat,
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

            $scope.refresh = function () {
                let item = $scope.item = EmergencesF.get({id: $stateParams.emergenceId},
                    function (emergences) {
                        //console.log('EDIT EMERGENCE refresh function company', emergences);
                        $scope.flatpicker.setDate(emergences.period);
                        $scope.emergences = emergences;
                    }, function (err) {
                        // активируем по умолчанию создаваемую запись
                        item.action = true;
                        item.status = 'Новая';
                        item.countData = 0;
                    }
                );
                $scope.item.outputEmployee = item.formatDate();
                $scope.item.name = item.getFullName();
            };

            $scope.removePosition = function (obj) {
                $scope.item.positions = [];
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


            $scope.$watch('item.action', function (value, old) {
                if (value !== undefined && !value) {
                    toastr.warning('Заявка отклонена.<br> Дальнейшая работа по заявки не актуальна.', info.warning);
                }
            });
            $scope.$watch('item.start', function (value) {
                if (value) {
                    if (($scope.item.status === 'Новая' && moment(value, ['DD.MM.YYYY HH:mm']).isBefore(moment()))) {
                        toastr.error('Эта рассылка не отработала, возможно сервер был не доступен в момент запуска рассылки в работу.', info.error(5000),
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
                    if ($scope.item.status !== 'Новая' || moment(value, ["DD.MM.YYYY"]).isValid() || !$scope.item.action) return;
                    let nm;

                    //console.log('FORMAT', value);
                    nm = (moment(value).isSameOrBefore(moment())) ? 'Рассылка запущен' : 'Запуск рассылки';
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


            //$scope.checkStatus = function () {
            //    return ($scope.item.status === 'Завершена');
            //};

            //$scope.$watch('item.year', function (val) {
            //    if (val) {
            //        $scope.year = val;
            //        $scope.item.name = '';
            //        $scope.item.name = $scope.item.getFullName();
            //    }
            //});


            $scope.delete2 = function (item) {
                item.$delete({id: item.id}, function (success) {
                    toastr.success(info.objectDelete, info.ok);
                    $state.go(info.redirectSelf);
                    // $location.path("/table");
                    // $scope.$apply(function() { $location.path("/admin/emergence"); });
                    // $scope.refresh();
                }, function (err) {
                    //console.log(err);
                    toastr.error(err.data, info.error(733));
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
            $scope.htmlData2 = '<h4 class="text-danger" ng-cloak>Пожалуйста, вставьте шаблон дополнительного уведомления!</h4>';


            var reversValue = function (item) {
                item.start = ( item.start) ? new Date(moment(item.start, ['DD.MM.YYYY HH:mm'])) : null;
                return item;
            };
            $scope.locations = {
                model: null,
                availableOptions: [
                    {id: 'Основной офис (3-й этаж)', name: 'Основной офис (3-й этаж)'},
                    {id: 'Основной офис (2-й этаж)', name: 'Основной офис (2-й этаж)'},
                    {id: 'Склад (Дмитровка)', name: 'Склад (Дмитровка)'}
                ]
            };

            $scope.checkedValue = function () {
                $scope.item.endKadr = ($scope.item.startKadr && $scope.item.finCheck && $scope.item.ahoCheck && $scope.item.itCheck);
                $scope.item.status = ($scope.item.kadrValid) ? 'Отклонена' : (($scope.item.endKadr) ? 'Завершена' : 'В работе');
            };

            $scope.excelData = '';
//            $scope.generateTable = function (excelData) {
//                //var data = $('textarea[name=excel_data]').val();
//
//
//                console.log(excelData);
//                var rows = excelData.split("\n");
//
//                $scope.bindHtml = '<table />';
//                //var table = $('<table />');
//
//                for (var y in rows) {
//                    var cells = rows[y].split("\t");
//                    var row = '<tr />';
//                    for (var x in cells) {
//                        row.append('<td>' + cells[x] + '</td>');
//                    }
//                    $scope.bindHtml.append(row);
//                }
//
//// Insert into DOM
////                $('#excel_table').html(table);
//            };


            //$scope.userUpdateServiceAho = function () {
            //    $scope.item.ahoUpdate  = $scope.me.id;
            //    $scope.item.$update();
            //    //$state.go('home.company.emergences');
            //};
            //


            $scope.errDate = function (item) {
                return moment().endOf('day').isBefore(moment(item.outputEmployee), 'year');
            };
            $scope.dateExpired = function () {

            };

            // Fin
            $scope.saveEditFin = function (item, isValid) {

                let m = moment().endOf('day').subtract(1,'minute');
                if (m.isAfter(moment(item.outputEmployee).endOf('day'))) {
                    $scope.item.finCheck = false;
                    return toastr.error($scope.text.dateExpired, info.error(720));
                }

                if (!isValid) {
                    $scope.item.finCheck = false;
                    return toastr.error('Нет информации по предоставленному оборудованию!', info.error(719));
                }


                item.finUpdate = $scope.me.id;
                $scope.saveEdit(item, isValid);
                $state.go('home.company.emergences', toastr.success(info.changed));
            };
            $scope.showLogs = false;
            $scope.showLog = function () {
                $scope.showLogs = !$scope.showLogs;
            };

            // AHO
            $scope.saveEditAho = function (item, isValid) {
                let m = moment().endOf('day').subtract(1,'minute');
                if (m.isAfter(moment(item.outputEmployee).endOf('day'))) {
                    $scope.item.ahoCheck = false;
                    return toastr.error($scope.text.dateExpired, info.error(721));
                }
                item.ahoUpdate = $scope.me.id;
                $scope.saveEdit(item, isValid);
                $state.go('home.company.emergences', toastr.success(info.changed));
            };
            $scope.getRandomId = function () {
                return Math.floor((Math.random() * 999999) + 1);
            };

            // IT
            $scope.saveEditIt = function (item, isValid) {
                let m = moment().endOf('day').subtract(1,'minute');
                if (m.isAfter(moment(item.outputEmployee).endOf('day'))) {
                    $scope.item.itCheck = false;
                    return toastr.error($scope.text.dateExpired, info.error(722));
                }

                item.itUpdate = $scope.me.id;
                if (!angular.isArray(item.itUpdateData))  item.itUpdateData = [];

                item.itUpdateData.push({
                    action: item.itCheck,
                    img: $scope.me.avatarUrl,
                    lastName: $scope.me.lastName,
                    firstName: $scope.me.firstName,
                    patronymicName: $scope.me.patronymicName,
                    fullName: $scope.me.lastName + ' ' + $scope.me.firstName + ' ' + $scope.me.patronymicName,
                    shortName: $scope.me.lastName + ' ' + $scope.me.firstName[0] + '.' + $scope.me.patronymicName[0] + '.',
                    date: new Date()
                });

                $scope.saveEdit(item, isValid);
                $state.go('home.company.emergences', toastr.success(info.changed));
            };

            //$scope.userUpdateServiceFin = function () {
            //    $scope.item.finUpdate  = $scope.me.id;
            //    $scope.item.$update();
            //    //$state.go('home.company.emergences');
            //};

            $scope.$watch('item.kadrValid', function (val) {
                $scope.checkedValue();
            });
            $scope.$watch('item.startKadr', function (val) {
                $scope.checkedValue();
            });

            $scope.$watch('item.finCheck', function (val) {
                $scope.checkedValue();
                //$scope.userUpdateServiceFin();
            });

            $scope.$watch('item.ahoCheck', function (val) {
                $scope.checkedValue();

            });

            $scope.$watch('item.itCheck', function (val) {
                $scope.checkedValue();
            });


            $scope.daxs = {
                model: null,
                availableOptions: [
                    //{id: 'Нет прав', name: 'Нет прав'},
                    {id: 'Менеджер', name: 'Менеджер'},
                    {id: 'Финансовый менеджер', name: 'Финансовый менеджер'},
                    {id: 'Сотрудник отдела логистики', name: 'Сотрудник отдела логистики'},
                    {id: 'Сотрудник склада', name: 'Сотрудник склада'},
                    {id: 'Сотрудник юридического отдела', name: 'Сотрудник юридического отдела'}
                ]
            };

            var roundingDefault = moment.relativeTimeRounding();
            moment.relativeTimeThreshold('m', 60);

            $scope.getRandomId = function () {
                return Math.floor((Math.random() * 999999) + 1);
            };

            $scope.saveComment = function (item) {
                if ($scope.errDate(item)) return toastr.error($scope.text.dateExpired, info.error(723));
                if (item.commentIt) {
                    item.commentItArr.push({
                        id: $scope.getRandomId(),
                        comment: item.commentIt.trim(),
                        img: $scope.me.avatarUrl,
                        date: new Date(),
                        fio: $scope.me.lastName + ' ' + $scope.me.firstName[0] + '. ' + $scope.me.patronymicName[0] + '.'
                    });

                    $http.put('/emergence/save-comment/' + $scope.item.id, item).then(function (success) {
                        toastr.success(info.changed, success);
                        ////console.log('APPP',success.data);
                        $scope.item.commentIt = '';
                        $scope.item.commentItArr = success.data.commentItArr;
                    });
                }
            };


            $scope.saveEdit = function (item, isValid) {
                if ($scope.errDate(item)) return toastr.error($scope.text.dateExpired, info.error(718));
                if(!item.departments) return toastr.error('Не указано подразделение.', info.error(717));
                if (!item.finCheck || !angular.isDefined(item.commentFin)) {
                    item.commentFin = '';
                    item.finCheck = false;
                }

                if (!item.outputEmployee) return toastr.error(info.filedErr('"Дата выхода сотрудника"', 'не заполнена'), info.error(716));
                $scope.checkedValue();
                item = reversValue(item);
                if (isValid) {
                    $scope.message = item.name + " " + item.email;
                }
                else {
                    $scope.message = "Error";
                    $scope.showError = true;
                    return false;
                }

                if (!angular.isDefined(item.departments) || item.departments.length < 1) return toastr.error(info.filedErr('"Отдел"', 'не заполнено'), info.error(715));

                if (angular.isDefined(item.id)) {
                    item.$update({id: item.id}, item);
                } else {
                    if (angular.isDefined(item)) {
                        let ar = [];
                        let ar2 = [];
                        if (!angular.isDefined(item.id)) {
                            item.start = moment().add(2, 'minutes');
                        }
                        if (angular.isDefined(item.htmlData)) {
                            for (let key in item.htmlData) {
                                ar.push(item.htmlData[key]);
                            }
                            item.htmlData = ar;
                        }

                        if (angular.isDefined(item.htmlData2)) {
                            for (let key in item.htmlData2) {
                                ar2.push(item.htmlData2[key]);
                            }
                            item.htmlData2 = ar2;
                        }

                        //toastr.success(info.newOk, info.ok);
                        //$state.go('home.company.emergences');
                        item.$save(item, function (success) {
                                //console.log(success);
                                //location.reload();
                                toastr.success(info.newOk);

                                $state.go('home.company.emergences', {emergenceId: success.id});

                            },
                            function (err) {
                                toastr.error(err.data, info.error(714));
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

            $scope.removeContact = function (contact) {
                let contacts = $scope.item.contacts;
                for (let i = 0, ii = contacts.length; i < ii; i++) {
                    if (contact === contacts[i]) {
                        contacts.splice(i, 1);
                    }
                }
            };

            $scope.addSubdivision = function () {
                if (!$scope.item) return;
                if (angular.isArray($scope.item.departments)) {
                    $scope.item.departments.push({});
                } else {
                    $scope.item.departments = [{}];
                }
            };
            $scope.$watch('item', function (val) {
                if (val)  $scope.addSubdivision();
            });
            $scope.removeSubdivision = function (department) {
                for (let i = 0, ii = $scope.item.departments.length; i < ii; i++) {
                    if ($scope.item.departments[i].id === department.id) {
                        $scope.item.departments.splice(i, 1);
                        return;
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


            $scope.removeBirthday = function (item) {
                item.birthday = null;
                item = reversValue(item);
                if (angular.isDefined(item.id)) {
                    item.$update(item, function (success) {
                            toastr.success(info.changed);
                            $scope.refresh();
                        },
                        function (err) {
                            //console.log('ERR: ', err);
                            toastr.error(err.data.invalidAttributes, info.error(713));
                        });
                }
            };

            $scope.removeDateInWork = function (item) {
                item.dateInWork = null;
                item = reversValue(item);
                if (angular.isDefined(item.id)) {
                    item.$update(item, function (success) {
                            toastr.success(info.changed);
                            $scope.refresh();
                        },
                        function (err) {
                            toastr.error(err.data.invalidAttributes, info.error(712));
                        });
                }
            };
            $scope.removeDecree = function (item) {
                item.decree = null;
                item = reversValue(item);
                if (angular.isDefined(item.id)) {
                    item.$update(item, function (success) {
                            toastr.success(info.changed);
                            $scope.refresh();
                        },
                        function (err) {
                            toastr.error(err.data.invalidAttributes, info.error(711));
                        });
                }
            };
            $scope.removeFired = function (item) {
                item.firedDate = null;
                item = reversValue(item);
                if (angular.isDefined(item.id)) {
                    item.$update(item, function (success) {
                            toastr.success(info.changed);
                            $scope.refresh();
                        },
                        function (err) {
                            toastr.error(err.data.invalidAttributes, info.error(710));
                        });
                }
            };


            $scope.addFurlough = function () {
                if (angular.isArray($scope.item.furloughs)) {
                    $scope.item.furloughs.push({});
                } else {
                    $scope.item.furloughs = [{}];
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
                $scope.emergenceInfoForm.$setPristine();
            };

            $scope.canRevert = function () {
                return !angular.equals($scope.item, original);
            };
            $scope.refresh();
        }
    ]);
