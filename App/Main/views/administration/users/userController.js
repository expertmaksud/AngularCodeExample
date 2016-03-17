(function () {
    'use strict';

    angular
        .module('app')
        .controller('userController', userController);

    userController.$inject = ['$scope', '$location', '$state', '$stateParams', 'abp.services.app.role', 'abp.services.app.user',
    'abp.services.app.employee'];

    function userController($scope, $location, $state, $stateParams, roleService, userService, employeeService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Users';
        vm.user = {};
        vm.roles = [];
        vm.selectedRole = { id: '' };
        vm.getAllRoles = getAllRoles;
        vm.addNew = addNew;
        vm.saveUser = saveUser;
        vm.getAllUsers = getAllUsers;
        vm.setWarehouse = setWarehouse;
        vm.updateUser = updateUser;
        vm.getUserById = getUserById;
        vm.edit = edit;
        vm.addNewEmployee = addNewEmployee;

        activate();

        vm.gridOptions = {
            enableSorting: true,
            enableRowSelection: true,
            showSelectionCheckbox: true,
            enableSelectAll: false,
            multiSelect: false,
            enableCellEdit: false,
            columnDefs: [
              { name: 'Id', field: 'id', visible: false },
              { name: 'User Name', field: 'userName' },
              { name: 'Name', field: 'name' },
              { name: 'EmailAddress', field: 'emailAddress' },
              { name: 'SurName', field: 'surname' },
              { name: 'IsActive', field: 'isActive' },
              { name: 'CreationTime', field: 'creationTime', type: 'date', cellFilter: 'date:"dd-MMM-yyyy h:m a"' }
            ],
            onRegisterApi: function (gridApi) {
                vm.myGridApi = gridApi;
                vm.myGridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    vm.disableEdit = false;
                    vm.selectedRowEntity = angular.copy(row.entity);
                });
            }
        };


        function activate() {
            vm.user = {
                name: '',
                userName: '',
                password: '',
                surName: '',
                emailAddress: '',
                roleId: ''
            };

            vm.employee = {
                id: 0,
                userId: 0,
                fullName: '',
                mothersName: '',
                permanentAddress: '',
                presentAddress: '',
                nationalId: '',
                companyId: '',
                contactNumber: '',
                department: '',
                designation: ''
            };
            vm.disableEdit = true;
            vm.getAllRoles();
            vm.getAllUsers();

            if ($state.current.data != undefined) {
                if ($state.current.data.action === 'edit') {
                    vm.getUserById($stateParams.id);
                }
            }
        }

        function addNew() {
            vm.user = {
                name: '',
                userName: '',
                password: '',
                surName: '',
                emailAddress: '',
                roleId: ''
            };
            $location.path('/users/new');
        }

        function getAllRoles() {
            abp.ui.setBusy(
                      null,
                      roleService.getAllRoles().success(function (data) {
                          vm.roles = data;

                      })
                  );
        }

        function saveUser() {
            vm.user.roleId = vm.selectedRole.id;
            abp.ui.setBusy(
                     null,
                     userService.createUser(vm.user).success(function (data) {
                         userService.getNewlyCreatedUser(vm.user).success(function (user) {
                             vm.addNewEmployee(user.id);
                         });
                         abp.notify.info("User created successfully.");
                         $location.path('/users');
                     })
                 );
        }

        function edit() {
            $location.path('/users/edit/' + vm.selectedRowEntity.id);
        }
        function updateUser() {
            vm.user.RoleName = vm.selectedRole.name;
            abp.ui.setBusy(
                     null,
                     userService.updateUser(vm.user).success(function (data) {
                         abp.notify.info("User updated successfully.");
                         $location.path('/users');
                     })
                 );
        }

        function getAllUsers() {
            abp.ui.setBusy(
                 null,
                 userService.getAllUsers().success(function (data) {
                     vm.gridOptions.data = data.users;

                 })
             );
        }

        function getUserById(id) {
            var input = {
                userId: id
            };

            abp.ui.setBusy(
                null,
                userService.getUserById(input).success(function (data) {
                    vm.user = data;
                    vm.selectedRole.id = vm.user.roleId;
                })
            );
        };

        function addNewEmployee(userId) {
            vm.employee.userId = userId;
            vm.employee.fullName = vm.user.name;
            abp.ui.setBusy(
                    null,
                    employeeService.createEmployee(
                        vm.employee
                    ).success(function () {
                        abp.notify.info(abp.utils.formatString(localize("EmployeeCreatedMessage"), vm.employee.fullName));
                        activate();

                    })
                );
        };

        function setWarehouse() {
            vm.disableEdit = true;
            $location.path('/userwarehouse/' + vm.selectedRowEntity.id);
        }
    }
})();
