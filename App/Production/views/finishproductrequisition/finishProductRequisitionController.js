(function () {
    'use strict';

    angular
        .module('production')
        .controller('finishProductRequisitionController', finishProductRequisitionController);

    finishProductRequisitionController.$inject = ['$scope', '$location', '$q', 'appSession', '$state', '$stateParams', 'abp.services.app.finishProduct', 'abp.services.production.productionRequisition',
    'abp.services.app.warehouse', 'abp.services.inventory.stock', 'ENUMS', 'abp.services.app.stockBin'];

    function finishProductRequisitionController($scope, $location, $q, appSession, $state, $stateParams, finishProductService, productionRequisitionService, warehouseService,
        stockService, Enums, stockBinService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Raw Material Requisition for Finish Product';
        vm.addNewProductRequisition = addNewProductRequisition;
        vm.getFinishProducts = getFinishProducts;
        vm.getFinishProductDetailsById = getFinishProductDetailsById;
        vm.getWareHouses = getWareHouses;
        vm.getBinTypes = getBinTypes;

        var localize = abp.localization.getSource('SPMS');

        vm.gridOptions = {
            enableSorting: true,
            enableRowSelection: true,
            showSelectionCheckbox: true,
            enableSelectAll: false,
            multiSelect: false,
            enableCellEdit: false,
            columnDefs: [
              { name: 'Id', field: 'id', visible: false },
              { name: 'RawMaterialId', field: 'rawMaterialId', visible: false },
              { name: 'FullProductName', field: 'fullProductName' },
              { name: 'Percentage', field: 'percentage' },
              { name: 'RequisitionQuantity', field: 'quantity' },
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

        function addNewProductRequisition() {

            $q.all(isProductStockAvailable()).then(function () {
                vm.productRequisition.finishProductId = vm.selectedFinishProduct.id;
                vm.productRequisition.warehouseId = vm.selectedWareHouse.id;
                vm.productRequisition.stockBinId = vm.selectedStockType.id;                  
                abp.ui.setBusy(
                       null,
                       productionRequisitionService.createProductionRequisition(
                           vm.productRequisition
                       ).success(function () {
                           abp.notify.info(abp.utils.formatString(localize("ProductionRequisitionCreatedMessage"), vm.productRequisition.finishProductQuantity));
                           $location.path('/product/requisitionlist');
                       })
                   );
            });


        };

        function getFinishProducts() {
            abp.ui.setBusy(
                    null,
                    finishProductService.getAllFinishProducts().success(function (data) {
                        vm.finishProducts = data.finishProducts;
                    })
                );
        };

        function getFinishProductDetailsById(id) {
            if (vm.selectedWareHouse === undefined || vm.selectedWareHouse.id === "") {
                abp.notify.error('Please select a warehouse.', 'Warehouse Required!!');
                vm.gridOptions.data = [];
                return;
            } else if (vm.selectedStockType === undefined || vm.selectedStockType.id === "") {
                abp.notify.error('Please select a Stock Type.', 'Stock Type Required!!');
                vm.gridOptions.data = [];
                return;
            }else if (vm.selectedFinishProduct === undefined || vm.selectedFinishProduct.id === "") {
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
                            item.quantity = (item.percentage * vm.productRequisition.finishProductQuantity * vm.finishProduct.multiplier * vm.finishProduct.packSize) / 100;

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

        function getWareHouses() {
            abp.ui.setBusy(
                    null,
                    warehouseService.getAllWarehouses().success(function (data) {
                        vm.wareHouses = data.warehouses;
                    })
                );
        };

        function getBinTypes() {
          abp.ui.setBusy(
                    null,
                    stockBinService.getAllStockBins().success(function (data) {
                        vm.stockTypes = data.stockBins;
                    })
                );
        }

        function isProductStockAvailable() {
            var requests = [];
            angular.forEach(vm.finishProductFormulaItems, function (item, key) {
                var deferred = $q.defer();


                item.quantity = (item.percentage * vm.productRequisition.finishProductQuantity * vm.finishProduct.multiplier * vm.finishProduct.packSize) / 100;

                //Collect Availabe quantity frm stock service
                var avaibleStockInput = {
                    productType: Enums.ProductTypes.RAWMATERIAL,
                    productId: item.rawMaterialId,
                    warehouseId: vm.selectedWareHouse.id,
                    stockType: vm.selectedStockType.id
                };
                stockService.getAvaibleStockByProduct(avaibleStockInput)
                    .success(function (data) {
                        item.currentStock = data.availableQuantity;

                        if (item.quantity > item.currentStock) {
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

        activate();

        function activate() {
            vm.disableEdit = true;

            vm.productRequisition = {
                id: 0,
                warehouseId: '',
                finishProductId: '',
                stockBinId:'',
                finishProductQuantity: 0,
                remarks: '',
                quantity: 0,
                currentStock: 0,
                creatorUserId: appSession.user.id
            };
            vm.wareHouses = {};
            vm.selectedWareHouse = {
                id: ''
            };

            vm.stockTypes = [];
            vm.selectedStockType = {
                id: ''
            };

            vm.finishProductFormulaItems = [];

            vm.getWareHouses();
            vm.getBinTypes();
            vm.getFinishProducts();
            
        }
    }
})();