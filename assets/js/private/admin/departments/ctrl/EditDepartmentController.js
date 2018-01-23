angular.module('DepartmentModule')
    .controller('EditDepartmentController', ['$scope', '$http', 'toastr', '$state', 'Departments', '$stateParams', 'CONF_MODULE_DEPARTMENT',
        function ($scope, $http,toastr, $state, Departments, $stateParams) {
            $scope.me = window.SAILS_LOCALS.me;
            if (!$scope.me.admin && !$scope.me.kadr) return $state.go('home');
            $scope.edit = $state.includes('home.admin.departments.edit');
            //if (!$scope.me.admin) $location.path('/');
            // $state.transitionTo('admin.users.show.id');


            //$http.get(`/getRootDepartment?id=${$stateParams.depId}`)
            //    .then(function (res) {
            //        console.log('res');
            //        console.log(res.data);
            //        $scope.items = res;
            //    }).catch(function (reason) {
            //});


            $scope.refresh = function () {
                //if(!angular.isDefined($stateParams.depId)) return;
                $scope.item = Departments.get({id: $stateParams.depId}, function (departments) {

                    $scope.departments = departments;
                }, function (err) {
                    if (err) console.log(err.message);
                });
            };
            $scope.saveEdit = function (item) {
                if (angular.isDefined(item.id)) {
                    //console.log('FFF: ', $scope.item.children[0].id);


                    //Departments.get({id: $scope.item.children[0].id}, function (dep) {
                    //    console.log('DEPPPARTMEN', dep);
                    //   item.childrenObj.push(dep);
                    //
                    //    console.log('ITEM: ' , item);
                    //
                    //
                    //}, function (err) {
                    //    if (err) console.log(err.message);
                    //});


                    item.$update(item.id, function (success) {
                            console.log('UPDATE ITEM: ',item);
                            toastr.success('Данные обновлены!');
                            $scope.refresh();
                        },
                        function (err) {
                            toastr.error(err,'Ошибка 1 EditDepartmentController!');
                        }
                    );


                } else {
                    //$scope.refresh();
                    item.$save(item.id,function (success) {
                            console.log('success',success.id);
                            toastr.success('Новый отдел создан.');
                            $state.go('home.admin.department', {depId: success.id});
                        },
                        function (err) {
                            toastr.error(err.data,'Ошибка! EditDepartmentController!');
                        });
                    //item.$save(item.id, function (success) {
                    //    console.log('SAVE ITEM: ',item);
                    //    toastr.success('Новый отдел создан.');
                    //    // /admin/user/
                    //    //$location.path('/profile') ;
                    //    $state.go('home.admin.department', {depId: success.id});
                    //}, function (err) {
                    //    toastr.error(err.data,'Ошибка! EditDepartmentController!');
                    //});

                }
            };

            //$scope.addContact = function () {
            //    if (angular.isArray($scope.item.owner)) {
            //        $scope.item.owner.push({type: "телефон", value: ""});
            //    } else {
            //        $scope.item.owner = [{type: "телефон", value: ""}];
            //    }
            //};
            $scope.addSubdivision = function () {
                if (angular.isArray($scope.item.children)) {
                    $scope.item.children.push({});
                } else {
                    $scope.item.children = [{}];
                }
            };
            $scope.removeSubdivision = function (department) {
                for (var i = 0, ii = $scope.item.children.length; i < ii; i++) {
                    if ($scope.item.children[i].id === department.id) {
                        $scope.item.children.splice(i, 1);
                        return;
                    }
                }
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
                item.$delete(item, function (success) {
                    toastr.success('Объект удалён.','OK! ');
                    $state.go('home.admin.departments');
                }, function (err) {
                    toastr.error(err,'Ошибка 3 EditDepartmentController!');
                })
            };

            $scope.refresh();
        }]);
