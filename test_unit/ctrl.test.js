/**
 * Перед тестированием закоментить в контроллере строки
 * $scope.me = window.SAILS_LOCALS.me;
 * if (!$scope.me.admin && !$scope.me.kadr) return $state.go('home.admin.emergences');
 *
 */

describe("EditEmergenceController", function () {
    // Arrange
    var scope, ctrl, httpBackend;

    // Загружаем модуль
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

    // inject предоставляет возможность использования DI в тестах
    beforeEach(inject(function ($httpBackend, $controller, $rootScope) {
        // создание нового scope
        scope = $rootScope.$new();
        httpBackend = $httpBackend;

        httpBackend.when('GET', obj).respond(['Hello,world!']);

        // сервис $controller испольльзуется для инстанциирования объекта контроллера
        // метод принимает 2 аргумента имя контроллера и объект содержащий свойства, которые используются для разрешения зависимостей
        ctrl = $controller("EditEmergenceController", {
            $scope: scope
        });
    }));

    // Act and Assess
    // it("Создание свойства me", function () {
    //     // Если контроллер работает правильно, то после его создания будет содержать значение counter = 0
    //     expect(scope.me).toBeDefined()
    // });
    // Act and Assess
    it("Создание свойства counter", function () {
        // Если контроллер работает правильно, то после его создания будет содержать значение counter = 0
        expect(scope.counter).toEqual(0);
    });
    it("Инкримент свойства", function () {
        // после запуска функции incrementCounter значение счетчика должно быть равным 1
        scope.incrementCounter();
        expect(scope.counter).toEqual(1);
    });
    it("Создание массива Departments", function () {
        expect(scope.Departments).toEqual(1);
    });
});