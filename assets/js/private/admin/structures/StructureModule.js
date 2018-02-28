angular.module('StructureModule', ['ui.router', 'ngResource', 'vAccordion', 'ngAnimate'])
    .config(function ($stateProvider) {
        $stateProvider
            .state('home.admin.structures', {
                url: '/structures',
                views: {
                    '@': {
                        templateUrl: '/js/private/admin/structures/tpl/list.tpl.html',
                        controller: 'ListStructureController'
                    }
                }
            })
            //.state('home.admin.structures.settings', {
            //    url: '/settings',
            //    templateUrl: '/js/private/admin/structures/views/home.admin.structures.settings.html',
            //    controller: 'ListSkdController'
            //})
            //.state('home.admin.structures.list', {
            //    url: '/list',
            //    views: {
            //        'list@home.admin.structures': {
            //            templateUrl: '/js/private/admin/structures/views/home.admin.structures.list.html',
            //            controller: 'ListSkdController'
            //        }
            //    }
            //})
            .state('home.admin.structures.work', {
                url: '/work',
                views: {
                    'list@home.admin.structures': {
                        templateUrl: '/js/private/admin/structures/views/home.admin.structures.work.html',
                        controller: 'ListSkdController'
                    }
                }
            })
            .state('home.admin.structures.accordion', {
                url: '/accordion',
                views: {
                    'list@home.admin.structures': {
                        templateUrl: '/js/private/admin/structures/views/home.admin.structures.accordion.html',
                        controller: 'ListSkdController'
                    }
                }
            })
            .state('home.admin.structures.test', {
                url: '/test',
                views: {
                    'list@home.admin.structures': {
                        templateUrl: '/js/private/admin/structures/views/test.html',
                        controller: 'ListSkdController'
                    }
                }
            })
            .state('home.admin.structure', {
                url: '/structure/:structureId',
                views: {
                    '@': {
                        templateUrl: '/js/private/admin/structures/tpl/show.tpl.html',
                        controller: 'SkdController'
                    }
                }
            })
        //.state('home.admin.structures.attendance', {
        //    url: '/attendance',
        //    views: {
        //        'attendance@home.admin.structures': {
        //            templateUrl: '/js/private/admin/attendances/tpl/list.tpl.html',
        //            controller: 'ListAttendanceController'
        //        }
        //    }
        //})
        //.state('home.admin.structures.edit', {
        //    url: '/edit/:structureId',
        //    views: {
        //        '@': {
        //            templateUrl: '/js/private/admin/structures/tpl/edit.tpl.html',
        //            controller: 'EditController'
        //        }
        //    }
        //})
        //.state('home.admin.user', {
        //    url: '/user/:structureId',
        //    views: {
        //        '@': {
        //            templateUrl: '/js/private/admin/structures/tpl/show.tpl.html',
        //            controller: 'UserController'
        //        }
        //    }
        //})
        //.state('home.admin.structures.create', {
        //    url: '/create/:structureId',
        //    views: {
        //        '@': {
        //            templateUrl: '/js/private/admin/structures/tpl/edit.tpl.html',
        //            controller: 'EditController'
        //        }
        //    }
        //})
        //.state('home.admin.structures.administration', {
        //    url: '/administration',
        //    views: {
        //        '@': {
        //            templateUrl: '/js/private/admin/structures/tpl/administration.tpl.html',
        //            controller: 'AdministrationController'
        //        }
        //    }
        //})
        //.state('home.admin.structures.exit', {
        //    url: '/exit',
        //    views: {
        //        '@': {
        //            templateUrl: '/js/private/admin/structures/tpl/exit.html',
        //            controller: 'EditController'
        //        }
        //    }
        //})
        ;
    })
    .config(function (accordionConfig) {
        accordionConfig.expandAnimationDuration = 0.3;
    })
    .constant('CONF_MODULE_STRUCTURE', {baseUrl: '/structures/:structureId'})
    .run(function ($rootScope, $state, $stateParams, amMoment) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        amMoment.changeLocale('ru');
    })
    .factory('Structures', function ($resource, $state, moment, CONF_MODULE_STRUCTURE) {
        let Structures = $resource(
            CONF_MODULE_STRUCTURE.baseUrl,
            {structureId: '@id'},
            // Определяем собственный метод update на обоих уровнях, класса и экземпляра
            {
                update: {
                    method: 'PUT'
                }
            }
        );
        Structures.prototype.formatDate = function (date) {
            var dd = date.getDate();
            if (dd < 10) dd = '0' + dd;
            var mm = date.getMonth() + 1;
            if (mm < 10) mm = '0' + mm;
            var yy = date.getFullYear();
            if (yy < 10) yy = '0' + yy;
            return yy + '-' + mm + '-' + dd;
        };

        Structures.prototype.getFullName = function () {
            return this._id.name;
        };

        Structures.prototype.formMinStart = function () {
            return moment(this.minStart).utc().format('LT');
        };
        Structures.prototype.getPeriodTime = function (e) {
            return moment(e).utc().format('LT');
        };
        Structures.prototype.getOwner = function () {
            return this._id.owner;
        };

        Structures.prototype.formMaxEnd = function () {
            return moment(this.maxEnd).utc().format('LT');
        };
        Structures.prototype.formWorkTime = function () {
            return moment(this.workTime).utc().format('LT');
        };
        Structures.prototype.formDayOfWeek = function () {

            return moment(this._id.date).format('dd');
        };
        Structures.prototype.formDate = function () {
            return moment(this._id.date).utc().format('L');
        };
        Structures.prototype.getShortName = function () {
            return this.lastName + ' ' + this.firstName.substr(0, 1) + '.' + this.patronymicName.substr(0, 1) + '.';
        };
        Structures.prototype.sc = function () {
            return this.section;
        };
        Structures.prototype.scs = function () {
            return this.sections;
        };
        Structures.prototype.ok = function () {
            return alert('Сотрудник: ' + this.getFullName() + ' изменён!');
        };
        Structures.prototype.er = function () {
            return alert('ОШИБКА!!! Сотрудник: ' + this.getFullName() + ' - изменения не приняты!');
        };
        Structures.prototype.lastDateSetting = function () {
            return new Date();
        };
        Structures.prototype.getBirthday = function () {
            if (this.birthday) {
                var tm;
                tm = new Date(this.birthday);
                this.birthday = tm;
            }
        };
        Structures.prototype.getDateInWork = function () {
            if (this.dateInWork) {
                var tm;
                tm = new Date(this.dateInWork);
                this.dateInWork = tm;
            }
        };
        Structures.prototype.getFiredDate = function () {
            if (this.firedDate) {
                var tm;
                tm = new Date(this.firedDate);
                this.firedDate = tm;
            }
        };
        Structures.prototype.getCreatedAt = function () {
            if (!this.createdAt) {
                return 'Mongo import';
            }
            return this.createdAt;
        };
        Structures.prototype.getCurrentDate = function () {
            var t = this.formatDate(new Date());
            return t;
        };
        Structures.prototype.getListUrl = function () {
            return '/admin/structures';
        };
        Structures.prototype.getEditUrl = function (id) {
            return '/admin/users/edit/' + id;
        };
        Structures.prototype.getShowUrl = function (id) {
            return '/admin/structures/' + id;
        };
        Structures.prototype.deactivation = function () {
            return ' - деактивирован';
        };
        Structures.prototype.getContact = function (type) {
            for (var i in this.contacts) {
                if (this.contacts[i].type === type) {
                    return this.contacts[i].value;
                    //return this.contacts[i].type + ': ' + this.contacts[i].value;
                }
            }
        };
        Structures.prototype.forrbidden = function () {
            return ' - уволены';
        };
        return Structures;
    })
    .filter('getContact', function () {
        return function (value, param, field) {
            //
            // console.log('VALUE FIL: ', value);
            // console.log('VALUE PARAM: ', param);

            if (angular.isObject(value) && value.length > 0 && angular.isString(param)) {
                for (var prop in value) {
                    if (value.hasOwnProperty(prop)) {
                        console.log("value." + prop + " = " + value[prop].type);
                        if (value[prop].type == param) return value[prop].value;
                    }
                }
            }
            return 'не найден';
        }
    })
    .filter('getPosition', function () {
        return function (value, param) {
            //
            console.log('VALUE FIL: ', value);
            console.log('VALUE PARAM: ', param);

            if (angular.isArray(value) && value.length > 0 && angular.isString(param)) {
                let position = [];
                for (var prop in value) {
                    if (value.hasOwnProperty(prop)) {
                        console.log("value." + prop + " = " + value[prop][param]);
                        // positions.push({});
                       return value[prop][param];
                    }
                }
            }
            return 'должность не указана';
        }
    })

// .directive('pagination2', function () { // функция компиляции директивы (фабричная функция)
//     return {
//         restrict: 'E',
//         scope: {
//             //numPages: '=', // кол-во страниц (кнопок)
//             defaultRows: '=', // по умолчанию сколько строк должно показываться на одной странице
//             limitRows: '=',  // массив содержащий значения кол-ва строк для одной страницы [20,30,50,70,100]
//             lengthObject: '=', // кол-во объектов в обрабатываемой коллекции объектов
//             currentPage: '=',
//             onSelectPage: '&',
//             added:'='
//         },
//         templateUrl: '/js/private/admin/structures/views/pagination.html',
//         replace: true,
//         link: function (scope) {
//
//
//             scope.$watch('added', function (value) {
//                 scope.added = value;
//             });
//
//             scope.$watch('lengthObject', function (value) {
//                 scope.numPages = Math.floor(value / scope.defaultRows) + 1;
//                 //scope.pages = [];
//                 //for (var i = 1; i <= value; i++) {
//                 //    scope.pages.push(i);
//                 //}
//                 //if (scope.currentPage > value) {
//                 //    scope.selectPage(value);
//                 //}
//             });
//
//
//             scope.$watch('numPages', function (value) {
//                 scope.pages = [];
//                 for (var i = 1; i <= value; i++) {
//                     scope.pages.push(i);
//                 }
//                 if (scope.currentPage > value) {
//                     scope.selectPage(value);
//                 }
//             });
//             scope.$watch('limitRows', function (value) {
//                 scope.rows = [];
//                 for (var i = 0; i <= value.length; i++) {
//                     scope.rows.push(value[i]);
//                 }
//             });
//             scope.$watch('defaultRows', function (value, oldValue) {
//                 if (value > 0) {
//                     scope.defaultRows = value;
//                     scope.numPages = Math.floor(scope.lengthObject / scope.defaultRows) + 1;
//                 }
//             });
//             scope.noPrevious = function () {
//                 return scope.currentPage === 1;
//             };
//             scope.noNext = function () {
//                 return scope.currentPage === scope.numPages;
//             };
//             scope.isActive = function (page) {
//                 return scope.currentPage === page;
//             };
//             scope.isActiveRow = function (row) {
//                 return scope.defaultRows === row;
//             };
//             scope.selectPage = function (page) {
//                 if (!scope.isActive(page)) {
//                     scope.currentPage = page;
//                     scope.onSelectPage({page: page});
//                 }
//             };
//             scope.selectPrevious = function () {
//                 if (!scope.noPrevious()) {
//                     scope.selectPage(scope.currentPage - 1);
//                 }
//             };
//             scope.selectNext = function () {
//                 if (!scope.noNext()) {
//                     scope.selectPage(scope.currentPage + 1);
//                 }
//             };
//             scope.getLimitRows = function (limitRows) {
//                 scope.defaultRows = limitRows;
//                 if (scope.lengthObject <= scope.defaultRows) {
//                     scope.numPages = 1;
//                 } else {
//                     scope.numPages = Math.floor(scope.lengthObject / scope.defaultRows) + 1;
//                 }
//             };
//         }
//     };
// })
// .directive('alfavit2', function () {
//     return {
//         restrict: 'E',
//         // Это изолированый scope.
//         // имена полей изолированного контекста (свойства объекта), а значение
//         // определяет имя атрибута элемента с префиксом @, = или &
//         /** Например:
//          * scope: {
//                 isolated1: ‘@attribute1’,
//                 isolated2: ‘=attribute2’,
//                 isolated3: ‘&attribute3’
//                 }
//
//          * Если имя атрибута отсутствует в описании значения, предполагается,
//          * что он имеет то же имя, что и поле изолированного контекста:
//          * scope: { isolated1: ‘@’ }
//          * Здесь предполагается, что атрибут имеет имя isolated1.
//          * (стр. 265)
//          */
//         scope: {
//             objectName: '=', // Массив оъектов с фамилиями
//             countChar: '=', // по умолчанию сколько строк должно показываться на одной странице
//             filedName: '=', // из какого поля берутся начальные буквы
//             //onSelectPart: '&',
//             getCharText: '&',
//             charText: '=',
//             where: '='
//         },
//         templateUrl: '/js/private/admin/structures/views/alfavit.html',
//         replace: true,
//         link: function (scope) {
//
//             scope.$watch('objectName', function (value) {
//                 //console.log('OBJECT NAME33');
//                 //console.log(value);
//
//                 scope.objectName = value;
//                 scope.checkArray();
//             });
//
//             scope.checkArray = function () {
//                 var parts = [];
//                 var resurs = scope.objectName;
//                 //console.log('scope.filedName');
//                 //console.log(scope.filedName);
//                 for (var key in resurs) {
//                     var obj = resurs[key];
//
//                     //console.log('obj');
//                     //console.log(obj);
//                     for (var prop in obj) {
//
//                         //console.log(prop);
//                         var chars;
//                         if (prop === scope.filedName) {
//                             //console.log('obj[prop]');
//                             //console.log(obj[prop].name);
//                             chars = obj[prop].name.substr(0,1);
//                             parts.push(chars);
//                         }
//                     }
//                 }
//
//                 //console.log('parts');
//                 //console.log(parts);
//                 //console.log('PARTS');
//                 //console.log(parts);
//                 scope.parts =  scope.uniqueValue(parts).sort();
//                 //console.log('UNIQUE2 PARTS2');
//                 //console.log(scope.parts);
//             };
//
//             scope.uniqueValue = function(arr) {
//                 var obj = {};
//
//                 for (var i = 0; i < arr.length; i++) {
//                     var str = arr[i];
//                     obj[str] = true; // запомнить строку в виде свойства объекта
//                 }
//
//                 return Object.keys(obj); // или собрать ключи перебором для IE8-
//             };
//
//             scope.$watch('charText', function (value) {
//                 scope.charText = value;
//             });
//
//             scope.$watch('where', function (value) {
//                 scope.where = value;
//             });
//
//             scope.isNumeric = function (n) {
//                 return !isNaN(parseFloat(n)) && isFinite(n);
//             };
//
//             scope.getPartOfSpeech = function (str, countChar) {
//                 var cntChar;
//                 cntChar = (scope.isNumeric(countChar)) ? countChar : 2;
//                 return str.substr(0, cntChar);
//             };
//
//             scope.isActive = function (part) {
//                 return scope.currentPart === part;
//             };
//
//             scope.isActiveRow = function (row) {
//                 return scope.defaultRows === row;
//             };
//
//             scope.getPartText = function (ch) {
//                 if (angular.isString(ch)) {
//                     scope.where='^'+ch ;
//                     scope.charText = ch;
//                 } else {
//                     scope.charText = '';
//                 }
//
//             };
//
//             scope.getCharText = function (ch) {
//                 //console.log(ch);
//
//                 if (angular.isString(ch) && ch.length>0) {
//                     scope.where='^'+ch;
//                     scope.charText = ch;
//                 } else {
//                     // $scope.defaultRows;
//                     scope.charText = '';
//                     scope.where ='^.';
//                 }
//                 //scope.refresh(where);
//             };
//
//             scope.selectPart = function (part) {
//                 if (!scope.isActive(part)) {
//                     scope.currentPart = part;
//                     scope.getPartText(part);
//                     scope.getCharText(part);
//                     scope.onSelectPart({part: part});
//                 }
//             };
//         }
//     };
// })
// .directive('wordPart2', function () {
//     return {
//         restrict: 'E',
//         // Это изолированый scope.
//         // имена полей изолированного контекста (свойства объекта), а значение
//         // определяет имя атрибута элемента с префиксом @, = или &
//         /** Например:
//          * scope: {
//                 isolated1: ‘@attribute1’,
//                 isolated2: ‘=attribute2’,
//                 isolated3: ‘&attribute3’
//                 }
//
//          * Если имя атрибута отсутствует в описании значения, предполагается,
//          * что он имеет то же имя, что и поле изолированного контекста:
//          * scope: { isolated1: ‘@’ }
//          * Здесь предполагается, что атрибут имеет имя isolated1.
//          * (стр. 265)
//          */
//         scope: {
//             objectName: '=', // Массив оъектов с фамилиями
//             countChar: '=', // по умолчанию сколько строк должно показываться на одной странице
//             filedName: '=', // из какого поля берутся начальные буквы
//             onSelectPart: '&',
//             getCharText: '&',
//             charText: '=',
//             where: '='
//         },
//         templateUrl: '/js/private/admin/structures/views/wordPart.html',
//         replace: true,
//         link: function (scope) {
//             scope.$watch('objectName', function (value) {
//
//                 //console.log('OBJECT NAME');
//                 //console.log(value);
//
//                 scope.objectName = value;
//                 scope.checkArray();
//             });
//
//             scope.checkArray = function () {
//                 var parts = [];
//                 var v = scope.objectName;
//                 for (var key in v) {
//                     var obj = v[key];
//
//                     //console.log(obj);
//
//                     for (var prop in obj) {
//                         var chars;
//                         if (prop === scope.filedName) {
//                             chars = obj[prop].name.substr(0,scope.countChar);
//                             parts.push(chars);
//                         }
//                     }
//                 }
//                 //console.log('PARTS');
//                 //console.log(parts);
//                 scope.parts =  scope.uniqueValue(parts);
//                 //console.log('UNIQUE PARTS');
//                 //console.log(scope.parts);
//             };
//
//             scope.uniqueValue = function(arr) {
//                 var obj = {};
//
//                 for (var i = 0; i < arr.length; i++) {
//                     var str = arr[i];
//                     obj[str] = true; // запомнить строку в виде свойства объекта
//                 }
//
//                 return Object.keys(obj); // или собрать ключи перебором для IE8-
//             };
//
//             scope.$watch('charText', function (value) {
//                 scope.charText = value;
//             });
//
//             scope.$watch('where', function (value) {
//                 scope.where = value;
//             });
//
//             scope.isNumeric = function (n) {
//                 return !isNaN(parseFloat(n)) && isFinite(n);
//             };
//             scope.getPartOfSpeech = function (str, countChar) {
//                 var cntChar;
//                 cntChar = (scope.isNumeric(countChar)) ? countChar : scope.countChar;
//                 return str.substr(0, cntChar);
//             };
//             scope.isActive = function (part) {
//                 return scope.currentPart === part;
//             };
//             scope.isActiveRow = function (row) {
//                 return scope.defaultRows === row;
//             };
//             scope.getPartText = function (ch) {
//                 if (angular.isString(ch)) {
//                     scope.where = '^'+ch;
//                     scope.charText = ch;
//                     //console.log('WHERE');
//                     //console.log(scope.where);
//                 } else {
//                     // $scope.defaultRows;
//                     scope.charText = '.';
//                 }
//             };
//
//             scope.selectPart = function (part) {
//                 if (!scope.isActive(part)) {
//                     scope.currentPart = part;
//                     scope.getPartText(part);
//                     scope.onSelectPart({part: part});
//                 }
//             };
//
//         }
//     };
// })

;
