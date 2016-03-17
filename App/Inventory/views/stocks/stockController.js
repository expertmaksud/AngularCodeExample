(function () {
    'use strict';

    angular
        .module('inventory')
        .controller('stockController', stockController);

    stockController.$inject = ['$scope', '$location', '$filter', '$state', '$stateParams', 'appSession', 'abp.services.procurement.purchase', 'abp.services.procurement.purchaseItem',
        'purchaseTypeFactory', 'purchaseTypeFilter', 'abp.services.app.warehouse', 'stockTypeFactory', 'abp.services.inventory.stock', 'ENUMS', 'abp.services.app.userWarehouse'];

    function stockController($scope, $location, $filter, $state, $stateParams, appSession, purchaseService, purchaseItemService,
        purchaseTypeFactory, purchaseTypeFilter, warehouseService, stockTypeFactory, stockService, Enums, userWarehouseService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'stockController';
        vm.getPurchases = getPurchases;
        vm.getAllPurchaseItems = getAllPurchaseItems;
        vm.getPurchaseById = getPurchaseById;
        vm.getWareHouses = getWareHouses;
        vm.receiveProduct = receiveProduct;
        vm.save = save;
        vm.addToStock = addToStock;
        vm.itemSelectionChange = itemSelectionChange;
        vm.getStocksByPurchaseId = getStocksByPurchaseId;
        vm.stockDetails = stockDetails;
        vm.getUserWarehouse = getUserWarehouse;
        vm.checkPermission = checkPermission;

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
              { name: 'SL#', field: 'id', visible: false },
              { name: 'Type', field: 'purchaseType', cellFilter: 'purchaseType' },
              { name: 'LcNumber', field: 'lcNumber' },
              { name: 'LcDate', field: 'lcDate', type: 'date', cellFilter: 'date:"dd-MMM-yyyy "' },
              { name: 'PoNumber', field: 'poNumber' },
              { name: 'PoDate', field: 'poDate', type: 'date', cellFilter: 'date:"dd-MMM-yyyy "' },
              { name: 'Etd', field: 'etd', type: 'date', cellFilter: 'date:"dd-MMM-yyyy "' },
              { name: 'Eta', field: 'eta', type: 'date', cellFilter: 'date:"dd-MMM-yyyy "' },
              { name: 'Vendor', field: 'vendorName' },
              { name: 'Status', field: 'status', visible: false },
              { name: 'Remarks', field: 'remarks', visible: false }
            ],
            onRegisterApi: function (gridApi) {
                vm.myGridApi = gridApi;
                vm.myGridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    vm.disableEdit = false;
                    vm.selectedRowEntity = angular.copy(row.entity);
                });
            }
        };

        vm.itemGridOptions = {
            enableSorting: true,
            enableRowSelection: false,
            showSelectionCheckbox: false,
            enableSelectAll: false,
            multiSelect: false,
            enableCellEdit: false,
            showGridFooter: true,
            showColumnFooter: true,
            enableFiltering: false,
            enableFiltering: true,
            enableColumnResizing: true,
            showGridFooter: true,
            showColumnFooter: true,
            columnDefs: [
              { name: 'ItemId', field: 'id' },
              { name: 'PurchaseItemId', field: 'purchaseItemId', visible: false },
              { name: 'ProductType', field: 'productType', visible: false },
              { name: 'ProductId', field: 'productId', visible: false },
              { name: 'PurchaseProductUnitId', field: 'purchaseProductUnitId', visible: false },
              { name: 'ProductUnitId', field: 'productUnitId', visible: false },
              { name: 'FullProductName', field: 'fullProductName' },
              { name: 'PurchaseQuantity', field: 'purchaseQuantity' },
              { name: 'AvailableQuantiy', field: 'availableQuantiy' }

            ]
            /*onRegisterApi: function (gridApi) {
                vm.myGridApi = gridApi;
                vm.myGridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    vm.disableEdit = false;
                    vm.selectedRowEntity = angular.copy(row.entity);
                });
            }*/
        };

        vm.stockGridOptions = {
            enableSorting: true,
            enableRowSelection: true,
            showSelectionCheckbox: false,
            enableSelectAll: false,
            multiSelect: false,
            enableCellEdit: false,
            enableFiltering: true,
            enableColumnResizing: true,
            showGridFooter: true,
            showColumnFooter: true,
            columnDefs: [
              { name: 'SL#', field: 'id', visible: false },
              { name: 'PurchaseItemId', field: 'PurchaseItemId', visible: false },
              { name: 'WarehouseId', field: 'WarehouseId', visible: false },
              { name: 'ProductUnitId', field: 'productUnitId', visible: false },
              { name: 'ProductName', field: 'fullProductName' },
              { name: 'Warehouse', field: 'warehouseName' },
              { name: 'ReceiveQuantity', field: 'receiveQuantity' },
              { name: 'Density', field: 'density' },
              { name: 'TotalQuantity', field: 'totalQuantity' },
              { name: 'QuantityIn', field: 'productUnitName' },
              { name: 'BinType', field: 'stockType' },
              { name: 'BatchNumber', field: 'batchNumber' },
              { name: 'ReceiveDate', field: 'receiveDate', type: 'date', cellFilter: 'date:"dd-MMM-yyyy "' }
            ],
            onRegisterApi: function (gridApi) {
                vm.myGridApi = gridApi;
                vm.myGridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    vm.disableEdit = false;
                    vm.selectedRowEntity = angular.copy(row.entity);
                });
            }
        };

        function getPurchases() {
            abp.ui.setBusy(
                    null,
                    purchaseService.getOpenPurchases().success(function (data) {
                        vm.gridOptions.data = data.purchases;
                    })
                );
        };

        function getAllPurchaseItems() {
            var input = {
                purchaseId: $stateParams.id
            };
            abp.ui.setBusy(
                 null,
                 stockService.getPurchaseItems(input).success(function (data) {
                     vm.purchaseItems = data.purchaseItemStock;
                     vm.itemGridOptions.data = vm.purchaseItems;

                     var sumAvailabeQuantity = 0;
                     angular.forEach(vm.purchaseItems, function (v, k) {
                         sumAvailabeQuantity = sumAvailabeQuantity + (parseFloat(v['availableQuantiy']));
                     });

                     if (sumAvailabeQuantity === 0) {
                         //close the purchase to store in stock
                         var purchase = {
                             id: $stateParams.id
                         };
                         purchaseService.closePurchase(purchase).success(function (data) {
                         })
                     }
                     vm.disableEdit = true;
                 })
             );
        };

        function getPurchaseById(id) {
            var data = {
                id: id
            };
            abp.ui.setBusy(
                    null,
                    purchaseService.getPurchaseById(data).success(function (data) {
                        vm.purchase = data.purchase;
                    })
                );
        };

        function receiveProduct() {
            if (appSession.userWarehouse === null) {
                abp.notify.error("Ask admin to set a wahrehouse for you.", "No WareHouse set");

            } else {
                var purchesId = angular.copy(vm.selectedRowEntity.id);
                vm.disableEdit = true;
                $location.path('/stock/add/' + purchesId);
            }
            //vm.checkPermission();
        };

        function checkPermission() {
            var input = {
                userId: appSession.user.id
            };

            abp.ui.setBusy(
                 null,
                 userWarehouseService.getUserWarehouseByUser(input).success(function (data) {
                     vm.userWarehouse = data.userWarehouse;
                     if (vm.userWarehouse != null) {
                         var purchesId = angular.copy(vm.selectedRowEntity.id);
                         vm.disableEdit = true;
                         $location.path('/stock/add/' + purchesId);
                     } else {
                         abp.notify.info('You are not permitted to perform this operation.', 'No Warehouse Set');

                     }
                 })
             );
        }
        function getWareHouses() {
            abp.ui.setBusy(
                    null,
                    warehouseService.getAllWarehouses().success(function (data) {
                        vm.wareHouses = data.warehouses;
                        vm.getUserWarehouse();
                    })
                );
        };

        function getUserWarehouse() {
            var input = {
                userId: appSession.user.id
            };

            abp.ui.setBusy(
                 null,
                 userWarehouseService.getUserWarehouseByUser(input).success(function (data) {
                     vm.userWarehouse = data.userWarehouse;
                     vm.selectedWareHouse.id = vm.userWarehouse.warehouseId;

                 })
             );
        }

        function addToStock() {
            //vm.purchaseItem[0] is select item

            if (vm.purchaseItem[0].availableQuantiy <= 0) {
                abp.notify.info('There is no available product to add in stock ', 'No Product');
                return;
            } else if (vm.purchaseItem[0].availableQuantiy < vm.stock.receiveQuantity) {
                abp.notify.info('You try to store more product than avaiable product.', 'No Product');
                return;
            }

            var data = {
                PurchaseItemId: vm.selectedItem.id
            };
            abp.ui.setBusy(
                   null,
                   stockService.getStocksByPurchaseItem(data).success(function (data) {
                       var stocks = data.stocks;
                       //Check from DB again before store to stock
                       var sumStockedQuantity = 0;
                       angular.forEach(stocks, function (v, k) {
                           sumStockedQuantity = sumStockedQuantity + (parseFloat(v['receiveQuantity']));
                       });
                       var availabeStock = parseFloat(vm.purchaseItem[0].purchaseQuantity) - sumStockedQuantity;

                       if (availabeStock >= vm.stock.receiveQuantity) {
                           vm.stock.warehouseId = vm.selectedWareHouse.id;
                           vm.stock.purchaseItemId = vm.selectedItem.id;
                           vm.stock.stockType = vm.selectedStockType.id;
                           vm.stock.productType = vm.purchaseItem[0].productType;
                           vm.stock.productId = vm.purchaseItem[0].productId;
                           vm.stock.operationType = Enums.StockOperationType.STOCKIN;
                           vm.stock.fromProductUnitId = vm.purchaseItem[0].purchaseProductUnitId;
                           vm.stock.productUnitId = vm.purchaseItem[0].productUnitId;

                           stockService.addToStock(vm.stock).success(function () {
                               abp.notify.info(abp.utils.formatString(localize("StockCreateMessage"), vm.purchaseItem[0].fullProductName));

                               vm.stock = {};
                               vm.itemSelectionChange();
                               vm.getAllPurchaseItems();
                           })
                       } else {
                           abp.notify.info('You try to store more product than avaiable product.', 'No Available Product');
                           return;
                       }
                   })

               );
        };

        function save() {
            vm.addToStock();
        };

        function itemSelectionChange() {
            if (vm.selectedItem === undefined) {
                vm.disableDensity = true;
                return;
            }
            var expression = {
                id: vm.selectedItem.id
            };
            vm.purchaseItem = $filter('filter')(vm.purchaseItems, expression);


            if (vm.purchaseItem[0].productType === parseInt(Enums.ProductTypes.RAWMATERIAL)) {
                vm.disableDensity = false;
                vm.stock.productUnitId = Enums.QuantityUnit.Litter;
            } else {
                vm.disableDensity = true;

                vm.stock.density = '';
                vm.stock.productUnitId = Enums.QuantityUnit.Unit;
            }
        };

        function getStocksByPurchaseId(purchaseId) {
            var input = {
                purchaseId: purchaseId
            };
            abp.ui.setBusy(
                 null,
                 stockService.getStocksByPurchase(input).success(function (data) {
                     vm.stocks = data.stocks;
                     vm.stockGridOptions.data = vm.stocks;
                 })
             );
        };

        function stockDetails() {
            var purchesId = angular.copy(vm.selectedRowEntity.id);
            vm.disableEdit = true;
            $location.path('/stock/details/' + purchesId);
        };

        activate();

        function activate() {
            vm.purchase = {
                id: 0,
                purchaseType: '',
                lcNumber: '',
                lcDate: new Date(),
                poNumber: '',
                poDate: new Date(),
                etd: new Date(),
                eta: new Date(),
                vendorId: '',
                remarks: ''
            };

            vm.purchaseItems = {};
            vm.purchaseItem = {
                id: 0,
                purchaseId: '',
                productType: '',
                productId: '',
                rawMaterialTypeCode: '',
                fullProductName: '',
                purchaseQuantity: 0,
                stockQuantiy: 0,
                purchaseProductUnitId: 0,
                productUnitId: 0,
                availableQuantiy: 0
            };
            vm.selectedItem = {
                id: ''
            };

            vm.wareHouses = {};
            vm.selectedWareHouse = {
                id: ''
            };

            vm.stocks = {};
            vm.stock = {
                id: '',
                warehouseId: '',
                purchaseItemId: '',
                productType: '',
                productId: '',
                receiveQuantity: '',
                density: '',
                totalQuantity: '',
                productUnitName: '',
                productUnitId: '',
                fromProductUnitId: '',
                stockType: '',
                operationType: '',
                batchNumber: '',
                receiveDate: ''
            };

            stockTypeFactory.getData().success(function (data) {
                vm.stockTypes = data.stockBins;
            });
            vm.selectedStockType = {
                id: ''
            };


            vm.disableEdit = true;
            vm.disableDensity = true;

            if ($state.current.data != undefined) {
                if ($state.current.data.action === 'add') {
                    vm.getPurchaseById($stateParams.id);
                    vm.getAllPurchaseItems();
                    vm.getWareHouses();
                }
                else if ($state.current.data.action === 'details') {
                    vm.getStocksByPurchaseId($stateParams.id);
                }
            } else {
                vm.getPurchases();
            }
        }
    }
})();