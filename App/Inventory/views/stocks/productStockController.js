(function () {
    'use strict';

    angular
        .module('inventory')
        .controller('productStockController', productStockController);

    productStockController.$inject = ['$scope', '$location', 'appSession', '$state', '$stateParams', 'abp.services.app.product', 'abp.services.sales.sale',
        'abp.services.app.warehouse', 'stockTypeFactory', 'abp.services.inventory.stock'];

    function productStockController($scope, $location, appSession, $state, $stateParams, productService, salesService, warehouseService, stockTypeFactory, stockService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Product Current Stock';

        var localize = abp.localization.getSource('SPMS');

        vm.getWareHouses = getWareHouses;
        vm.getAllProducts = getAllProducts;
        vm.displayProductStock = displayProductStock;
        //vm.getProductCurrentStock = getProductCurrentStock;

        vm.gridOptions = {
            enableSorting: true,
            enableRowSelection: true,
            showSelectionCheckbox: true,
            enableSelectAll: false,
            multiSelect: false,
            enableCellEdit: false,
            columnDefs: [
              { name: 'Sl', field: 'sl' },
              { name: 'ProductName', field: 'fullProductName' },
              { name: 'Warehouse', field: 'warehouseName' },
              { name: 'StockType', field: 'stockType' },
              { name: 'CurrentStock', field: 'totalQuantity' }
            ],
            onRegisterApi: function (gridApi) {
                vm.myGridApi = gridApi;
                vm.myGridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    vm.disableEdit = false;
                    vm.selectedRowEntity = angular.copy(row.entity);
                });
            }
        };

        function getWareHouses() {
            abp.ui.setBusy(
                    null,
                    warehouseService.getAllWarehouses().success(function (data) {
                        vm.wareHouses = data.warehouses;
                    })
                );
        };

        function getAllProducts() {
            abp.ui.setBusy(
                    null,
                    productService.getAllProducts().success(function (data) {
                        vm.products = data.products;
                    })
                );
        };

        function displayProductStock() {
            var avaibleStockInput = {
                productId: vm.selectedProduct.id,
                warehouseId: vm.selectedWareHouse.id,
                //stockType: Enums.StockType.GOOD
                stockType: vm.selectedStockType.id
            };
            //vm.productStock.fullProductName = vm.selectedProduct.id;
            //vm.productStock.warehouse = vm.selectedWareHouse.id;
            //vm.productStock.stockType = vm.selectedStockType.id
            abp.ui.setBusy(
                null,
                stockService.getAvaibleStockByProduct(avaibleStockInput).success(function (data) {
                    //item.currentStock = data.availableQuantity;
                    vm.productStock.currentStock = data.availableQuantity;
                    //vm.gridOptions.data = vm.productStock;
                })
            );
        };

        vm.getProductCurrentStock = function () {
            abp.ui.setBusy(
                    null,
                    stockService.getAllProductsCurrentStock().success(function (data) {
                        vm.gridOptions.data = data.productsCurrentStock;
                    })
                );
        };


        activate();

        function activate() {
            vm.disableEdit = true;

            vm.productStock = {};

            vm.wareHouses = {};
            vm.selectedWareHouse = {
                id: ''
            };

            vm.products = {};
            vm.selectedProduct = {
                id: ''
            };

            vm.stockTypes = stockTypeFactory.getData();
            vm.selectedStockType = {
                id: ''
            };

            vm.getWareHouses();
            vm.getAllProducts();
            vm.getProductCurrentStock();

        }
    }
})();