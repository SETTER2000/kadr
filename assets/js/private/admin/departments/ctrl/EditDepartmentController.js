angular.module('DepartmentModule')
    .controller('EditDepartmentController', ['$scope', '$http', '$state', 'Departments', '$stateParams', 'CONF_MODULE',
        function ($scope, $http, $state, Departments, $stateParams) {
            // $state.transitionTo('admin.users.show.id');
            // $scope.refresh = function () {
            // return console.log($stateParams.id);
            $scope.refresh = function () {
                var item = $scope.item = Departments.get({id: $stateParams.depId}, function (departments) {
                    $scope.departments = departments;
                    // кол-во пользователей
                    //console.log($scope.departments.length);
                    //console.log($scope.departments);
                    // console.log('USSS1: ' +  $scope.newBirthday);
                    // console.log('USSS2: ' + $scope.item.dt());
                    // // $scope.item.birthday = $scope.newBirthday;
                    // console.log('USSS3: ' + item.birthday);
                    // console.log('USSS4: ' + $scope.item.birthday);

                }, function (err) {
                    if (err) console.log(err.message);
                });
            };
                $scope.saveEdit = function (item) {
                    if (angular.isDefined(item.id)) {
                        //item.$update(item);
                        item.$update(item, function (success) {
                                $scope.refresh();
                                console.log('SUCCESS: OK!');
                                item.ok();
                            },
                            function (err) {

                                console.log('ERROR: ' + err.status);
                                console.log(err);
                                item.er();
                            }
                        );
                    } else {
                        $scope.refresh();
                        item.$save(item)
                    }
                };
            
            // $scope.item.contacts = [{type:'phone', value:'1(234) 555-1212'}];

            // $scope.state = /^\w\w$/;
            // $scope.zip = /^\d\d\d\d\d$/;

            $scope.addContact = function () {
                item.contacts.push({type: 'телефон', value: ''});
            };
            $scope.removeContact = function (contact) {
                var contacts = $scope.item.contacts;
                for (var i = 0, ii = contacts.length; i < ii; i++) {
                    if (contact === contacts[i]) {
                        contacts.splice(i, 1);
                    }
                }
            };
            $scope.isCancelDisabled = function () {
                return angular.equals(master, $scope.form);
            };

            $scope.isSaveDisabled = function () {
                return $scope.myForm.$invalid || angular.equals(item, $scope.form);
            };

            $scope.delete = function (item) {
                console.log(item);
                item.$delete(item, function (success) {
                    $scope.refresh();
                    console.log('SUCCESS: OK!');
                    item.ok();
                }, function (err) {
                    console.log('ERROR: ' + err.status);
                    console.log(err);
                    item.er();
                })
            };
            $scope.refresh();
        }]);
