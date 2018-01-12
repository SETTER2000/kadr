angular.module('FurloughFModule', ['ui.router', 'toastr', 'ngResource', 'ngAnimate'])
    .config(function ($stateProvider) {
        $stateProvider
            .state('home.company.furloughs', {
                url: '/furloughs',
                views: {
                    '@': {
                        templateUrl: '/js/private/company/furloughs/tpl/list.tpl.html',
                        controller: 'ListFurloughFController'
                    }
                }
            })
            .state('home.company.furloughs.edit', {
                url: '/edit/:furloughId',
                views: {
                    '@': {
                        templateUrl: '/js/private/company/furloughs/tpl/edit.tpl.html',
                        controller: 'EditFurloughFController'
                    }
                }
            })
            .state('home.company.furloughs.settings', {
                url: '/settings',
                templateUrl: '/js/private/company/furloughs/views/home.company.furloughs.settings.html',
                controller: 'ListFurloughFController'
            })
            .state('home.company.furlough', {
                url: '/furlough/:furloughId',
                views: {
                    '@': {
                        templateUrl: '/js/private/company/departments/tpl/show.tpl.html',
                        controller: 'FurloughFController'
                    }
                }
            })
            .state('home.company.furloughs.create', {
                url: '/create/:furloughId',
                views: {
                    '@': {
                        templateUrl: '/js/private/company/furloughs/tpl/edit.tpl.html',
                        controller: 'EditFurloughFController'
                    }
                }
            })

        ;
    })
    .constant('CONF_MODULE_FURLOUGH', {baseUrl: '/furloughs/:furloughId'})
    .factory('FurloughsF', function ($resource, CONF_MODULE_FURLOUGH) {

        var FurloughsF = $resource(
            CONF_MODULE_FURLOUGH.baseUrl,
            {furloughId: '@id'},
            // Определяем собственный метод update на обоих уровнях, класса и экземпляра
            {
                update: {
                    method: 'PUT'
                }
            }
        );

        FurloughsF.prototype.formatDate = function (date) {

            var dd = date.getDate();
            if (dd < 10) dd = '0' + dd;

            var mm = date.getMonth() + 1;
            if (mm < 10) mm = '0' + mm;

            var yy = date.getFullYear();
            //var yy = date.getFullYear() % 100;
            if (yy < 10) yy = '0' + yy;

            return yy + '-' + mm + '-' + dd;
            //return dd + '.' + mm + '.' + yy;
        };

        FurloughsF.prototype.getFullName = function () {
            return this.lastName + ' ' + this.firstName + ' ' + this.patronymicName;
        };

        FurloughsF.prototype.sc = function () {
            return this.section;
        };
        FurloughsF.prototype.scs = function () {
            return this.sections;
        };

        FurloughsF.prototype.ok = function () {
            return alert(this.sc() + ': ' + this.name + ' изменёна!');
        };
        FurloughsF.prototype.er = function () {
            return alert('ОШИБКА!!! ' + this.sc() + ': ' + this.name + ' - изменения не приняты!');
        };
        FurloughsF.prototype.getListUrl = function () {
            return '/company/furloughs';
        };
        FurloughsF.prototype.getEditUrl = function (id) {
            return '/company/furloughs/edit/' + id;
        };
        FurloughsF.prototype.getShowUrl = function (id) {
            return '/company/furlough/' + id;
        };
        FurloughsF.prototype.deactivation = function () {
            return ' - деактивирована';
        };
        FurloughsF.prototype.addPosition = function (item) {
            if (angular.isArray(item.furloughs)) {
                item.furloughs.push({});
            } else {
                item.furloughs = [{}];
            }
            return item;
        };
        FurloughsF.prototype.arr = [];
        FurloughsF.prototype.removePosition = function (furlough, item) {
            if (angular.isDefined(furlough) &&
                angular.isDefined(furlough.id)) {
                this.arr.push(furlough.id);
            }
            var furloughs = item.furloughs;
            for (var i = 0, ii = furloughs.length; i < ii; i++) {
                if (furlough === furloughs[i]) {
                    furloughs.splice(i, 1);
                }
            }
            return item.removeFurlough = this.arr;
        };
        return FurloughsF;
    })
;

