(function () {
    'use strict';

    angular
        .module('app')
        .controller('roleController', roleController);

    roleController.$inject = ['$scope', '$location', '$filter', '$state', '$stateParams', 'abp.services.app.role'];

    function roleController($scope, $location, $filter, $state, $stateParams, roleService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Manage Role';
        vm.roles = {};
        vm.allPermissions = abp.auth.allPermissions;
        vm.rolePermissions = [];
        vm.savePermissions = savePermissions;
        vm.getRoleById = getRoleById;
        vm.updateRole = updateRole;
        vm.getAllRoles = getAllRoles;
        vm.addNew = addNew;
        vm.edit = edit;
        vm.saveRole = saveRole;
        vm.setPermission = setPermission;
        vm.getPermissionByRoleId = getPermissionByRoleId;

        vm.gridOptions = {
            enableSorting: true,
            enableRowSelection: true,
            showSelectionCheckbox: true,
            enableSelectAll: false,
            multiSelect: false,
            enableCellEdit: false,
            columnDefs: [
              { name: 'Id', field: 'id', visible: false },
              { name: 'Role Name', field: 'name' },
              { name: 'Display Name', field: 'displayName' }
            ],
            onRegisterApi: function (gridApi) {
                vm.myGridApi = gridApi;
                vm.myGridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    vm.disableEdit = false;
                    vm.selectedRowEntity = angular.copy(row.entity);
                });
            }
        };

        activate();

        function activate() {
            vm.disableEdit = true;

            vm.role = {
                id: 0,
                name: '',
                displayName: ''
            };


            vm.rolePermissions = [];

            if ($state.current.data != undefined) {
                if ($state.current.data.action === 'edit') {

                    vm.getRoleById();
                }
                if ($state.current.data.action === 'permission') {
                    vm.getPermissionByRoleId();
                }
            } else {
                vm.getAllRoles();
            }
        }

        function getRoleById() {
            var input = {
                roleId: $stateParams.id
            }
            abp.ui.setBusy(
                   null,
                   roleService.getRoleById(input).success(function (data) {
                       vm.role = data;
                   })
               );
        }

        function getAllRoles() {
            abp.ui.setBusy(
                      null,
                      roleService.getAllRoles().success(function (data) {
                          vm.roles = data;
                          vm.gridOptions.data = vm.roles;


                          //console.log(vm.roles);
                      })
                  );
        }

        function addNew() {
            $location.path("/roles/new");
        }

        function edit() {
            $location.path("/roles/edit/" + vm.selectedRowEntity.id);
        }

        function setPermission() {
            $location.path("/roles/permission/" + vm.selectedRowEntity.id);
        }

        function saveRole() {

            abp.ui.setBusy(
                     null,
                     roleService.addRole(vm.role).success(function (data) {
                         abp.notify.info("Role created successfully.");
                         $location.path('/roles');
                     })
                 );
        }

        function updateRole() {
            abp.ui.setBusy(
                    null,
                    roleService.updateRole(vm.role).success(function (data) {
                        abp.notify.info("Role updated successfully.");
                        $location.path('/roles');
                    })
                );
        }

        function savePermissions() {
            //console.log(vm.roles);
            var item = vm.role;
            //angular.forEach(vm.roles, function (item) {
            var rolePermission = {};
            rolePermission.roleId = item.id;
            rolePermission.grantedPermissionNames = [];
            angular.forEach(item.permissions, function (permission) {
                if (permission.isGranted) {
                    rolePermission.grantedPermissionNames.push(permission.name);
                }
            });
            vm.rolePermissions.push(rolePermission);

            //});       
            abp.ui.setBusy(
           null,
           roleService.updateRolePermissions(
               vm.rolePermissions
           ).success(function () {
               abp.notify.info("Roles permissions updated successfully.");
               activate();
               //$location.path('/brands');
           })
            );

            $location.path("/roles");
        }

        function getPermissionByRoleId() {
            var input = {
                roleId: $stateParams.id
            }
            abp.ui.setBusy(
                   null,
                   roleService.getRoleById(input).success(function (data) {
                       vm.role = data;
                       debugger
                       //angular.forEach(vm.roles, function (item) {
                       if (vm.role.permissions.length == 0) {
                           angular.forEach(vm.allPermissions, function (key, value) {
                               var permission = {};
                               permission.isGranted = false;
                               permission.name = value;
                               vm.role.permissions.push(permission);
                           })

                       } else {
                           angular.forEach(vm.allPermissions, function (key, value) {
                               var permission = {};
                               var expression = {
                                   name: value
                               };
                               var filteredPermission = $filter('filter')(vm.role.permissions, expression);
                               if (filteredPermission.length == 0) {
                                   permission.isGranted = false;
                                   permission.name = value;
                                   vm.role.permissions.push(permission);
                               }

                           })

                       }
                       //});
                        vm.role.permissions = $filter('orderBy')(vm.role.permissions, "name") ;
                   })                                            
                  
               );
        }
    }
})();
