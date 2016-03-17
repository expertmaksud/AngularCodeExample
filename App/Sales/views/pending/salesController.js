(function () {
    'use strict';

    angular
        .module('sales')
        .controller('salesController', salesController);

    salesController.$inject = ['$scope', '$filter', '$location', '$state', '$stateParams', 'appSession', 'abp.services.sales.salesRequisition', 'abp.services.sales.salesRequisitionDetail',
        'abp.services.app.distributor', 'abp.services.app.rawMaterial', 'uiGridConstants', 'productTypeFactory', 'abp.services.app.finishProduct', 'productTypeFilter',
        'abp.services.app.warehouse', 'abp.services.sales.sale', 'abp.services.app.brand', 'ENUMS', 'abp.services.inventory.stock', 'abp.services.app.stockBin'
    ];

    function salesController($scope, $filter, $location, $state, $stateParams, appSession, salesRequisitionService, salesRequisitionItemsService,
        distributorService, rawMaterialService, uiGridConstants, productTypeFactory, finishProductService, productTypeFilter, warehouseService, salesService,
        brandService, Enums, stockService, stockBinService) {
        var vm = this;
        vm.title = 'Approve Sales Requisition';
        var localize = abp.localization.getSource('SPMS');

        vm.loadFinishProduct = loadFinishProduct;
        vm.getBrands = getBrands;
        vm.editSelectedRow = editSelectedRow;
        vm.getAvailableProductByWarehose = getAvailableProductByWarehose;
        vm.wareHouseChange = wareHouseChange;
        vm.itemChange = itemChange;
        vm.getBinTypes = getBinTypes;

        vm.getDitributors = function () {
            abp.ui.setBusy(
                    null,
                    distributorService.getAllDistributors().success(function (data) {
                        vm.distributors = data.distributors;
                    })
                );
        };


        vm.gridOptions = {
            enableSorting: true,
            enableRowSelection: true,
            showSelectionCheckbox: true,
            enableSelectAll: false,
            multiSelect: false,
            enableCellEdit: false,
            showGridFooter: true,
            showColumnFooter: true,
            enableFiltering: true,
            columnDefs: [
              { name: 'SL#', field: 'sl' },
              { name: 'id', field: 'id', visible: false },
              { name: 'salesRequisitionId', field: 'salesRequisitionId', visible: false },
              { name: 'ProductId', field: 'productId', visible: false },
              { name: 'ProductType', field: 'productType', cellFilter: 'productType' },
              { name: 'FullProductName', field: 'fullProductName' },
              { name: 'SalesQuantity', field: 'quantity' },
              { name: 'UnitPrice', field: 'unitPrice', cellFilter: 'currency:"Tk. "' },
              {
                  name: 'Amount', field: 'amount', cellFilter: 'currency:"Tk. "', aggregationType: uiGridConstants.aggregationTypes.sum,
                  footerCellFilter: 'currency:"Tk. "'
              }

            ],
            onRegisterApi: function (gridApi) {
                vm.myGridApi = gridApi;
                vm.myGridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    vm.disableEdit = false;
                    vm.selectedRowEntity = angular.copy(row.entity);
                });
            }
        };

        vm.isWareHouseSelected = function () {
            var isSelected = true;
            angular.forEach(vm.salesItems, function (item, key) {
                if (typeof item.warehouseId === "undefined") {
                    abp.notify.info("Please select a warehouse for " + item.fullProductName);
                    isSelected = false;
                }
            });

            return isSelected;
        }

        vm.approveSalesRequisition = function () {
            if (!vm.isWareHouseSelected()) {
                return;
            }
            vm.sales.salesDetailsItems = vm.salesItems;
            vm.sales.salesRequisitionId = vm.sales.id;
            vm.sales.approvalRequireBySeniorManagement = false;
            angular.forEach(vm.salesItems, function (item, key) {
                if (parseInt(vm.salesItems[key].productType) === parseInt(Enums.ProductTypes.RAWMATERIAL)) {
                    vm.sales.approvalRequireBySeniorManagement = true;
                }

            });
            abp.ui.setBusy(
                              null,
                              salesService.createSale(vm.sales).success(function (data) {
                                  abp.notify.info(abp.utils.formatString(localize("SalesRequisitionApprovalMessage"), vm.sales.id));
                                  $location.path('/sales/pending/requisitions');
                              })
                          );

        }
        vm.addNewSales = function () {
            vm.sales.salesRequisitionItems = vm.salesItems;
            vm.sales.distributorId = vm.selectedDistributor.id;
            abp.ui.setBusy(
                    null,
                    salesRequisitionService.createSalesRequisition(
                        vm.sales
                    ).success(function () {
                        abp.notify.info(abp.utils.formatString(localize("CreateSalesRequisitions")));
                        $location.path('/sales/requisitionlist');
                    })
                );
        };

        vm.getAllSalesItems = function () {
            var input = {
                id: $stateParams.id,
            };
            abp.ui.setBusy(
                    null,
                    salesRequisitionService.getSalesRequisitionById(input).success(function (data) {
                        vm.productsList = data.salesRequisitionItems;

                    })
                );

        };

        function editSelectedRow(index) {

            vm.salesItem = vm.salesItems[index];
            vm.salesItem.amount = vm.salesItem.quantity * vm.salesItem.unitPrice;
            vm.selectedProductType.id = vm.salesItem.productType;
            vm.selectedProductType.name = vm.salesItem.productTypeName;

            vm.selectedItemIndex = index;
            vm.loadItems();

            if (parseInt(vm.salesItem.productType) === parseInt(Enums.ProductTypes.FINISHPRODUCT)) {
                vm.selectedBrand.id = vm.salesItem.brandId;
                vm.loadFinishProduct();
            }

            vm.selectedItem.id = vm.salesItem.productId;
            vm.selectedItem.fullProductName = vm.salesItem.fullProductName;
            if (typeof vm.salesItem.warehouseId !== "undefined") {
                vm.selectedWarehouse.id = vm.salesItem.warehouseId;
                vm.selectedWarehouse.warehouseName = vm.salesItem.warehouseName;
                vm.wareHouseChange();

            }

        };
        vm.addNewItem = function () {

            vm.salesItem.fullProductName = vm.selectedItem.fullProductName;
            vm.salesItems.push({
                'productTypeName': vm.selectedProductType.name,
                'productTypeId': vm.selectedProductType.id,
                'fullProductName': vm.salesItem.fullProductName,
                'productId': vm.selectedItem.id,
                'quantity': vm.salesItem.quantity,
                'unitPrice': vm.salesItem.unitPrice,
                'warehouseId': vm.selectedWarehouse.id,
                'warehouseName': vm.selectedWarehouse.warehouseName
            });
            vm.resetItem();

        };

        vm.updateItem = function () {
            vm.salesItem.productType = vm.selectedProductType.id;
            vm.salesItem.productTypeName = vm.selectedProductType.name;
            vm.salesItem.productId = vm.selectedItem.id;
            vm.salesItem.fullProductName = vm.selectedItem.fullProductName;
            vm.salesItem.warehouseId = vm.selectedWarehouse.id;
            vm.salesItem.warehouseName = vm.selectedWarehouse.warehouseName;
            vm.salesItems[vm.selectedItemIndex] = vm.salesItem;
            vm.resetItem();

        };
        vm.saveItem = function () {
            if (!isValid()) {
                return;
            }
            if (vm.selectedItemIndex === '') {
                vm.salesItem.salesRequisitionId = $stateParams.id;
                vm.addNewItem();

            }
            else {
                vm.updateItem();
            }
        };

        vm.deleteItem = function (index) {
            vm.salesItems.splice(index, 1);
        }
        vm.resetItem = function () {
            vm.salesItem = {
                id: 0,
                salesRequisitionId: '',
                productType: '',
                productId: '',
                brandId: '',
                fullProductName: '',
                warehouseId: '',
                availableQuantity: 0,
                quantity: 0,
                unitPrice: 0,
                amount: 0
            };
            vm.selectedItem.id = '';
            vm.selectedProductType.id = '';
            vm.selectedWarehouse = {};
            vm.selectedItemIndex = '';
            vm.selectedBrand.id = '';
        };

        function isValid() {
            debugger
            var isValid = true;
            if (vm.salesItem.quantity > vm.salesItem.availableQuantity) {
                isValid = false;
                abp.notify.info("Quantity can't be more than available quantity.");

            } else if (vm.salesItem.availableQuantity == 0) {
                isValid = false;
                abp.notify.info("This product is not availabe in that warehoue.");
            } else {
                if (parseInt(vm.selectedProductType.id) === parseInt(Enums.ProductTypes.FINISHPRODUCT)) {
                    angular.forEach(vm.salesItems, function (item, key) {
                        if (parseInt(item.productType) === parseInt(Enums.ProductTypes.FINISHPRODUCT)) {
                            if (item.brandId != vm.selectedBrand.id) {
                                isValid = false;
                                abp.notify.info("Finish Product from different Brand Type can't be added.");
                                return isValid;
                            }
                        }
                    })
                }
            }
            return isValid;
        }

        vm.getRawMaterials = function () {
            abp.ui.setBusy(
                    null,
                    rawMaterialService.getAllRawMaterials().success(function (data) {
                        vm.selectedItems = data.rawMaterials;
                        vm.selectedItem.id = vm.salesItem.productId;
                    })
                );
        };

        vm.getFinishProducts = function () {
            var input = {
                brandId: vm.selectedBrand.id
            }
            abp.ui.setBusy(
                    null,
                    finishProductService.getFinishProductsByBrand(input).success(function (data) {
                        vm.selectedItems = data.finishProducts;
                        vm.selectedItem.id = vm.salesItem.productId;
                    })
                );
        };
        vm.setAmount = function () {
            if (vm.salesItem.quantity != '' & vm.salesItem.unitPrice != '') {
                vm.salesItem.amount = vm.salesItem.quantity * vm.salesItem.unitPrice;
            }
        };

        vm.getSalesById = function (id) {
            var input = {
                id: $stateParams.id,
            };
            abp.ui.setBusy(
                    null,
                    salesRequisitionService.getSalesRequisitionById(input).success(function (data) {
                        vm.sales = data.salesRequisition;
                        vm.selectedDistributor.id = vm.sales.distributorId;
                        vm.selectedpaymentMode = vm.sales.paymentMode.toString();
                        vm.salesItems = data.salesRequisitionItems;
                        angular.forEach(vm.salesItems, function (item, key) {
                            vm.salesItems[key].productTypeName = vm.productTypes[item.productType].name;
                        });
                    })
                );
        };
        vm.getWireHouse = function () {
            abp.ui.setBusy(
                    null,
                    warehouseService.getAllWarehouses().success(function (data) {
                        vm.warehouses = data.warehouses;
                    })
                );
        }


        vm.loadItems = function () {

            vm.displayBrand = false;
            vm.selectedItems = {};
            vm.selectedItem = {
                id: ''
            };

            if (parseInt(vm.selectedProductType.id) === parseInt(Enums.ProductTypes.RAWMATERIAL)) {
                vm.getRawMaterials();
            } else if (parseInt(vm.selectedProductType.id) === parseInt(Enums.ProductTypes.FINISHPRODUCT)) {
                vm.displayBrand = true;
            }

        };

        function loadFinishProduct() {
            vm.selectedItems = {};
            vm.selectedItem = {
                id: ''
            };
            vm.getFinishProducts();
        }

        function getBrands() {
            var data = {
                "brandType": 1
            };

            abp.ui.setBusy(
                    null,
                    brandService.getBrandsByBrandType(data).success(function (data) {
                        vm.brands = data.brands;
                    })
                );
        };

        function getAvailableProductByWarehose(avaibleStockInput) {

            stockService.getAvaibleStockByProduct(avaibleStockInput).success(function (data) {
                vm.salesItem.availableQuantity = data.availableQuantity;

            });
        }

        function wareHouseChange() {
            //Collect Availabe quantity form stock service
            var avaibleStockInput = {
                productType: vm.selectedProductType.id,
                productId: vm.selectedItem.id,
                warehouseId: vm.selectedWarehouse.id,
                stockType: vm.selectedStockType.id
            };

            vm.getAvailableProductByWarehose(avaibleStockInput);

        }

        function itemChange() {
            if (typeof vm.salesItem.warehouseId !== "undefined") {
                vm.wareHouseChange();
            }
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

            vm.sales = {
                id: 0,
                distributorId: '',
                paymentMode: '',
                creditDays: '',
                remarks: '',
                creatorUserId: appSession.user.id
            };
            vm.salesItem = {
                id: 0,
                salesRequisitionId: '',
                productType: '',
                productId: '',
                brandId: '',
                fullProductName: '',
                warehouseId: '',
                availableQuantity: 0,
                quantity: 0,
                unitPrice: 0,
                amount: 0
            };


            vm.selectedItems = {};
            vm.selectedItem = {
                id: ''
            };
            vm.salesItems = [];

            vm.productTypes = productTypeFactory.getData();
            vm.selectedProductType = {
                id: ''
            };

            vm.distributors = {};
            vm.selectedDistributor = {
                id: ''
            };
            vm.selectedItemIndex = '';
            vm.brands = [];
            vm.selectedBrand = {
                id: ''
            };
            vm.stockTypes = [];
            vm.selectedStockType = {
                id: ''
            };

            vm.getBinTypes();
            vm.getDitributors();
            vm.getWireHouse();
            vm.getBrands();
            //alert($state.current.data.action);
            if ($state.current.data != undefined) {
                if ($state.current.data.action === 'approve') {
                    vm.getSalesById();
                }
            }
        }
    };


})();



