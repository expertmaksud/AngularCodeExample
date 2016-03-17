(function () {
    'use strict';

    angular
        .module('main')
        .controller('stockBinController', stockBinController);

    stockBinController.$inject = ['$scope', '$location', 'appSession', 'abp.services.app.stockBin'];

    function stockBinController($scope, $location, appSession, stockBinService) {
        var vm = this;
        vm.title = 'Stock Bin Type';
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
              { name: 'BinName', field: 'binName' },
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


        vm.addNewStockBin = function () {
            abp.ui.setBusy(
                    null,
                    stockBinService.createStockBin(
                        vm.stockBin
                    ).success(function () {
                        abp.notify.info(abp.utils.formatString(localize("StockBinCreatedMessage"), vm.stockBin.binName));
                        activate();

                    })
                );
        };
        vm.deleteStockBin = function () {
            var data = {
                id: vm.selectedRowEntity.id
            };
            abp.ui.setBusy(
                    null,
                    stockBinService.deleteStockBin(
                    data
                    ).success(function () {
                        abp.notify.info(abp.utils.formatString(localize("StockBinDeletedMessage"), vm.stockBin.binName));
                        activate();

                    })
                );
        };

        vm.getStockBins = function () {
            abp.ui.setBusy( //Set whole page busy until getTasks complete
                    null,
                    stockBinService.getAllStockBins().success(function (data) {
                        vm.gridOptions.data = data.stockBins;
                    })
                );
        };

        vm.editSelectedRow = function () {
            vm.stockBin = vm.selectedRowEntity;
        }

        vm.updateStockBin = function () {
            abp.ui.setBusy(
                    null,
                    stockBinService.updateStockBin(
                        vm.stockBin
                    ).success(function () {
                        abp.notify.info(abp.utils.formatString(localize("StockBinUpdatedMessage"), vm.stockBin.binName));
                        activate();
                    })
                );
        };

        vm.saveStockBin = function () {
            if (vm.stockBin.id != 0) {
                vm.updateStockBin();
            }
            else {
                vm.addNewStockBin();
            }

        }

        activate();

        function activate() {
            vm.disableEdit = true;
            vm.stockBin = {
                id: 0,
                binName: '',
                creatorUserId: appSession.user.id
            };
            vm.getStockBins();
        }
    }
})();