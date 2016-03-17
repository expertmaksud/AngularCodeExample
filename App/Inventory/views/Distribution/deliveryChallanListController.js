(function () {
    'use strict';

    angular
        .module('inventory')
        .controller('deliveryChallanListController', deliveryChallanListController);

    deliveryChallanListController.$inject = ['$scope', '$location', 'abp.services.inventory.distribution'];

    function deliveryChallanListController($scope, $location, distributionService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Delivery Challan List';

        vm.details = details;
        vm.getDOByUser = getDOByUser;

        vm.gridOptions = {
            enableSorting: true,
            enableRowSelection: true,
            showSelectionCheckbox: true,
            enableSelectAll: false,
            multiSelect: false,
            enableCellEdit: false,
            columnDefs: [
              { name: 'Id', field: 'id', visible: false },
              { name: 'Sl', field: 'sl' },
              { name: 'MtnNumber', field: 'mtnNumber' },
              { name: 'ChalanNumber', field: 'dCNumber' },
              { name: 'DriverName', field: 'driverName' },
              { name: 'DriverAddress', field: 'driverContactAddress' },
              { name: 'DriverPhone', field: 'driverContactPhone' },
              { name: 'TransportCompany', field: 'TransportCompanyName' },
              { name: 'VehicleNumber', field: 'vehicleNumber' }
            ],
            onRegisterApi: function (gridApi) {
                vm.myGridApi = gridApi;
                vm.myGridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    vm.disableEdit = false;
                    vm.selectedRowEntity = angular.copy(row.entity);
                });
            }
        };

        function getDOByUser() {
            distributionService.getCurrentUserDC().success(function (data) {
                angular.forEach(data.distributions, function (item, key) {
                    data.distributions[key].sl = key + 1;
                });
                vm.gridOptions.data = data.distributions;

            });

        }

        function details() {
            var rowId = angular.copy(vm.selectedRowEntity.id);
            vm.disableEdit = true;
            $location.path('/chalan/' + rowId);
        };

        activate();

        function activate() {
            vm.disableEdit = true;
            vm.getDOByUser();
        }
    }
})();
