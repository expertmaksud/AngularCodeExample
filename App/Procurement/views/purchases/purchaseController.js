(function () {
    'use strict';

    angular
        .module('procurement')
        .controller('purchaseController', purchaseController);

    purchaseController.$inject = ['$scope', '$filter', '$location', '$state', '$stateParams', 'appSession', 'abp.services.procurement.purchase', 'abp.services.procurement.purchaseItem',
        'abp.services.app.vendor', 'purchaseTypeFactory', 'abp.services.app.rawMaterial', 'uiGridConstants', 'productTypeFactory', 'abp.services.app.finishProduct', 'productTypeFilter',
        '$uibModal', '$log', 'ENUMS', 'abp.services.app.productUnit', 'abp.services.app.product'];

    function purchaseController($scope, $filter, $location, $state, $stateParams, appSession, purchaseService, purchaseItemService,
        vendorService, purchaseTypeFactory, rawMaterialService, uiGridConstants, productTypeFactory, finishProductService, productTypeFilter, $modal, $log, Enums, productUnitService, productService) {
        var vm = this;
        vm.title = 'Create Purchase';
        var localize = abp.localization.getSource('SPMS');
        vm.addToGrid = addToGrid;
        vm.addNewPurchase = addNewPurchase;
        vm.getAllPurchaseItems = getAllPurchaseItems;
        vm.addNewItem = addNewItem;
        vm.deleteRowFromGrid = deleteRowFromGrid;
        vm.saveItem = saveItem;
        vm.updateItem = updateItem;
        vm.deleteItem = deleteItem;
        vm.editSelectedRow = editSelectedRow;
        vm.getProductUnits = getProductUnits;

        vm.gridOptions = {
            enableSorting: true,
            enableRowSelection: true,
            showSelectionCheckbox: true,
            enableSelectAll: false,
            multiSelect: false,
            enableCellEdit: false,
            showGridFooter: true,
            showColumnFooter: true,
            //enableFiltering: true,
            columnDefs: [
              { name: 'SL#', field: 'id', width: 60},
              { name: 'PurchaseId', field: 'purchaseId', visible: false },
              { name: 'RawMaterialId', field: 'rawMaterialId', visible: false },
              { name: 'FinishProductId', field: 'finishProductId', visible: false },
              { name: 'ProductUnitId', field: 'productUnitId', visible: false },
              { name: 'ProductType', field: 'productType', cellFilter: 'productType',width:130 },
              { name: 'ProductName', field: 'fullProductName' },
              { name: 'Quantity', field: 'purchaseQuantity',width:140 },
              { name: 'UnitIn', field: 'productUnitName',width:110 },
              { name: 'Price/Unit', field: 'unitPrice', cellFilter: 'currency:"Tk. "' ,width:120},
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

        //vm.dateOptions = {
        //    showAnim: 'slideDown',
        //    changeYear: true,
        //    changeMonth: true,
        //    yearRange: 'c-5:c+5',
        //    currentText: 'Now',
        //    dateFormat: 'dd-M-yy',
        //    minDate: 0,
        //    maxDate: '+10Y',
        //    showButtonPanel: true

        //};

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            minDate: new Date()
        };

        function addToGrid() {
            vm.purchaseItem.productType = vm.selectedProductType.id;
            vm.purchaseItem.productId = vm.selectedItem.id;
            vm.purchaseItem.fullProductName = vm.selectedItem.fullProductName;
            vm.purchaseItem.productUnitId = vm.selectedProductUnit.id;
            vm.purchaseItem.productUnitName = vm.selectedProductUnit.unitName
            if (vm.disableEdit) {
                vm.purchaseItem.id = (isNaN(vm.purchaseItems.length) ? 0 : vm.purchaseItems.length) + 1;
                vm.purchaseItems.push(angular.copy(vm.purchaseItem));

            } else {
                //When in edit mode
                vm.purchaseItems[(vm.purchaseItem.id - 1)] = vm.purchaseItem;
                vm.disableEdit = true;
            }
            vm.gridOptions.data = vm.purchaseItems;


            vm.purchaseItem = {
                id: vm.purchaseItem.id,
                purchaseId: '',
                productId: '',
                purchaseQuantity: '',
                unitPrice: '',
                productUnitId: '',
                productUnitName:''
            };
        }

        function addNewPurchase() {
            vm.purchase.purchaseType = vm.selectedPurchaseType.id;
            vm.purchase.vendorId = vm.selectedVendor.id;

            vm.purchase.purchaseItems = vm.purchaseItems;

            abp.ui.setBusy(
                    null,
                    purchaseService.createPurchase(
                        vm.purchase
                    ).success(function () {
                        abp.notify.info(abp.utils.formatString(localize("PurchaseCreatedMessage")));
                        $location.path('/purchase/list');
                    })
                );
        };

        function getAllPurchaseItems() {
            var input = {
                purchaseId: $stateParams.id,
            };
            abp.ui.setBusy(
                 null,
                 purchaseItemService.getItemsByPurchaseId(input).success(function (data) {
                     angular.forEach(data.purchaseItems, function (item, key) {
                         item.amount = item.purchaseQuantity * item.unitPrice;
                     });
                     vm.gridOptions.data = data.purchaseItems;
                     vm.disableEdit = true;
                 })
             );
        };

        function addNewItem() {
            vm.purchaseItem.productType = vm.selectedProductType.id;
            vm.purchaseItem.productId = vm.selectedItem.id;
            vm.purchaseItem.productUnitId = vm.selectedProductUnit.id;
            abp.ui.setBusy(
                   null,
                   purchaseItemService.createPurchaseItem(
                       vm.purchaseItem
                   ).success(function () {
                       abp.notify.info(abp.utils.formatString(localize("PurchaseItemCreatedMessage"), vm.purchaseItem.fullProductName));
                       vm.purchaseItem = {};
                       vm.getAllPurchaseItems();
                       vm.resetItem();
                   })
               );
        };

        function updateItem() {
            vm.purchaseItem.productType = vm.selectedProductType.id;
            vm.purchaseItem.productId = vm.selectedItem.id;
            vm.purchaseItem.productUnitId = vm.selectedProductUnit.id;
            abp.ui.setBusy(
                   null,
                   purchaseItemService.updatePurchaseItem(
                       vm.purchaseItem
                   ).success(function () {
                       abp.notify.info(abp.utils.formatString(localize("PurchaseItemUpdateMessage"), vm.purchaseItem.fullProductName));
                       vm.purchaseItem = {};
                       vm.getAllPurchaseItems();
                   })
               );
        };

        function saveItem() {
            if (vm.purchaseItem.id === 0 || vm.purchaseItem.id === undefined) {
                vm.purchaseItem.purchaseId = $stateParams.id;
                vm.addNewItem();

            }
            else {
                vm.updateItem();
            }
        };

        function deleteItem() {
            var data = {
                id: vm.selectedRowEntity.id
            }
            abp.ui.setBusy(
              null,
              purchaseItemService.deletePurchaseItem(
                 data
              ).success(function () {
                  abp.notify.info(abp.utils.formatString(localize("PurchaseItemDeleteMessage"), vm.purchaseItem.fullProductName));
                  vm.getAllPurchaseItems();
              })
          );
        }

        function editSelectedRow() {
            vm.purchaseItem = vm.selectedRowEntity;
            vm.selectedProductType.id = vm.purchaseItem.productType;
            vm.selectedProductUnit.id = vm.purchaseItem.productUnitId;

            vm.loadItems();
            vm.selectedItem.id = vm.purchaseItem.productId;
        }

        function deleteRowFromGrid() {
            //alert(vm.selectedRowEntity.id);
            vm.purchaseItems.splice(vm.selectedRowEntity.id - 1, 1);
            //Update index ot items
            var curId = 1;
            angular.forEach(vm.purchaseItems, function (item, key) {
                item.id = curId;
                curId = curId + 1;
            });

        }

        vm.resetItem = function () {
            vm.purchaseItem = {};
            vm.selectedItem.id = '';
            vm.selectedProductType.id = '';
            vm.selectedProductUnit.id = '';
        };

        vm.updatePurchase = function () {
            vm.purchase.purchaseType = vm.selectedPurchaseType.id;
            vm.purchase.vendorId = vm.selectedVendor.id;

            abp.ui.setBusy(
                    null,
                    purchaseService.updatePurchase(
                        vm.purchase
                    ).success(function () {
                        abp.notify.info(abp.utils.formatString("Purchaes (LC/PO) updated successfully."));
                        $location.path('/purchase/list');
                    })
                );
        };
        vm.getVendors = function () {
            abp.ui.setBusy( //Set whole page busy until getTasks complete
                    null,
                    vendorService.getAllVendors().success(function (data) {
                        vm.vendors = data.vendors;
                    })
                );
        };

        vm.getRawMaterials = function () {
            abp.ui.setBusy(
                    null,
                    rawMaterialService.getAllRawMaterials().success(function (data) {
                        vm.selectedItems = data.rawMaterials;
                    })
                );
        };

        vm.getFinishProducts = function () {
            abp.ui.setBusy(
                    null,
                    finishProductService.getAllFinishProductsOnly().success(function (data) {
                        vm.selectedItems = data.finishProducts;
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
            if (vm.purchaseItem.purchaseQuantity != '' & vm.purchaseItem.unitPrice != '') {
                vm.purchaseItem.amount = vm.purchaseItem.purchaseQuantity * vm.purchaseItem.unitPrice;
            }
        };

        vm.getPurchaseById = function (id) {
            var data = {
                id: id
            };
            abp.ui.setBusy(
                    null,
                    purchaseService.getPurchaseById(data).success(function (data) {

                        vm.purchase = data.purchase;
                        vm.purchase.lcDate = new Date(angular.copy(data.purchase.lcDate));
                        vm.purchase.poDate = new Date(angular.copy(data.purchase.poDate));
                        vm.purchase.etd = new Date(angular.copy(data.purchase.etd));
                        vm.purchase.eta = new Date(angular.copy(data.purchase.eta));


                        vm.selectedPurchaseType.id = vm.purchase.purchaseType;
                        vm.selectedVendor.id = vm.purchase.vendorId;
                        vm.purchaseItems = data.purchaseItems;

                        angular.forEach(vm.purchaseItems, function (item, key) {
                            item.amount = item.purchaseQuantity * item.unitPrice;
                        });


                        vm.gridOptions.data = vm.purchaseItems;
                    })
                );
        };

        vm.open = function ($event, option) {
            if (option === 'lc') {
                vm.status.lcOpened = true;
            }
            else if (option === 'po') {
                vm.status.poOpened = true;
            }
            else if (option === 'etd') {
                vm.status.etdOpened = true;
            }
            else if (option === 'eta') {
                vm.status.etaOpened = true;

            }

        };

        vm.loadItems = function () {
            if (parseInt(vm.selectedProductType.id) === parseInt(Enums.ProductTypes.RAWMATERIAL)) {
                vm.getRawMaterials();
            } else if (parseInt(vm.selectedProductType.id) === parseInt(Enums.ProductTypes.FINISHPRODUCT)) {
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

        function getProductUnits() {
            abp.ui.setBusy(
                    null,
                    productUnitService.getAllProductUnits().success(function (data) {
                        vm.productUnits = data.productUnits;
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
                remarks: '',
                creatorUserId: appSession.user.id
            };
            vm.purchaseItems = [];
            vm.purchaseItem = {
                id: 0,
                purchaseId: '',
                productId: '',
                fullProductName: '',
                purchaseQuantity: 0,
                unitPrice: 0,
                productUnitName: '',
                productUnitId: '',
                amount: 0
            };

            vm.selectedItems = {};
            vm.selectedItem = {
                id: ''
            };


            vm.purchaseTypes = purchaseTypeFactory.getData();
            vm.selectedPurchaseType = {
                id: ''
            };

            vm.productTypes = productTypeFactory.getData();
            vm.selectedProductType = {
                id: ''
            };

            vm.vendors = [];
            vm.selectedVendor = {
                id: ''
            };

            vm.productUnits = [];
            vm.selectedProductUnit = {
                id: ''
            }

            vm.getVendors();
            vm.getProductUnits();

            if ($state.current.data != undefined) {
                if ($state.current.data.action === 'edit' || $state.current.data.action === 'detail') {
                    vm.getPurchaseById($stateParams.id);
                }
            }
        }


        vm.openVendorModal = function () {
            var modalInstance = $modal.open({
                templateUrl: '/App/Procurement/views/purchases/vendorAdd.cshtml',
                id: 'addVendor',
                controller: ModalInstanceCtrl,
                controllerAs: vm,
                resolve: {
                    vendorService: vendorService,

                }
            });

            modalInstance.result.then(function (data, selectedItem) {
                vm.vendors = data.vendors;
            }, function () {

            });
        };
    }

    angular.module('procurement')
        .controller('ModalInstanceCtrl', ModalInstanceCtrl);

    ModalInstanceCtrl.$inject = ['$scope', '$filter', 'abp.services.app.vendor', '$modalInstance'];

    function ModalInstanceCtrl($scope, $filter, vendorService, $modalInstance) {
        var vm = this;
        $scope.saveVendor = function () {
            var vendorData;
            abp.ui.setBusy(
                    null,
                    vendorService.createVendor(
                       $scope.vendor
                    ).success(function () {
                        abp.notify.info("Vendor " + $scope.vendor.vendorName + " created successfully.");
                        vendorService.getAllVendors().success(function (data) {
                            $modalInstance.close(data, $scope.selectedVendor);
                            // activate();
                        });

                    }
                )
            )
        }

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };




})();



