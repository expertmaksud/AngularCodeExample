(function () {
    'use strict';

    angular
        .module('production')
        .controller('receiveRawMaterialController', receiveRawMaterialController);

    receiveRawMaterialController.$inject = ['$scope', '$location', '$filter', 'appSession', '$state', '$stateParams', 'abp.services.production.rawMaterialRequisition', 'abp.services.production.rawMaterialRequisitionReceive'];

    function receiveRawMaterialController($scope, $location, $filter, appSession, $state, $stateParams, rawMaterialRequisitionService, rawMaterialRequisitionReceiveService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Receive Raw Material';

        //vm.getApprovedProductRequisitionList = getApprovedProductRequisitionList;
        //vm.receiveRawMaterial = receiveRawMaterial;

        vm.getRawMaterialRequisitionsByRequisitionId = getRawMaterialRequisitionsByRequisitionId;
        vm.saveReceiveRawMaterial = saveReceiveRawMaterial;

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
              { name: 'ProductionRequisitionId', field: 'productionRequisitionId', visible: false },
              { name: 'RawMaterialId', field: 'rawMaterialId', visible: false },
              { name: 'WarehouseId', field: 'warehouseId', visible: false },
              { name: 'ProductUnitId', field: 'productUnitId', visible: false },
              { name: 'FullProductName', field: 'fullProductName' },
              { name: 'RequisitionQuantity', field: 'rawMaterialQuantity' },
              { name: 'AvailableQuantity', field: 'availableQuantity' }
            ],
            onRegisterApi: function (gridApi) {
                vm.myGridApi = gridApi;
                vm.myGridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    vm.disableEdit = false;
                    vm.selectedRowEntity = angular.copy(row.entity);
                });
            }
        };

        function getRawMaterialRequisitionsByRequisitionId() {
            var data = {
                approvedProductionRequisitionId: $stateParams.id
            };
            abp.ui.setBusy(
                    null,
                    rawMaterialRequisitionService.getRawMaterialRequisitionByApprovedProductionRequisitionId(data).success(function (data) {
                        vm.rawMaterialRequisitions = data.rawMaterialRequisitions;
                        vm.gridOptions.data = data.rawMaterialRequisitions;
                    })
                );
        };

        function saveReceiveRawMaterial() {
            /*var expression = {
                rawMaterialId: vm.slectedRawMaterial.id
            };
            vm.filterItem = $filter('filter')(vm.rawMaterialRequisitions, expression);*/

            vm.rawMaterialRequisition.rawMaterialRequisitionId = vm.slectedRawMaterial.id;
            vm.rawMaterialRequisition.productionRequisitionId = vm.slectedRawMaterial.productionRequisitionId;
            vm.rawMaterialRequisition.rawMaterialId = vm.slectedRawMaterial.rawMaterialId;
            vm.rawMaterialRequisition.warehouseId = vm.slectedRawMaterial.warehouseId;
            vm.rawMaterialRequisition.productUnitId = vm.slectedRawMaterial.productUnitId;
            vm.rawMaterialRequisition.stockBinId = vm.slectedRawMaterial.stockBinId;

            if (vm.slectedRawMaterial.availableQuantity >= vm.rawMaterialRequisition.rawMaterialReceiveQuantity) {
                abp.ui.setBusy(
                         null,
                         rawMaterialRequisitionReceiveService.createRawMaterialRequisitionReceive(
                             vm.rawMaterialRequisition
                         ).success(function () {
                             abp.notify.info(abp.utils.formatString("Raw Material " + vm.slectedRawMaterial.fullProductName + " received successfully."));
                             $location.path('/product/confirmRequisitionList');
                         })
                     );
            }
            else {
                abp.notify.info(abp.utils.formatString("Raw Material received quantity can't be more than available quantity."));
            }
        }

        activate();

        function activate() {
            vm.disableEdit = true;

            vm.rawMaterialRequisitions = [];
            vm.rawMaterialRequisition = {
                productionRequisitionId: '',
                rawMaterialRequisitionId:'',
                rawMaterialId: '',
                stockBinId: '',
                rawMaterialReceiveQuantity: 0,
                warehouseId: '',
                productUnitId: '',
                creatorUserId: appSession.user.id
            };
            vm.slectedRawMaterial = { id: '' };
            vm.getRawMaterialRequisitionsByRequisitionId();

        }
    }
})();