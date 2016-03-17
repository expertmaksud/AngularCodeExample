(function () {
    'use strict';

    angular
        .module('sales')
        .controller('ApprovedsalesController', ApprovedsalesController);

    ApprovedsalesController.$inject = ['$scope', '$filter', '$location', '$state', '$stateParams', 'appSession', 'abp.services.sales.sale', 'abp.services.sales.salesDetail',
        'abp.services.app.distributor', 'abp.services.app.rawMaterial', 'uiGridConstants', 'productTypeFactory', 'abp.services.app.finishProduct', 'productTypeFilter',
    ];

    function ApprovedsalesController($scope, $filter, $location, $state, $stateParams, appSession, salesService, salesItemsService,
        distributorService, rawMaterialService, uiGridConstants, productTypeFactory, finishProductService, productTypeFilter) {
        var vm = this;
        vm.title = 'Sales Details';
        var localize = abp.localization.getSource('SPMS');

        vm.approveSale = approveSale;

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
              { name: 'RawMaterialId', field: 'rawMaterialId', visible: false },
              { name: 'FinishProductId', field: 'finishProductId', visible: false },
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

        vm.getSalesById = function () {
            var input = {
                id: $stateParams.id,
            };
            abp.ui.setBusy(
                    null,
                    salesService.getSaleById(input).success(function (data) {
                        vm.sales = data.sale;
                        vm.selectedDistributor.id = vm.sales.distributorId;
                        vm.selectedpaymentMode = vm.sales.paymentMode.toString();
                        vm.salesItems = data.saleItems;

                        angular.forEach(vm.salesItems, function (item, key) {
                            item.sl = key + 1;
                            item.amount = item.quantity * item.unitPrice;
                        });
                        vm.gridOptions.data = vm.salesItems;
                    })
                );
        };

        function approveSale() {
            var input = {
                saleId: vm.sales.id,
                seniorManagementApprovedBy: appSession.user.id,
                salesRequisitionId :  vm.sales.salesRequisitionId
            }
            abp.ui.setBusy(
                           null,
                           salesService.seniorManagementApproval(input).success(function (data) {
                               abp.notify.info("You approve the sales requisition successfully.");
                               $location.path('/sales/senior/list');
                           })
                       );
        }

        activate();

        function activate() {
            
            vm.sales = {},
            vm.salesItem = {
                id: 0,
                salesRequisitionId: '',
                productType: '',
                rawMaterialId: '',
                finishProductId: '',
                fullProductName: '',
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

            vm.getDitributors();
            vm.getSalesById();
        }
    };


})();



