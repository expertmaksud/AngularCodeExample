(function () {
    'use strict';

    angular
        .module('sales')
        .controller('salesRequisitionListController', salesRequisitionListController);

    salesRequisitionListController.$inject = ['$scope', '$state', '$location', 'abp.services.sales.salesRequisition', 'abp.services.sales.salesRequisitionDetail', 'abp.services.sales.sale'];

    function salesRequisitionListController($scope, $state, $location, salesRequisitionService, salesRequisitionItemsService, salesService) {
        var vm = this;

        var localize = abp.localization.getSource('SPMS');

        vm.getPendingRequisitionList = getPendingRequisitionList;

        vm.title = 'Sales Requisition List';
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
              { name: 'SL#', field: 'sl' },
              { name: 'id', field: 'id', visible: false },
              { name: 'DistributorId', field: 'distributorId', visible: false },
              { name: 'paymentMode', field: 'paymentMode', visible: false },
              { name: 'Distributor', field: 'distributorName' },
              { name: 'paymentType', field: 'paymentModeName' },
              { name: 'creditDays', field: 'creditDays' },
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

        vm.getSalesRequisition = function () {
            abp.ui.setBusy(
                    null,
                    salesRequisitionService.getNotApprovedSalesRequisitions().success(function (data) {
                        vm.pendingSalesRequisitions = data.pendingSalesRequisitions;

                        angular.forEach(vm.pendingSalesRequisitions, function (item, key) {
                            item.sl = key + 1;
                        });
                        vm.gridOptions.data = vm.pendingSalesRequisitions;
                    })
                );
        };
        vm.getApprovedSales = function () {
            abp.ui.setBusy(
                    null,
                    salesService.getAllSales().success(function (data) {
                        vm.gridOptions.data = data.sales
                        angular.forEach(data.sales, function (item, key) {
                            data.sales[key].sl = key + 1;
                        });

                    })
                );
        };
        vm.getSeniorApprovedRequiredSalesList = function () {
            abp.ui.setBusy(
                    null,
                    salesService.getSalesApprovalRequireBySeniorManagement().success(function (data) {
                        angular.forEach(data.approvalRequireBySeniorManagementSales, function (item, key) {
                            item.sl = key + 1;
                        });
                        vm.gridOptions.data = data.approvalRequireBySeniorManagementSales

                    })
                );
        };
        vm.editSelectedRow = function () {
            var salesId = angular.copy(vm.selectedRowEntity.id);
            vm.disableEdit = true;
            $location.path('/sales/requisitions/' + salesId);
        }
        vm.editApprodedRow = function () {
            var salesId = angular.copy(vm.selectedRowEntity.id);
            $location.path('/sales/items/edit/' + salesId);
        }
        vm.approveRow = function () {
            var salesId = angular.copy(vm.selectedRowEntity.id);
            vm.disableEdit = true;
            $location.path('/sales/approverequisition/' + salesId);
        }

        vm.approveSecondLevelRow = function () {
            var salesId = angular.copy(vm.selectedRowEntity.id);
            vm.disableEdit = true;
            $location.path('/sales/approvesecond/' + salesId);
        }

        vm.deleteSelectedRow = function () {
            var salesId = angular.copy(vm.selectedRowEntity.id);
            vm.disableEdit = true;
            var input = {
                id: salesId
            };
            abp.ui.setBusy(
                   null,
                   salesRequisitionService.deleteSalesRequisition(input).success(function (data) {
                       abp.notify.info(abp.utils.formatString(localize("SalesRequisitionDeleteMessage"), salesId));
                       vm.getSalesRequisition();
                   })
               );


        }

        vm.displayDetails = function () {
            var salesId = angular.copy(vm.selectedRowEntity.id);
            vm.disableEdit = true;
            $location.path('/sales/requisiondetail/' + salesId);
        }

        function getPendingRequisitionList() {
                abp.ui.setBusy(
                    null,
                    salesRequisitionService.getPendingRequisitions().success(function (data) {
                        vm.pendingSalesRequisitions = data.pendingSalesRequisitions;

                        angular.forEach(vm.pendingSalesRequisitions, function (item, key) {
                            item.sl = key + 1;
                        });
                        vm.gridOptions.data = vm.pendingSalesRequisitions;
                    })
                );
        }
        activate();

        function activate() {
            if ($state.current.data != undefined) {
                if ($state.current.data.action === 'requisitionList') {
                    vm.requisitionList = true;
                    vm.heading = "Sales Requisition List";
                    vm.getSalesRequisition();
                } else if ($state.current.data.action === 'pending') {
                    vm.pending = true;
                    vm.heading = "All Pending Sales Requisition List";
                    vm.getPendingRequisitionList();
                } else if ($state.current.data.action === 'approvedList') {
                    vm.getApprovedSales();
                    vm.approvedList = true;
                    vm.heading = "Approved Sales";
                } else if ($state.current.data.action === 'seniorApproveRequired') {
                    vm.heading = "Required Senior Manager Approved Sales List ";
                    vm.seniorApproveRequired = true;
                    vm.getSeniorApprovedRequiredSalesList();
                }
            }
            vm.disableEdit = true;
        }
    };


})();



