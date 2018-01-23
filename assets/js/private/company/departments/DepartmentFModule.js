angular.module('DepartmentFModule', ['ui.router', 'ngResource', 'ngAnimate'])
    .constant('CONF_MODULE_DEPARTMENT', {baseUrl: '/departments/:depId'})
    .factory('DepartmentsF', function ($resource, CONF_MODULE_DEPARTMENT) {
        var DepartmentsF = $resource(
            CONF_MODULE_DEPARTMENT.baseUrl,
            {depId: '@id'},
            // Определяем собственный метод update на обоих уровнях, класса и экземпляра
            {
                update: {
                    method: 'PUT'
                }
            }
        );

        DepartmentsF.prototype.getFullName = function () {
            return this.name;
        };

         DepartmentsF.prototype.sc = function () {
             return this.section;
         };
         DepartmentsF.prototype.scs = function () {
             return this.sections;
         };

        DepartmentsF.prototype.ok = function () {
            return alert(this.section + ': ' + this.name + ' изменён!');
        };
        DepartmentsF.prototype.er = function () {
            return alert('ОШИБКА!!! ' + this.name +  ' - изменения не приняты!');
        };
        DepartmentsF.prototype.getListUrl = function () {
            return '/company/departments';
        };
        DepartmentsF.prototype.getEditUrl = function (id) {
            return '/company/departments/edit/'+id;
        };
        DepartmentsF.prototype.getShowUrl = function (id) {
            return '/company/department/'+id;
        };
        DepartmentsF.prototype.deactivation = function () {
            return  ' - деактивирован';
        };

        return DepartmentsF;
    })
;