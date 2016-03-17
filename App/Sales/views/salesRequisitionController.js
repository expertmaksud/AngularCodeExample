(function () {
    'use strict';

    angular
        .module('sales')
        .controller('salesRequisitionController', salesRequisitionController);

    salesRequisitionController.$inject = ['$scope', '$filter', '$location', '$state', '$stateParams', 'appSession', 'abp.services.sales.salesRequisition', 'abp.services.sales.salesRequisitionDetail',
        'abp.services.app.distributor', 'abp.services.app.rawMaterial', 'uiGridConstants', 'productTypeFactory', 'abp.services.app.finishProduct', 'productTypeFilter', 'abp.services.app.product', 'abp.services.app.brand', 'ENUMS'
    ];

    function salesRequisitionController($scope, $filter, $location, $state, $stateParams, appSession, salesRequisitionService, salesRequisitionItemsService,
        distributorService, rawMaterialService, uiGridConstants, productTypeFactory, finishProductService, productTypeFilter, productService, brandService, Enums) {
        var vm = this;
        vm.title = 'Create Sales Requisition';
        var localize = abp.localization.getSource('SPMS');
        vm.addToGrid = addToGrid;
        vm.getDitributors = getDitributors;
        vm.loadPrice = loadPrice;
        vm.getBrands = getBrands;
        vm.loadFinishProduct = loadFinishProduct;
        vm.resetItem = resetItem;


        function getDitributors() {
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
              { name: 'BrandId', field: 'brandId', visible: false },
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

        function isValid() {
            var isValid = true;
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
            return isValid;
        }

        function addToGrid() {
            if (!isValid()) {
                return;
            }
            vm.salesItem.productType = vm.selectedProductType.id;

            vm.salesItem.productId = vm.selectedItem.id;
            vm.salesItem.brandId = vm.selectedBrand.id;
            if (typeof vm.salesItem.sl === 'undefined') {
                vm.salesItem.sl = 0;
            }
            vm.salesItem.fullProductName = vm.selectedItem.fullProductName;
            if (vm.disableEdit) {
                console.log(vm.salesItem);
                vm.salesItem.sl = parseInt(vm.salesItem.sl) + 1;
                vm.salesItems.push(angular.copy(vm.salesItem));
                vm.gridOptions.data = vm.salesItems;
            } else {
                vm.salesItems[(vm.salesItem.sl - 1)] = vm.salesItem;
                vm.gridOptions.data = vm.salesItems;
            }

            vm.salesItem = {
                sl: vm.salesItem.sl,
                salesRequisitionId: '',
                productType: '',
                rawMaterialId: '',
                finishProductId: '',
                quantity: '',
                unitPrice: ''
            };
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
                        //vm.sales = data.salesRequisition;
                        //vm.selectedDistributor.id = vm.sales.distributorId;
                        //vm.selectedpaymentMode = vm.sales.paymentMode.toString();
                        vm.salesItems = data.salesRequisitionItems;

                        angular.forEach(vm.salesItems, function (item, key) {
                            item.sl = key + 1;
                            item.amount = item.quantity * item.unitPrice;
                        });
                        vm.gridOptions.data = vm.salesItems;
                    })
                );

        };

        vm.editSelectedRow = function () {
            vm.salesItem = vm.selectedRowEntity;
            vm.selectedProductType.id = vm.salesItem.productType;
            vm.loadItems();

            if (parseInt(vm.salesItem.productType) === parseInt(Enums.ProductTypes.FINISHPRODUCT)) {
                vm.selectedBrand.id = vm.salesItem.brandId;
                vm.loadFinishProduct();
            }
            vm.selectedItem.id = vm.salesItem.productId;
        };
        vm.addNewItem = function () {
            if (!isValid()) {
                return;
            }
            vm.salesItem.productType = vm.selectedProductType.id;
            vm.salesItem.productId = vm.selectedItem.id;

            abp.ui.setBusy(
                   null,
                   salesRequisitionItemsService.createSalesRequisitionDetail(
                       vm.salesItem
                   ).success(function () {
                       abp.notify.info(abp.utils.formatString(localize("SalesItemCreatedMessage"), vm.salesItem.fullProductName));
                       vm.salesItem = {};
                       vm.getAllSalesItems();
                       vm.resetItem();
                   })
               );
        };

        vm.updateItem = function () {
            vm.salesItem.productType = vm.selectedProductType.id;
            vm.salesItem.productId = vm.selectedItem.id;
            abp.ui.setBusy(
                   null,
                   salesRequisitionItemsService.updateSalesRequisitionDetail(
                       vm.salesItem
                   ).success(function () {
                       abp.notify.info(abp.utils.formatString(localize("SalesItemUpdateMessage"), vm.salesItem.fullProductName));
                       vm.salesItem = {};
                       vm.getAllSalesItems();
                   })
               );
        };
        vm.saveItem = function () {
            if (vm.salesItem.id === 0 || vm.salesItem.id === undefined) {
                vm.salesItem.salesRequisitionId = $stateParams.id;
                vm.addNewItem();

            }
            else {
                vm.updateItem();
            }
        };

        vm.deleteItem = function () {
            var data = {
                id: vm.selectedRowEntity.id
            }
            abp.ui.setBusy(
              null,
              salesRequisitionItemsService.deleteSalesRequisitionDetail(
                 data
              ).success(function () {
                  abp.notify.info(abp.utils.formatString(localize("SalesItemDeleteMessage"), vm.selectedRowEntity.fullProductName));
                  vm.getAllSalesItems();
              })
          );
        }
        function resetItem() {
            vm.salesItem = {
                id: 0,
                salesRequisitionId: '',
                productType: '',
                productId: '',
                fullProductName: '',
                brandId: '',
                quantity: 0,
                unitPrice: 0,
                amount: 0
            };
            vm.selectedItem.id = '';
            vm.selectedProductType.id = '';
            vm.selectedBrand.id = '';
            vm.disableEdit = true;
        };

        vm.updateSalesRequisition = function () {
            vm.sales.salesRequisitionItems = vm.salesItems;
            vm.sales.distributorId = vm.selectedDistributor.id;

            abp.ui.setBusy(
                    null,
                    salesRequisitionService.updateSalesRequisition(
                        vm.sales
                    ).success(function () {
                        abp.notify.info(abp.utils.formatString(localize("SalesUpdateMessage")));
                        $location.path('/sales/requisitionlist');
                    })
                );
        };


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

        vm.getPackagingProducts = function () {
            abp.ui.setBusy(
                    null,
                    productService.getAllPackagingProducts().success(function (data) {
                        vm.selectedItems = data.products;
                    })
                );
        };

        vm.getOtherProducts = function () {
            abp.ui.setBusy(
                    null,
                    productService.getAllOtherProducts().success(function (data) {
                        vm.selectedItems = data.products;
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
                            item.sl = key + 1;
                            item.amount = item.quantity * item.unitPrice;
                        });
                        vm.gridOptions.data = vm.salesItems;
                    })
                );
        };



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
				vm.getFinishProducts();
            } else if (parseInt(vm.selectedProductType.id) === parseInt(Enums.ProductTypes.PACKAGING)) {
                vm.getPackagingProducts();
            } else if (parseInt(vm.selectedProductType.id) === parseInt(Enums.ProductTypes.OTHER)) {
                vm.getOtherProducts();
            } else {
                vm.selectedItems = {};
                vm.selectedItem = {
                    id: ''
                };
            }
        };

        function loadFinishProduct() {
            vm.selectedItems = {};
            vm.selectedItem = {
                id: ''
            };
            vm.getFinishProducts();
        }
        function loadPrice() {
            vm.salesItem.unitPrice = vm.selectedItem.mrp;
            vm.setAmount();
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
        activate();

        function activate() {
            vm.disableEdit = true;
            vm.status = {
                lcOpened: false,
                poOpened: false,
                etdOpened: false,
                etaOpened: false

            };


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
                fullProductName: '',
                brandId: '',
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

            vm.distributors = [];
            vm.selectedDistributor = {
                id: ''
            };

            vm.brands = [];
            vm.selectedBrand = {
                id: ''
            };
            vm.getDitributors();
            vm.getBrands();
            //alert($state.current.data.action);
            if ($state.current.data != undefined) {
                if ($state.current.data.action === 'edit' || $state.current.data.action === 'detail') {
                    vm.getSalesById();
                }
            }
        }
    };


})();



