(function () {
    'use strict';

    angular
        .module('production')
        .controller('confirmProductRequisitionListController', confirmProductRequisitionListController);

    confirmProductRequisitionListController.$inject = ['$scope', '$location', 'appSession', '$state', '$stateParams', 'abp.services.app.finishProduct', 'abp.services.production.approvedProductionRequisition', 'abp.services.production.rawMaterialRequisition'];

    function confirmProductRequisitionListController($scope, $location, appSession, $state, $stateParams, finishProductService, approvedProductionRequisitionService, rawMaterialRequisitionService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Confirm Raw Material Requisition for Finish Product';
        vm.getApprovedProductRequisitionList = getApprovedProductRequisitionList;
        vm.receiveRawMaterial = receiveRawMaterial;
        vm.confirmProduction = confirmProduction;

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
              { name: 'Id', field: 'id', visible: true },
              { name: 'ProductionRequisitionId', field: 'productionRequisitionId', visible: false },
              { name: 'FinishProductId', field: 'finishProductId', visible: false },
              { name: 'FullProductName', field: 'fullProductName' },
              { name: 'RequisitionQuantity', field: 'finishProductQuantity' },
              { name: 'Remarks', field: 'remarks' }
            ],
            onRegisterApi: function (gridApi) {
                vm.myGridApi = gridApi;
                vm.myGridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    vm.disableEdit = false;
                    vm.selectedRowEntity = angular.copy(row.entity);
                });
            }
        };

        function getApprovedProductRequisitionList() {
            abp.ui.setBusy(
                    null,
                    approvedProductionRequisitionService.getAllApprovedProductionRequisitions().success(function (data) {
                        vm.gridOptions.data = data.approvedProductionRequisitions;
                    })
                );
        };

        function receiveRawMaterial() {
            var requisitionId = angular.copy(vm.selectedRowEntity.id);
            vm.disableEdit = true;
            $location.path('/productRequision/receive/' + requisitionId);
        };

        function confirmProduction() {
            var requisitionId = angular.copy(vm.selectedRowEntity.id);
            var data = {
                approvedProductionRequisitionId: requisitionId
            };
            abp.ui.setBusy(
                    null,
                    rawMaterialRequisitionService.isAllRequisitionProductReceived(data).success(function (data) {
                        debugger
                        vm.isAllProductReceived = data;
                        if (vm.isAllProductReceived) {
                            vm.disableEdit = true;
                            $location.path('/confirmProduction/' + requisitionId);
                        } else {
                              abp.notify.info("Please receive all requisition product before start production. ");
                     
                        }

                    })
                );
           

            //$location.path('/productRequision/receive/' + requisitionId);
        };

        activate();

        function activate() {
            vm.disableEdit = true;

            vm.approvedProductionRequisition = {
                id: 0,
                finishProductId: '',
                finishProductQuantity: 0,
                remarks: '',
                creatorUserId: appSession.user.id
            };

            vm.getApprovedProductRequisitionList();

        }
    }
})();