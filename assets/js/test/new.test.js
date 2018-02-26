/**
 * Created by apetrov on 26.02.2018.
 */


describe('New TEST', function() {
    beforeEach(module('EmergenceModule'), ($provide) => {
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
    });

    var $controller;

    beforeEach(inject(function(_$controller_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;
    }));

    describe('$scope.grade', function() {
        var $scope, controller;

        beforeEach(function() {
            $scope = {};
            controller = $controller('EditEmergenceController', { $scope: $scope });
        });

        it('sets the strength to "strong" if the password length is >8 chars', function() {
            $scope.password = 'longerthaneightchars';
            $scope.grade();
            expect($scope.strength).toEqual('strong');
        });

        it('sets the strength to "weak" if the password length <3 chars', function() {
            $scope.password = 'a';
            $scope.grade();
            expect($scope.strength).toEqual('weak');
        });
    });
});