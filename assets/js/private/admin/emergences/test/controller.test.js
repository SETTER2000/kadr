/**
 * Перед тестированием закоментить в контроллере строки
 * $scope.me = window.SAILS_LOCALS.me;
 * if (!$scope.me.admin && !$scope.me.kadr) return $state.go('home.admin.emergences');
 *
 */

describe("EditEmergenceController", function () {

    // Arrange
    var mockScope = {};
    var controller;

    // (angular.mock.module("exampleApp") используется для загрузки модуля "exampleApp"
    beforeEach(module("EmergenceModule", ($provide) => {
        $provide.provider('Users', function () {
            "use strict";
            return {
                UsersFunction: function() {},
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
                DepartmentsFunction: function() {},
                $get: function () {
                    return {
                        DepartmentsFunction: function () {
                        }
                    };
                }
            }
        });
    }));

    // angular.mock.inject предоставляет возможность использования DI в тестах
    beforeEach(inject(function ($controller, $rootScope) {
        // создание нового scope
        mockScope = $rootScope.$new();

        // сервис $controller испольльзуется для инстанциирования объекта контроллера
        // метод принимает 2 аргумента имя контроллера и объект содержащий свойства, которые используются для разрешения зависимостей
        controller = $controller("EditEmergenceController", {
            $scope: mockScope
        });
    }));

    // Act and Assess
    it("Создание свойства counter", function () {
        // Если контроллер работает правильно, то после его создания будет содержать значение counter = 0
        expect(mockScope.counter).toEqual(0);
    });
    it("Инкримент свойства", function () {
        // после запуска функции incrementCounter значение счетчика должно быть равным 1
        mockScope.incrementCounter();
        expect(mockScope.counter).toEqual(1);
    });
});