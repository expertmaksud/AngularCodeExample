(function () {
    'use strict';

    angular
        .module('inventory')
        .controller('confirmDistributionController', confirmDistributionController);

    confirmDistributionController.$inject = ['$scope', '$location', 'appSession', '$state', '$stateParams', 'abp.services.app.finishProduct', 'abp.services.sales.salesDetail',
    'abp.services.app.warehouse', 'abp.services.inventory.distribution'];

    function confirmDistributionController($scope, $location, appSession, $state, $stateParams, finishProductService, salesDetailService, warehouseService, distributionService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Confirm Product Distribution';

        //vm.getConfirmFinishProductById = getConfirmFinishProductById;
        vm.createProductDistribution = createProductDistribution;
        vm.getDistributionProductDetailsByWarehouseId = getDistributionProductDetailsByWarehouseId;
        vm.getWareHouses = getWareHouses;

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
              { name: 'SalesId', field: 'saleId', visible: false },
              { name: 'SalesDetailsId', field: 'id', visible: false },
              { name: 'ProductId', field: 'productId', visible: false },
              { name: 'ProductName', field: 'fullProductName' },
              { name: 'Quantity', field: 'quantity' },
              { name: 'Unit', field: 'productUnitName' },
              { name: 'Amount(Tk)', field: 'amount' }
            ],
            onRegisterApi: function (gridApi) {
                vm.myGridApi = gridApi;
                vm.myGridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    vm.disableEdit = false;
                    vm.selectedRowEntity = angular.copy(row.entity);
                });
            }
        };

        function createProductDistribution() {
            vm.confirmProductDistribution.saleId = $stateParams.id;
            vm.confirmProductDistribution.mtnNumber = "MNT";
            vm.confirmProductDistribution.distributionItems = vm.saleItems;

            abp.ui.setBusy(
                   null,
                   distributionService.createDistribution(
                       vm.confirmProductDistribution
                   ).success(function (data) {
                       debugger
                       var input = {
                           saleId: $stateParams.id,
                           distributionId : data,
                       };
                       distributionService.addToInvoice(input).success(function () { });
                       abp.notify.info(abp.utils.formatString("Distributed Successfully."));
                       $location.path('/chalan/' + data);
                   })
               );
        };

        //function getConfirmFinishProductById(id) {
        //    var data = {
        //        Id: id
        //    };
        //    abp.ui.setBusy(
        //            null,
        //            finishProductProductionService.getFinishProductProductionById(data).success(function (data) {
        //                vm.confirmFinishProduct = data.finishProductProduction;
        //                //vm.confirmFinishProduct.finishProductQuantity = data.finishProductProduction.finishProductQuantity;
        //            })
        //        );
        //};

        function getDistributionProductDetailsByWarehouseId() {

            var data = {
                warehouseId: vm.selectedWareHouse.id,
                saleId: $stateParams.id
            };
            abp.ui.setBusy(
                    null,
                    salesDetailService.getSaleItemsBySaleAndWarehouseId(data).success(function (data) {
                        vm.saleItems = data.saleItems;
                        angular.forEach(data.saleItems, function (item, key) {
                            data.saleItems[key].sl = key + 1;
                        });
                        vm.gridOptions.data = data.saleItems;
                    })
                );
        };

        function getWareHouses() {
            abp.ui.setBusy(
                    null,
                    warehouseService.getAllWarehouses().success(function (data) {
                        vm.wareHouses = data.warehouses;
                        vm.selectedWareHouse.id = appSession.userWarehouse.warehouseId;
                        getDistributionProductDetailsByWarehouseId();
                    })
                );
        };

        activate();

        function activate() {
            vm.disableEdit = true;

            vm.confirmProductDistribution = {
                id: 0,
                saleId: '',
                mtnNumber: '',
                driverName: '',
                driverContactAddress: '',
                transportCompanyName: '',
                vehicleNumber: '',
                creatorUserId: appSession.user.id
            };
            vm.saleItems = {};
            vm.wareHouses = {};
            vm.selectedWareHouse = {
                id: ''
            };

            vm.getWareHouses();

        }
    }
})();