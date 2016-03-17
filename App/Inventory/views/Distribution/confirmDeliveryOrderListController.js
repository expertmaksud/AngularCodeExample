(function () {
    'use strict';

    angular
        .module('inventory')
        .controller('confirmDeliveryOrderListController', confirmDeliveryOrderListController);

    confirmDeliveryOrderListController.$inject = ['$scope', '$location', 'appSession', '$state', '$stateParams', 'abp.services.app.finishProduct', 'abp.services.sales.sale'];

    function confirmDeliveryOrderListController($scope, $location, appSession, $state, $stateParams, finishProductService, salesService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Confirm Delivery Order List for Distribution';

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
              { name: 'Sl', field: 'sl' },
              { name: 'SalesRequisitionId', field: 'salesRequisitionId', visible: false },
              { name: 'DistributorId', field: 'distributorId', visible: false },
              { name: 'SalesRequisitionId', field: 'salesRequisitionId', visible: false },
              { name: 'PaymentMode', field: 'paymentMode', visible: false },
              { name: 'Distributor', field: 'distributorName' },
              { name: 'paymentMode', field: 'paymentModeName' },
              { name: 'CreditDays', field: 'creditDays' },
              { name: 'Remarks', field: 'remarks' }
            ],
            onRegisterApi: function (gridApi) {
                vm.myGridApi = gridApi;
                vm.myGridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    vm.disableEdit = false;
                    vm.selectedRowEntity = angular.copy(row.entity);
                });
            }
        };

        vm.getProductDistributionList = function () {
            var input = {
                warehouseId: appSession.userWarehouse.warehouseId
            };
            abp.ui.setBusy(
                    null,
                    salesService.getAllSalesForDistribution(input).success(function (data) {
                        angular.forEach(data.saleDistributions, function (item, key) {
                            data.saleDistributions[key].sl = key + 1;
                        });
                        vm.gridOptions.data = data.saleDistributions;

                    })
                );
        };

        vm.editSelectedRow = function () {

            var rowId = angular.copy(vm.selectedRowEntity.id);
            vm.disableEdit = true;
            $location.path('/productdistribution/confirm/' + rowId);
        }

        activate();

        function activate() {
            if (appSession.userWarehouse === null) {
                abp.notify.error("Ask admin to set a wahrehouse for you.", "No WareHouse set");
                $location.path('/');
            }
            vm.disableEdit = true;

            vm.getProductDistributionList();

        }
    }
})();