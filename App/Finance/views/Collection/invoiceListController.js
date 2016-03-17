(function () {
    'use strict';

    angular
        .module('finance')
        .controller('invoiceListController', invoiceListController);

    invoiceListController.$inject = ['$scope', '$location', 'appSession', '$state', '$stateParams', 'abp.services.finance.invoice', 'uiGridConstants'];

    function invoiceListController($scope, $location, appSession, $state, $stateParams, invoiceService, uiGridConstants) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Invoice List';

        var localize = abp.localization.getSource('SPMS');

        vm.getAllInvoiceList = getAllInvoiceList;
        vm.details = details;

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
              { name: 'SaleId', field: 'saleId', visible: false },
              { name: 'Sl', field: 'sl' },              
              { name: 'Distributor', field: 'distributorName' },
              { name: 'InvoiceNumber', field: 'invoiceNumber' },
              { name: 'InvoiceAmount', field: 'invoiceAmount', aggregationType: uiGridConstants.aggregationTypes.sum },
              { name: 'PaidAmount', field: 'paidAmount', aggregationType: uiGridConstants.aggregationTypes.sum },
              { name: 'InvoiceDate', field: 'invoiceDate' }             
            ],
            onRegisterApi: function (gridApi) {
                vm.myGridApi = gridApi;
                vm.myGridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    vm.disableEdit = false;
                    vm.selectedRowEntity = angular.copy(row.entity);
                });
            }
        };

        function getAllInvoiceList() {
            abp.ui.setBusy(
                    null,
                    invoiceService.getAllInvoices().success(function (data) {
                        angular.forEach(data.invoices, function (item, key) {
                            data.invoices[key].sl = key + 1;
                        });
                        vm.gridOptions.data = data.invoices;

                    })
                );
        };

        function details() {
            var rowId = angular.copy(vm.selectedRowEntity.id);
            vm.disableEdit = true;
            $location.path('/invoice/' + rowId);
        };

        activate();

        function activate() {
            vm.disableEdit = true;

            vm.getAllInvoiceList();

        }
    }
})();