(function () {
    'use strict';

    angular
        .module('main')
        .controller('unitConversionController', unitConversionController);

    unitConversionController.$inject = ['$scope', '$location', 'appSession', 'abp.services.app.unitConversion', 'abp.services.app.productUnit'];

    function unitConversionController($scope, $location, appSession, unitConversionService, productUnitService) {
        var vm = this;
        vm.title = 'Unit Conversion';
        var localize = abp.localization.getSource('SPMS');

        vm.addNewUnitConversion = addNewUnitConversion;
        vm.deleteUnitConversion = deleteUnitConversion;
        vm.getUnitConversions = getUnitConversions;
        vm.editSelectedRow = editSelectedRow;
        vm.updateUnitConversion = updateUnitConversion;
        vm.saveUnitConversion = saveUnitConversion;
        vm.getProductUnits = getProductUnits;

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
              { name: 'fromUnitId', field: 'fromUnitId', visible: false },
              { name: 'fromUnitName', field: 'fromUnitName' },
              { name: 'ToUnitId', field: 'toUnitId', visible: false },
              { name: 'toUnitName', field: 'toUnitName' },
              { name: 'ConversionValue', field: 'conversionValue' },
              { name: 'CreationTime', field: 'creationTime', type: 'date', cellFilter: 'date:"dd-MMM-yyyy h:m a"' }
            ],
            onRegisterApi: function (gridApi) {
                vm.myGridApi = gridApi;
                vm.myGridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    vm.disableEdit = false;
                    vm.selectedRowEntity = angular.copy(row.entity);
                });
            }
        };

        function addNewUnitConversion() {
            vm.unitConversion.fromUnitId = vm.selectedProductUnitFrom.id;
            vm.unitConversion.toUnitId = vm.selectedProductUnitTo.id;
            abp.ui.setBusy(
                    null,
                    unitConversionService.createUnitConversion(
                        vm.unitConversion
                    ).success(function () {
                        abp.notify.info(abp.utils.formatString(localize("UnitConversionCreatedMessage"), vm.unitConversion.conversionValue));
                        activate();
                    })
                );
        };

        function deleteUnitConversion () {
            var data = {
                id: vm.selectedRowEntity.id
            };

            abp.message.confirm(
            'This Unit Conversion will be deleted.',
            'Are you sure?',
             function (isConfirmed) {
                 if (isConfirmed) {
                     abp.ui.setBusy(
                             null,
                             unitConversionService.deleteUnitConversion(
                             data
                             ).success(function () {
                                 abp.notify.info(abp.utils.formatString(localize("UnitConversionDeletedMessage"), vm.unitConversion.conversionValue));
                                 activate();
                             })
                         );
                 }
             }
            );
        };

        function getUnitConversions () {
            abp.ui.setBusy(
                    null,
                    unitConversionService.getAllUnitConversions().success(function (data) {
                        vm.gridOptions.data = data.unitConversions;
                    })
                );
        };

        function editSelectedRow () {
            vm.unitConversion = vm.selectedRowEntity;
            vm.selectedProductUnitFrom.id = vm.unitConversion.fromUnitId;
            vm.selectedProductUnitTo.id = vm.unitConversion.toUnitId;
        }

        function updateUnitConversion () {
            abp.ui.setBusy(
                    null,
                    unitConversionService.updateUnitConversion(
                        vm.unitConversion
                    ).success(function () {
                        abp.notify.info(abp.utils.formatString(localize("UnitConversionUpdatedMessage"), vm.unitConversion.conversionValue));
                        activate();
                    })
                );
        };

        function saveUnitConversion() {
            if (vm.unitConversion.id != 0) {
                vm.updateUnitConversion();
            }
            else {
                vm.addNewUnitConversion();
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
            vm.unitConversion = {
                id: 0,
                fromUnitId: 0,
                toUnitId: 0,
                conversionValue: '',
                creatorUserId: appSession.user.id
            };

            vm.productUnits = {};
            vm.selectedProductUnitFrom = {
                id: ''
            };
            vm.selectedProductUnitTo = {
                id: ''
            };

            vm.getUnitConversions();
            vm.getProductUnits();
        }
    }
})();