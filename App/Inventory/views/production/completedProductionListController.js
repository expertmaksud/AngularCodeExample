(function () {
    'use strict';

    angular
        .module('inventory')
        .controller('completedProductionListController', completedProductionListController);

    completedProductionListController.$inject = ['$scope', '$location', 'appSession', '$state', '$stateParams', 'abp.services.app.finishProduct', 'abp.services.production.productionRequisition', 'abp.services.production.finishProductProduction'];

    function completedProductionListController($scope, $location, appSession, $state, $stateParams, finishProductService, productionRequisitionService, finishProductProductionService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Finish Product Production Completed List';

        vm.getCompletedProductionList = getCompletedProductionList;

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
              { name: 'ApprovedProductionRequisitionId', field: 'approvedProductionRequisitionId', visible: false },
              { name: 'FullProductName', field: 'fullProductName' },
              { name: 'FinishProductQuantity', field: 'finishProductQuantity' }
            ],
            onRegisterApi: function (gridApi) {
                vm.myGridApi = gridApi;
                vm.myGridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    vm.disableEdit = false;
                    vm.selectedRowEntity = angular.copy(row.entity);
                });
            }
        };

        function getCompletedProductionList () {
            abp.ui.setBusy(
                    null,
                    finishProductProductionService.getPendingReceiveFinishProductProductions().success(function (data) {
                        vm.gridOptions.data = data.finishProductProductions;
                    })
                );
        };

        vm.editSelectedRow = function () {
            var rowId = angular.copy(vm.selectedRowEntity.id);
            vm.disableEdit = true;
            $location.path('/finishProductConfirm/receive/' + rowId);
        }

        activate();

        function activate() {
            vm.disableEdit = true;

            vm.confirmProduction = {
                id: 0,
                approvedProductionRequisitionId: '',
                finishProductQuantity: 0,
                creatorUserId: appSession.user.id
            };

            vm.getCompletedProductionList();

        }
    }
})();