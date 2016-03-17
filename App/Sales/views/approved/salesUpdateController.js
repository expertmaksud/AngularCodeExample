(function () {
    'use strict';

    angular
        .module('sales')
        .controller('salesUpdateController', salesUpdateController);

    salesUpdateController.$inject = ['$scope', '$filter', '$location', '$state', '$stateParams', 'appSession', 'abp.services.sales.sale', 'abp.services.sales.salesDetail',
        'abp.services.app.distributor', 'abp.services.app.rawMaterial', 'uiGridConstants', 'productTypeFactory', 'abp.services.app.finishProduct', 'productTypeFilter',
        'abp.services.app.warehouse'
    ];

    function salesUpdateController($scope, $filter, $location, $state, $stateParams, appSession, salesService, salesItemsService,
        distributorService, rawMaterialService, uiGridConstants, productTypeFactory, finishProductService, productTypeFilter, warehouseService) {
        var vm = this;
        vm.title = 'Approve Sales Requisition';
        var localize = abp.localization.getSource('SPMS');



        vm.getDitributors = function () {
            abp.ui.setBusy(
                    null,
                    distributorService.getAllDistributors().success(function (data) {
                        vm.distributors = data.distributors;
                    })
                );
        };


        vm.save = function () {
            angular.forEach(vm.salesItems, function (item, key) {
                if (vm.salesItems[key].productType === 0) {
                    vm.sales.approvalRequireBySeniorManagement = true;
                }
                
            });
            abp.ui.setBusy(
                              null,
                              salesService.updateSale(vm.sales).success(function (data) {
                                  abp.notify.info(abp.utils.formatString(localize("ApprovedSalesSaveMessage"), vm.sales.id));
                                  $location.path('/sales/saleslist');
                              })
                          );
      
        }

 

        vm.editSelectedRow = function (index) {
            vm.salesItem = vm.salesItems[index];
            vm.selectedItemIndex = index;
            vm.salesItem.amount = vm.salesItem.quantity * vm.salesItem.unitPrice;
            vm.selectedProductType.id = vm.salesItem.productType;
            vm.selectedProductType.name = vm.salesItem.productTypeName;
            vm.selectedItem.id = vm.salesItem.productId;
            vm.selectedItem.fullProductName = vm.salesItem.fullProductName;
            vm.selectedWarehouse = { id: vm.salesItem.warehouseId, warehouseName: vm.salesItem.warehouseName };
            vm.loadItems();
        };
        vm.addNewItem = function () {
            vm.salesItem.fullProductName = vm.selectedItem.fullProductName;
            vm.newItem = {
                'saleId': vm.sales.id,
                'productTypeName': vm.selectedProductType.name,
                'productTypeId': vm.selectedProductType.id,
                'fullProductName': vm.salesItem.fullProductName,
                'productId': vm.selectedItem.id,
                'quantity': vm.salesItem.quantity,
                'unitPrice': vm.salesItem.unitPrice,
                'warehouseId': vm.selectedWarehouse.id,
                'warehouseName': vm.selectedWarehouse.warehouseName
            };
            
            abp.ui.setBusy(
                   null,
                   salesItemsService.createSalesDetail(vm.newItem).success(function (data) {
                       vm.salesItems.push(vm.newItem);
                       abp.notify.info(abp.utils.formatString(localize("ApprovedsSalesItemAddMessage"), vm.newItem.fullProductName));
                       vm.resetItem();
                   })
               );
           
           
           
        };

        vm.updateItem = function () {
            vm.salesItem.productType = vm.selectedProductType.id;
            vm.salesItem.productTypeName = vm.selectedProductType.name;
            vm.salesItem.productId = vm.selectedItem.id;
            vm.salesItem.fullProductName = vm.selectedItem.fullProductName;
            vm.salesItem.warehouseId = vm.selectedWarehouse.id;
            vm.salesItem.warehouseName = vm.selectedWarehouse.warehouseName;
            vm.salesItems[vm.selectedItemIndex] = vm.salesItem;
            abp.ui.setBusy(
                 null,
                 salesItemsService.updateSalesDetail(vm.salesItems[vm.selectedItemIndex]).success(function (data) {
                     abp.notify.info(abp.utils.formatString(localize("ApprovedsSlesItemUpdateMessage"), vm.salesItem.fullProductName));
                     vm.resetItem();
                 })
             );
        
        };
        vm.saveItem=function () {
            if (vm.selectedItemIndex ==='') {
                vm.salesItem.salesRequisitionId = $stateParams.id;
                vm.addNewItem();

            }
            else {
                vm.updateItem();
            }
        };

        vm.deleteItem = function (index) {
            var data = {
                id: vm.salesItems[index].id
            }
            abp.ui.setBusy(
               null,
               salesItemsService.deleteSalesDetail(data).success(function (data) {
                   abp.notify.info(abp.utils.formatString(localize("ApprovedsSalesItemDeleteMessage"),vm.salesItems[index].fullProductName));
                   vm.salesItems.splice(index, 1);
               })
           );
           
        }
        vm.resetItem = function () {
            vm.salesItem = {};
            vm.selectedItem.id = '';
            vm.selectedProductType.id = '';
            vm.selectedWarehouse = {};
            vm.selectedItemIndex = '';
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
                    finishProductService.getAllFinishProducts().success(function (data) {
                        vm.selectedItems = data.finishProducts;
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
                    salesService.getSaleById(input).success(function (data) {
                        console.log(data);
                        vm.sales = data.sale;
                        vm.selectedDistributor.id = vm.sales.distributorId;
                        vm.selectedpaymentMode = vm.sales.paymentMode.toString();
                        vm.salesItems = data.saleItems;
                        angular.forEach(vm.salesItems, function (item, key) {
                            vm.salesItems[key].productTypeName = vm.productTypes[item.productType].name;
                            angular.forEach(vm.warehouses, function (whouse, i) {
                                if (whouse.id == vm.salesItems[key].warehouseId) {
                                    vm.salesItems[key].warehouseName = whouse.warehouseName;
                                }
                            });
                        });
                    })
                );
        };
        vm.getWireHouse = function () {
            abp.ui.setBusy(
                    null,
                    warehouseService.getAllWarehouses().success(function (data) {
                        vm.warehouses = data.warehouses;
                        console.log(vm.warehouses);
                    })
                );
        }


        vm.loadItems = function () {
            if (vm.selectedProductType.id === "0" || vm.selectedProductType.id === 0) {
                vm.getRawMaterials();
            } else if (vm.selectedProductType.id === "1" || vm.selectedProductType.id === 1) {
                vm.getFinishProducts();
            } else {
                vm.selectedItems = {};
                vm.selectedItem = {
                    id: ''
                };
            }
         
        };

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
                rawMaterialId: '',
                finishProductId: '',
                fullProductName: '',
                warehouseId:'',
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

            vm.getDitributors();
            vm.getWireHouse();
            vm.getSalesById();
        }
    };


})();



