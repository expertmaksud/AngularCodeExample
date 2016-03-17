(function () {
    'use strict';

    angular
        .module('main')
        .controller('employeeController', employeeController);

    employeeController.$inject = ['$scope', '$location', 'appSession', 'abp.services.app.employee'];

    function employeeController($scope, $location, appSession, employeeService) {
        var vm = this;
        vm.title = 'Employee';
        vm.addNewEmployee = addNewEmployee;
        vm.deleteEmployee = deleteEmployee;
        vm.getEmployees = getEmployees;
        vm.editSelectedRow = editSelectedRow;
        vm.updateEmployee = updateEmployee;
        vm.saveEmployee = saveEmployee;        

        var localize = abp.localization.getSource('SPMS');


        vm.gridOptions = {
            enableSorting: true,
            enableRowSelection: true,
            showSelectionCheckbox: true,
            enableSelectAll: false,
            multiSelect: false,
            enableCellEdit: false,
            enableFiltering: true,
            enableColumnResizing: true,
            showGridFooter: true,
            showColumnFooter: true,
            columnDefs: [
              { name: 'Id', field: 'id', visible: false },
              { name: 'FullName', field: 'fullName' },
              { name: 'FathersName', field: 'fathersName' },
              { name: 'MothersName', field: 'mothersName' },
              { name: 'PermanentAddress', field: 'permanentAddress' },
              { name: 'PresentAddress', field: 'presentAddress' },
              { name: 'NationalId', field: 'nationalId' },
              { name: 'CompanyId', field: 'companyId' },
              { name: 'ContactNumber', field: 'contactNumber' },
              { name: 'Department', field: 'department' },
              { name: 'Designation', field: 'designation' },              
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


        function addNewEmployee () {
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

        function deleteEmployee () {
            var data = {
                id: vm.selectedRowEntity.id
            };
            abp.ui.setBusy(
                    null,
                    employeeService.deleteEmployee(
                    data
                    ).success(function () {
                        abp.notify.info(abp.utils.formatString(localize("EmployeeDeletedMessage"), vm.employee.fullName));
                        activate();

                    })
                );
        };

        function getEmployees () {
            abp.ui.setBusy( //Set whole page busy until getTasks complete
                    null,
                    employeeService.getAllEmployees().success(function (data) {
                        vm.gridOptions.data = data.employees;
                    })
                );
        };

        function editSelectedRow () {
            vm.employee = vm.selectedRowEntity;
        }

        function updateEmployee () {
            abp.ui.setBusy(
                    null,
                    employeeService.updateEmployee(
                        vm.employee
                    ).success(function () {
                        abp.notify.info(abp.utils.formatString(localize("EmployeeUpdatedMessage"), vm.employee.fullName));
                        activate();
                    })
                );
        };        

        function saveEmployee () {
            if (vm.employee.id != 0) {
                vm.updateEmployee();
            }
            else {
                vm.addNewEmployee();
            }
        }

        activate();

        function activate() {
            vm.disableEdit = true;
            vm.employee = {
                id: 0,
                fullName: '',
                mothersName: '',
                permanentAddress: '',
                presentAddress: '',
                nationalId: '',
                companyId:'',
                contactNumber: '',
                department: '',
                designation: '',
                creatorUserId: appSession.user.id
            };
            

            vm.getEmployees();
        }
    }
})();