﻿(function () {
    'use strict';

    angular
        .module('production')
        .controller('finishProductRequisitionListController', finishProductRequisitionListController);

    finishProductRequisitionListController.$inject = ['$scope', '$location', 'appSession', '$state', '$stateParams', 'abp.services.app.finishProduct', 'abp.services.production.productionRequisition'];

    function finishProductRequisitionListController($scope, $location, appSession, $state, $stateParams, finishProductService, productionRequisitionService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Raw Material Requisition for Finish Product';

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
              { name: 'FinishProductId', field: 'finishProductId', visible: false },
              { name: 'FullProductName', field: 'fullProductName' },
              { name: 'RequisitionQuantity', field: 'finishProductQuantity' }
            ],
            onRegisterApi: function (gridApi) {
                vm.myGridApi = gridApi;
                vm.myGridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    vm.disableEdit = false;
                    vm.selectedRowEntity = angular.copy(row.entity);
                });
            }
        };

        vm.getProductRequisitionList = function () {
            abp.ui.setBusy(
                    null,
                    productionRequisitionService.getAllProductionRequisitions().success(function (data) {
                        vm.gridOptions.data = data.productionRequisitions;
                    })
                );
        };

        activate();

        function activate() {
            vm.disableEdit = true;

            vm.productRequisition = {
                id: 0,
                finishProductId: '',
                finishProductQuantity: 0,
                remarks: '',
                quantity: 0,
                currentStock: 0,
                creatorUserId: appSession.user.id
            };

            vm.getProductRequisitionList();

        }
    }
})();