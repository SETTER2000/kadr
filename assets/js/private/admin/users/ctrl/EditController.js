'use strict';
angular.module('UserModule')
    .controller('EditController', ['$scope', '$http', 'toastr', '$interval', '$templateCache', '$state', 'Users', 'moment', 'Positions', 'Departments', 'Vacations', '$stateParams', 'FileUploader', '$timeout', '$q', '$log', '$rootScope',
        function ($scope, $http, toastr, $interval, $templateCache, $state, Users, moment, Positions, Departments, Vacations, $stateParams, FileUploader, $timeout, $q, $log, $rootScope) {
            $scope.me = window.SAILS_LOCALS.me;
            $scope.edit = $state.includes('home.admin.users.edit');
            var info = {
                changed: 'Изменения сохранены!',
                passChange: 'Пароль обновлён!',
                error: 'Ошибка!',
                requiredJpg: 'Расширение файла должно быть jpg.',
                isSimilar: 'Есть похожий: ',
                ok: 'OK!',
                objectDelete: 'Объект удалён.',
                newUserOk: 'Новый пользователь создан.',
                passDefault: '111111',
                redirectSelf: 'home.admin.users',
                ru: 'ru',
                dateFormat: "d.m.Y",
                minDate: "01-01-1950",
                maxDate: "31-12-2002"
            };

            $scope.radioData = [
                //{label: 'испытательный срок', value: false},
                {label: 'работает', value: false},
                //{ label: 'работает',  value: false, isDisabled: true },
                {label: 'уволен', value: true},
                //{label: 'временно включён', value: false},
                //{ label: '4', value: '4' }
            ];

            $scope.addPersonName = 'Выбрать согласующих для';
            $scope.addPersonAnnounced = 'Выбрать оповещаемых для';
            $scope.addPersonIntersections = 'Выбрать "пересечения" для';
            $scope.addPersonIAgree = 'Выбрать "я согласующий" для';
            $scope.simulateQuery = false;
            $scope.isDisabled = false;

            // list of `state` value/display objects

            $scope.states = loadAll();
            $scope.newState = function (state) {
                alert("Sorry! You'll need to create a Constitution for " + state + " first!");
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
                    $http.post('/user/delete-matching', obj).then(function (success) {
                        toastr.success(info.changed, success);
                        //$scope.refresh();
                    });
                } else {
                    obj.id = $scope.item.id;
                    $http.post('/user/add-matching', obj).then(function (success) {
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
                    $http.post('/user/delete-announced', obj).then(function (success) {
                        toastr.success(info.changed, success);
                        //$scope.refresh();
                    });
                } else {
                    obj.id = $scope.item.id;
                    $http.post('/user/add-announced', obj).then(function (success) {
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
                    $http.post('/user/delete-intersections', obj).then(function (success) {
                        toastr.success(info.changed, success);
                        //$scope.refresh();
                    });
                } else {
                    obj.id = $scope.item.id;
                    $http.post('/user/add-intersections', obj).then(function (success) {
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
                    $http.post('/user/delete-iagree', obj).then(function (success) {
                        toastr.success(info.changed, success);
                        //$scope.refresh();
                    });
                } else {
                    obj.id = $scope.item.id;
                    $http.post('/user/add-iagree', obj).then(function (success) {
                        toastr.success(info.changed, success);
                        $scope.refresh();
                    });
                }
                $scope.selectedItem = obj;
            };
            /**
             * Build `states` list of key/value pairs
             */
            function loadAll() {
                return $http.get('/user/get-all').then(function (response) {
                    var a = [];
                    response.data.map(function (state) {
                        //console.log('allStates', state);
                        a.push({
                            value: state._id,
                            display: state.lastName + ' ' + state.firstName.substr(0, 1) + '.' + state.patronymicName.substr(0, 1) + '.'
                        });
                    });
                    return a;
                });
                //return allStates.split(/, +/g).map(function (state) {
                //    //console.log('allStates', state);
                //    return {
                //        value: state.toLowerCase(),
                //        display: state
                //    };
                //});
            }


            //function loadAll() {
            //    $http.get('/users').then(function onSuccess(sailsResponse) {
            //
            //        return sailsResponse.data.map(function (state) {
            //            //console.log('allStates', state);
            //            return {
            //                value: state.id,
            //                display: state.lastName
            //            };
            //        });
            //    });
            //}

            //
            //$scope.allStates = function () {
            //    $http.get('/users').then(function onSuccess(sailsResponse) {
            //        let ar = [];
            //        sailsResponse.data.map(function (state) {
            //            //console.log('allStates',state);
            //            ar.push({
            //                value: state.lastName,
            //                display: state.lastName
            //            });
            //        });
            //        return ar;
            //    });
            //};

            //function loadAll() {
//let r = $scope.allStates();
            //r.data.map(function (st) {
            //    //console.log('GETTERR', st);
            //
            //    return {
            //        value: st.lastName,
            //        display: st.lastName
            //    };
            //});


            //}

            //loadAll_o();
            /**
             * Create filter function for a query string
             */
            function createFilterFor(query) {
                var lowercaseQuery = angular.lowercase(query);

                return function filterFn(state) {
                    return (state.value.indexOf(lowercaseQuery) === 0);
                };

            }


            //$http.get('/user/getBoss',{name:'Александр', lname:'Петров', pname:'Вячеславович'})
            //    .then(function onSuccess(sailsResponse){
            //        console.log('sailsResponse: ', sailsResponse);
            //        $scope.userList.contents = sailsResponse.data;
            //    })
            //    .catch(function onError(sailsResponse){
            //        console.log('sailsResponse ERROR:', sailsResponse);
            //    })
            //    .finally(function eitherWay(){
            //        $scope.userList.loading = false;
            //    });


            if (!$scope.me.admin && !$scope.me.kadr) $state.go(info.redirectSelf);

            $scope.close = 1;

            $scope.loginAdmin = false;



            $scope.dateOpts = {
                locale: info.ru,
                //mode: "range",
                dateFormat: info.dateFormat,
                minDate: info.minDate,
                maxDate: info.maxDate
                //defaultDate: 'today'
            };

            $scope.dateOpts2 = {
                locale: info.ru,
                //mode: "range",
                dateFormat: info.dateFormat,
                minDate: info.minDate
                //defaultDate: 'today'
            };

            $scope.dateOpts3 = {
                locale: info.ru,
                //mode: "range",
                dateFormat: info.dateFormat,
                minDate: info.minDate
                //defaultDate: 'today'
            };
            $scope.dateOpts4 = {
                locale: info.ru,
                //mode: "range",
                dateFormat: info.dateFormat,
                minDate: info.minDate
                //defaultDate: 'today'
            };

            $scope.toggleBlur = function (mx) {
                //if(!mx) mx.selectedDates = new Date();
                ////console.log('mx.selectedDates: ', mx.selectedDates);
                ////console.log('SelectedDates XX7:',moment.parseZone(mx.selectedDates[1]).format());
                //
                //$scope.query.sd = mx.selectedDates;
                //$scope.mx = mx.selectedDates;
                //$scope.refresh();
            };

            var uploader = $scope.uploader = new FileUploader({
                url: '/file/upload',
                autoUpload: true,
                removeAfterUpload: true,
                queueLimit: 1

            });

            uploader.filters.push({
                name: 'syncFilter',
                fn: function (item /*{File|FileLikeObject}*/, options) {
                    return this.queue.length < 10;
                }
            });


            uploader.filters.push({
                name: 'asyncFilter',
                fn: function (item /*{File|FileLikeObject}*/, options, deferred) {
                    setTimeout(deferred.resolve, 1e3);
                }
            });


            /**
             * Фильтр проверяет рассширение
             * Доступны для загрузки только xlsx файлы
             */
            uploader.filters.push({
                name: 'expFilter',
                fn: function (item) {
                    if (item.name.slice(-3) !== 'jpg') {
                        toastr.error(info.requiredJpg, info.error);
                        return false;
                    }
                    $scope.uploaderButtonPrice = true;
                    return true;
                }
            });

            // CALLBACKS

            uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
                console.info('onWhenAddingFileFailed', item, filter, options);
            };
            uploader.onAfterAddingFile = function (fileItem) {
                console.info('onAfterAddingFile', fileItem);
            };
            uploader.onAfterAddingAll = function (addedFileItems) {
                console.info('onAfterAddingAll', addedFileItems);

            };
            uploader.onBeforeUploadItem = function (item) {
                console.info('onBeforeUploadItem', item);
                item.formData.push({id: $stateParams.userId});

            };


            uploader.onProgressItem = function (fileItem, progress) {
                console.info('onProgressItem', fileItem, progress);

            };
            uploader.onProgressAll = function (progress) {
                console.info('onProgressAll', progress);

            };
            uploader.onSuccessItem = function (fileItem, response, status, headers) {
                console.info('onSuccessItem', fileItem);
                console.info('onSuccessItem2', response);
                console.info('onSuccessItem3', status);
                console.info('onSuccessItem4', headers);


            };
            uploader.onErrorItem = function (fileItem, response, status, headers) {
                $scope.pathToReport = response.avatarFd;
                $scope.goReport = response.goReport;
                $scope.statusErr = 'Отклонено';
                toastr.error(response.message, info.error + ' Статус ' + status);
            };
            uploader.onCancelItem = function (fileItem, response, status, headers) {
                //console.log('uploader.onCancelItem');
                //console.log(status);
                //console.info('onCancelItem', fileItem, response, status, headers);
            };
            //$scope.$watch('item.avatarUrl', function (value) {
            //    $scope.item.avatarUrl = value;
            //
            //});
            //

            $scope.getLdap = function () {
                //console.log($scope.item.lastName);
                $http.post('/users/ldap', {
                        name: $scope.item.lastName
                    })
                    .then(function onSuccess(sailsResponse) {
                        //console.log('sailsResponse: ',sailsResponse);
                        let objectContacts = {};
                        $scope.item.contacts = [];
                        objectContacts.type = "Внутренний телефон";
                        objectContacts.value = sailsResponse.data[0].telephoneNumber;

                        let patronymic = sailsResponse.data[0].displayName.split(' ')[2];
                        //$scope.item.lastName = sailsResponse.data[0].sn;
                        $scope.item.firstName = sailsResponse.data[0].givenName;
                        $scope.item.login = sailsResponse.data[0].sAMAccountName;
                        $scope.item.room = sailsResponse.data[0].physicalDeliveryOfficeName;
                        $scope.item.email = sailsResponse.data[0].mail;
                        $scope.item.contacts.push(objectContacts);
                        $scope.item.patronymicName = patronymic;

                        //[{"type":"Мобильный","value":"8-985-729-37-74"},{"type":"Телефон","value":"+7 (495) 444-18-61"},{"type":"Внутренний телефон","value":"(050) 4322"}]
                        //$scope.item.patronymicName = patronymic;
                        // $scope.userProfile.properties.gravatarURL = sailsResponse.data.gravatarURL;
                        // window.location = '#/profile/' + $scope.editProfile.properties.id;
                        //window.location = '/profile';
                        for (let op in sailsResponse.data) {
                            toastr.success(info.isSimilar + sailsResponse.data[op].displayName);
                        }

                        $scope.editProfile.loading = false;
                    }, function (err) {
                        //console.log(info.error, err);
                    })
                    .catch(function onError(sailsResponse) {
                        // console.log('sailsresponse: ', sailsResponse)
                        // Otherwise, display generic error if the error is unrecognized.
                        $scope.editProfile.changePassword.errorMsg = $scope.unexpected + (sailsResponse.data || sailsResponse.status);
                        toastr.error($scope.editProfile.changePassword.errorMsg);
                    })
                    .finally(function eitherWay() {
                        $scope.editProfile.loading = false;
                    });
            };

            uploader.onCompleteItem = function (fileItem, response, status, headers) {
                //console.info('onCompleteItem', fileItem, response, status, headers);


                if (status == 200) {
                    fileItem.pathToReport = '/images/foto/' + response.avatarFd;
                    fileItem.goReport = response.goReport;
                    fileItem.dateUpload = response.dateUpload;
                    toastr.success(response.message, 'Ok! ');
                    fileItem.progress = response.progress;
                    fileItem.errorPercent = '0';
                    fileItem.statusOk = response.message;
                    $interval(function () {
                        $scope.refresh();
                        //location.reload()
                    }, 2000, 1);

                    // fileItem.allEr = response.allEr;
                }
                switch (response.status) {
                    case 202:
                        //toastr.success(response.message, ' Статус ' + response.status);
                        fileItem.progress = response.progress;
                        fileItem.errorPercent = '(' + response.errorPercent + '%)';
                        //fileItem.pathToReport = '/images/foto/report/' + response.avatarFd;
                        fileItem.goReport = response.goReport;
                        fileItem.statusOk = response.message;
                        fileItem.allEr = response.allEr;

                        break;
                }
            };
            uploader.onCompleteAll = function (fileItem, response, status, headers) {
                //$scope.getDatePrice();
                $scope.uploaderButtonPrice = false;
            };


            $scope.options =
                [
                    {display: "Загрузить файл", value: "uploader"}
                ];
            $scope.modeSelect = $scope.options[0];
            $scope.uploaderView = "/js/private/admin/users/views/uploader.html";


            $scope.closed = function () {
                if ($scope.close) {
                    $scope.close = false;
                }
                else {
                    $scope.close = true;
                }
            };
            $scope.getBoss = function () {
                console.log('$scope.item', $scope.item);
                $http.post('/user/getBoss', $scope.item)
                    .then(function (response) {
                        console.log('RESPONSE BOSS: ', response);
                        $scope.boss = response.data;
                    }, function (response) {
                        console.log('ERROR POST BOSS', response);
                        $scope.data = response.data || 'Request failed';
                        $scope.status = response.status;
                    });
            };
            $scope.refresh = function () {
                let item = $scope.item = Users.get({id: $stateParams.userId}, function (users) {
                        $scope.users = users;
                        $scope.getBoss();
                        item.getBirthday();
                        item.getDateInWork();
                        item.getFiredDate();
                        item.getDecree();
                    }
                );

                //console.log('refresh',$scope.item);
                //console.log('refresh1',$scope.users);
            };

            $scope.delete2 = function (item) {
                item.$delete({id:item.id}, function (success) {
                    toastr.success(info.objectDelete, info.ok);
                    $state.go(info.redirectSelf);
                    // $location.path("/table");
                    // $scope.$apply(function() { $location.path("/admin/users"); });
                    // $scope.refresh();
                }, function (err) {
                    //console.log(err);
                    toastr.error(err, info.error + ' 122! ');
                })
            };

            $scope.editProfile = {
                properties: {},
                errorMsg: '',
                error: false,
                saving: false,
                loading: false,
                changePassword: {}
            };

            $scope.changeMyPassword = function () {
                $http.put('/users/changePassword', {
                        id: $scope.item.id,
                        password: $scope.editProfile.properties.password
                    })
                    .then(function onSuccess(sailsResponse) {
                        //console.log('sailsResponse: ');
                        //console.log(sailsResponse);
                        // $scope.userProfile.properties.gravatarURL = sailsResponse.data.gravatarURL;
                        // window.location = '#/profile/' + $scope.editProfile.properties.id;
                        //window.location = '/profile';
                        toastr.success(info.passChange);
                        $scope.editProfile.loading = false;
                    })
                    .catch(function onError(sailsResponse) {
                        // console.log('sailsresponse: ', sailsResponse)
                        // Otherwise, display generic error if the error is unrecognized.
                        $scope.editProfile.changePassword.errorMsg = $scope.unexpected + (sailsResponse.data || sailsResponse.status);
                        toastr.error($scope.editProfile.changePassword.errorMsg);
                    })
                    .finally(function eitherWay() {
                        $scope.editProfile.loading = false;
                    });
            };

            $scope.delFoto = function (item) {
                item.avatarUrl = '';
                if (angular.isDefined(item.id)) {
                    item.$update(item, function (success) {
                            //toastr.success(success);
                            //toastr.options.closeButton = true;
                            toastr.success(info.changed);
                            $scope.refresh();
                        },
                        function (err) {
                            //console.log(err);
                            toastr.error(err.data.invalidAttributes, info.error + ' 87445!');
                        }
                    );
                }

            };

            var reversValue = function (item) {
                item.birthday = ( item.birthday) ? new Date(moment(item.birthday, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
                item.dateInWork = (item.dateInWork) ? new Date(moment(item.dateInWork, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
                item.firedDate = ( item.firedDate) ? new Date(moment(item.firedDate, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
                item.decree = ( item.decree) ? new Date(moment(item.decree, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
                return item;
            };

            $scope.saveEdit = function (item) {

                //item.birthday = ( item.birthday) ? new Date(moment(item.birthday, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
                //item.dateInWork = (item.dateInWork) ? new Date(moment(item.dateInWork, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
                //item.firedDate = ( item.firedDate) ? new Date(moment(item.firedDate, ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;

                item = reversValue(item);
                if (angular.isDefined(item.id)) {
                    item.$update(item, function (success) {
                            toastr.success(info.changed);
                            $scope.refresh();
                        },
                        function (err) {
                            toastr.error(err.data.invalidAttributes, info.error + ' 11445!');
                        }
                    );
                } else {
                    if (angular.isDefined(item)
                    //&& angular.isDefined(item.firstName) &&
                    //angular.isDefined(item.lastName) &&
                    //angular.isDefined(item.patronymicName)
                    /*  &&
                     angular.isDefined(item.login) &&
                     angular.isDefined(item.fired) &&
                     angular.isDefined(item.birthday) &&
                     angular.isDefined(item.email)*/
                    ) {
                        item.password = info.passDefault;
                        item.$save(item, function (success) {
                                //console.log(success);
                                //location.reload();
                                toastr.success(info.newUserOk);
                                // /admin/user/
                                //$location.path('/profile') ;
                                $state.go('home.admin.user', {userId: success.id});
                            },
                            function (err) {
                                toastr.error(err.data.invalidAttributes, info.error + ' 89336!');
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
                            toastr.error(err.data.invalidAttributes, info.error + ' 44006!');
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
                            toastr.error(err.data.invalidAttributes, info.error + ' 44016!');
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
                            toastr.error(err.data.invalidAttributes, info.error + ' 44016!');
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
                            toastr.error(err.data.invalidAttributes, info.error + ' 90!');
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
                $scope.passwordRepeat = $scope.item.password;
                $scope.userInfoForm.$setPristine();
            };

            $scope.canRevert = function () {
                return !angular.equals($scope.item, original);
            };

            $scope.refresh();
        }
    ]);
