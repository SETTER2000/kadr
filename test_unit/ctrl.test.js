/**
 * Перед тестированием закоментить в контроллере строки
 * $scope.me = window.SAILS_LOCALS.me;
 * if (!$scope.me.admin && !$scope.me.kadr) return $state.go('home.admin.emergences');
 *
 */

describe("EditEmergenceController", function () {
    var $controller, $rootScope, $httpBackend, scope, controller,jsonHandler;

    /**
     * Load module
     */
    beforeEach(module("EmergenceModule", ($provide) => {
        $provide.provider('Users', function () {
            "use strict";
            return {
                UsersFunction: function () {
                },
                $get: function () {
                    return {
                        UsersFunction: function () {
                        }
                    };
                }
            }
        });

        $provide.provider('Departments', function () {
            "use strict";
            return {
                DepartmentsFunction: function () {
                },
                $get: function () {
                    return {
                        DepartmentsFunction: function () {
                        }
                    };
                }
            }
        });
    }));
    beforeEach(inject((_$controller_, _$rootScope_,$injector)=> {
        // Настройте ложные ответы службы http
        $httpBackend = $injector.get('$httpBackend');
        $controller = _$controller_;
        $rootScope = _$rootScope_;

        jsonHandler= $httpBackend.when('GET', '/view1/data.json')
            .respond({data: '[XXX,XXX,XXX]'});


    }));
    beforeEach(()=> {
        scope = $rootScope.$new();
        controller = $controller('EditEmergenceController', {$scope: scope});
    });


    /**
     * METHODS
     */
    describe('METHODS', ()=> {
        describe('$scope.grade', () => {
            it('устанавливает надёжность «strong», если длина пароля составляет > 8 символов',
                () => {
                    scope.password = 'longerthaneightchars';
                    scope.grade();
                    expect(scope.strength).toEqual('strong');
                });
            it('устанавливает надёжность «medium», если длина пароля составляет > 3 символов',
                () => {
                    scope.password = 'asaa';
                    scope.grade();
                    expect(scope.strength).toEqual('medium');
                });
            it('устанавливает надёжность «weak», если длина пароля составляет < 3 символов',
                () => {
                    scope.password = 'lo';
                    scope.grade();
                    expect(scope.strength).toEqual('weak');
                });
        });
        describe('$scope.loadDepartments', () => {
            //it('инициализирует переменную $scope.departments массивом',
            //    () => {
            //        $httpBackend.expectGET('/view1/data.json');
            //        $controller;
            //        $httpBackend.flush();
            //    });
            it('should get stuff', function () {
                var url = '/departments';
                var httpResponse = [{ "stuffId": 1 }, { "stuffId": 2 }];
                scope.loadDepartments();
                $httpBackend.expectGET(url).respond(200, httpResponse);

                // Продолжить вот от сюда   https://docs.angularjs.org/api/ngMock/service/$httpBackend#overview
                $httpBackend.flush();
                expect(scope.departments.length).not.toBe(2);
            } );

        });
    });


    /**
     * PROPERTIES
     */
    describe('PROPERTIES', ()=> {
        describe('Properties controller', ()=> {
            it('$scope.edit не может быть null', ()=> {
                expect(scope.edit).not.toBeNull();
            });
            it('$scope.edit должна быть инициализирована true | false', ()=> {
                expect(scope.edit).not.toEqual('');
            });
        });
    });

    /**
     * OBJECTS
     */
    describe('OBJECTS', ()=> {
        describe('$scope.titles', ()=> {
            it('startKadr должна быть инициализирована', ()=> {
                expect(scope.titles.startKadr).toMatch('Начать обработку - ');
            });
            it('endKadr должна быть инициализирована', ()=> {
                expect(scope.titles.endKadr).toMatch('Обработка завершена - ');
            });
            it('kadrValid должна быть инициализирована', ()=> {
                expect(scope.titles.kadrValid).toMatch('Отклонить заявку - ');
            });
            it('check должна быть инициализирована', ()=> {
                expect(scope.titles.check).toMatch('Выполнено');
            });
            it('noCheck должна быть инициализирована', ()=> {
                expect(scope.titles.noCheck).toMatch('Не выполнено');
            });
        });
    });
});