(function () {
    'use strict';

    angular
        .module('inventory')
        .controller('confirmProductRequisitionController', confirmProductRequisitionController);

    confirmProductRequisitionController.$inject = ['$scope', '$location', '$q', 'appSession', '$state', '$stateParams', 'abp.services.app.finishProduct', 'abp.services.production.productionRequisition',
    'abp.services.app.warehouse', 'abp.services.production.approvedProductionRequisition', 'abp.services.inventory.stock', 'ENUMS', 'abp.services.app.stockBin'];

    function confirmProductRequisitionController($scope, $location, $q, appSession, $state, $stateParams, finishProductService, productionRequisitionService, warehouseService,
        approvedProductionRequisitionService, stockService, Enums, stockBinService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Raw Material Requisition for Finish Product';
        vm.newConfirmProductRequisition = newConfirmProductRequisition;
        vm.getFinishProducts = getFinishProducts;
        vm.getFinishProductDetailsById = getFinishProductDetailsById;
        vm.getWareHouses = getWareHouses;
        vm.getProductRequistionById = getProductRequistionById;
        vm.updateRawMaterialQuantity = updateRawMaterialQuantity;
        vm.getBinTypes = getBinTypes;

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
              { name: 'RawMaterialId', field: 'rawMaterialId', visible: false },
              { name: 'ProductUnitId', field: 'productUnitId', visible: false },
              { name: 'FullProductName', field: 'fullProductName' },
              { name: 'Percentage', field: 'percentage' },
              { name: 'RawMaterialQuantity', field: 'rawMaterialQuantity' },
              { name: 'CurrentStock', field: 'currentStock' }
            ],
            onRegisterApi: function (gridApi) {
                vm.myGridApi = gridApi;
                vm.myGridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    vm.disableEdit = false;
                    vm.selectedRowEntity = angular.copy(row.entity);
                });
            }
        };

        function newConfirmProductRequisition() {

            $q.all(isProductStockAvailable()).then(function () {
                vm.confirmProductRequisition.finishProductId = vm.selectedFinishProduct.id;
                vm.confirmProductRequisition.warehouseId = vm.selectedWareHouse.id;
                vm.confirmProductRequisition.stockBinId = vm.selectedStockType.id;
                vm.confirmProductRequisition.productionRequisitionId = $stateParams.id;

                vm.confirmProductRequisition.finishProductFormulaItems = vm.finishProductFormulaItems

                abp.ui.setBusy(
                       null,
                       approvedProductionRequisitionService.createApprovedProductionRequisition(
                           vm.confirmProductRequisition
                       ).success(function () {
                           abp.notify.info(abp.utils.formatString(localize("ProductionRequisitionCreatedMessage"), vm.confirmProductRequisition.finishProductQuantity));
                           $location.path('/product/openrequisitionlist');
                       })
                   );
            });
        };

        function getProductRequistionById(id) {
            var data = {
                id: id
            };
            abp.ui.setBusy(
                    null,
                    productionRequisitionService.getProductionRequisitionById(data).success(function (data) {
                        //vm.productRequisition = data.productRequisition;
                        //vm.selectedWareHouse = data.warehouseId;

                        vm.selectedWareHouse.id = data.productionRequisition.warehouseId;
                        vm.selectedFinishProduct.id = data.productionRequisition.finishProductId;
                        vm.selectedStockType.id = data.productionRequisition.stockBinId;
                        vm.confirmProductRequisition.finishProductQuantity = data.productionRequisition.finishProductQuantity;
                        vm.confirmProductRequisition.remarks = data.productionRequisition.remarks;
                        vm.getFinishProductDetailsById();
                    })
                );
        };

        function getFinishProducts() {
            abp.ui.setBusy(
                    null,
                    finishProductService.getAllFinishProducts().success(function (data) {
                        vm.finishProducts = data.finishProducts;
                    })
                );
        };

        function getFinishProductDetailsById() {
            if (vm.selectedWareHouse === undefined || vm.selectedWareHouse.id === "") {
                abp.notify.error('Please select a warehouse.', 'Warehouse Required!!');
                vm.gridOptions.data = [];
                return;
            } else if (vm.selectedFinishProduct === undefined || vm.selectedFinishProduct.id === "") {
                abp.notify.error('Please select a Finish Product.', 'Finish Product Required!!');
                vm.gridOptions.data = [];
                return;
            }
            var data = {
                id: vm.selectedFinishProduct.id
            };
            abp.ui.setBusy(
                    null,
                    finishProductService.getFinishProductDetailsById(data).success(function (data) {
                        vm.finishProduct = data.finishProduct;
                        vm.finishProductFormulaItems = data.finishProductFormulaItems;

                        angular.forEach(vm.finishProductFormulaItems, function (item, key) {
                            item.rawMaterialQuantity = (item.percentage * vm.confirmProductRequisition.finishProductQuantity * vm.finishProduct.multiplier * vm.finishProduct.packSize) / 100;

                            //vm.finishProductFormulaItems.rawMaterialQuantity = item.quantity;

                            //Collect Availabe quantity form stock service
                            var avaibleStockInput = {
                                productType: Enums.ProductTypes.RAWMATERIAL,
                                productId: item.rawMaterialId,
                                warehouseId: vm.selectedWareHouse.id,
                                stockType: vm.selectedStockType.id
                            };
                            stockService.getAvaibleStockByProduct(avaibleStockInput).success(function (data) {
                                item.currentStock = data.availableQuantity;

                            });
                        });

                        vm.gridOptions.data = vm.finishProductFormulaItems;
                    })
                );
        };

        function updateRawMaterialQuantity() {
            angular.forEach(vm.finishProductFormulaItems, function (item, key) {
                item.rawMaterialQuantity = (item.percentage * vm.confirmProductRequisition.finishProductQuantity * vm.finishProduct.multiplier * vm.finishProduct.packSize) / 100;
            });
        }

        function getWareHouses() {
            abp.ui.setBusy(
                    null,
                    warehouseService.getAllWarehouses().success(function (data) {
                        vm.wareHouses = data.warehouses;
                    })
                );
        };

        function isProductStockAvailable() {
            var requests = [];
            angular.forEach(vm.finishProductFormulaItems, function (item, key) {
                var deferred = $q.defer();


                item.rawMaterialQuantity = (item.percentage * vm.confirmProductRequisition.finishProductQuantity * vm.finishProduct.multiplier * vm.finishProduct.packSize) / 100;

                //Collect Availabe quantity from stock service to check directly from DB
                var avaibleStockInput = {
                    productType: Enums.ProductTypes.RAWMATERIAL,
                    productId: item.rawMaterialId,
                    warehouseId: vm.selectedWareHouse.id,
                    stockType: vm.selectedStockType.id
                };
                stockService.getAvaibleStockByProduct(avaibleStockInput)
                    .success(function (data) {
                        item.currentStock = data.availableQuantity;

                        if (item.rawMaterialQuantity > item.currentStock) {
                            abp.notify.error(item.fullProductName + ' Requisition Quantity is more than available stock.', "Can't Save!!");

                            deferred.reject();


                        } else {

                            deferred.resolve();
                        }

                    })
                    .error(function () {
                        deferred.reject();
                    });

                requests.push(deferred.promise);
            });

            return requests;
        }

        function getBinTypes() {
            abp.ui.setBusy(
                      null,
                      stockBinService.getAllStockBins().success(function (data) {
                          vm.stockTypes = data.stockBins;
                      })
                  );
        }

        activate();

        function activate() {
            vm.disableEdit = true;

            vm.confirmProductRequisition = {
                id: 0,
                productionRequisitionId: '',
                finishProductId: '',
                warehouseId: '',
                stockBinId:'',
                finishProductQuantity: 0,
                remarks: '',
                rawMaterialQuantity: 0,
                currentStock: 0,
                creatorUserId: appSession.user.id
            };
            vm.wareHouses = {};
            vm.selectedWareHouse = {
                id: ''
            };
            vm.selectedFinishProduct = {
                id: ''
            };

            vm.finishProductFormulaItems = [];

            vm.stockTypes = [];
            vm.selectedStockType = {
                id: ''
            };

            vm.getBinTypes();
            vm.getFinishProducts();
            vm.getWareHouses();
            vm.getProductRequistionById($stateParams.id);
        }
    }
})();