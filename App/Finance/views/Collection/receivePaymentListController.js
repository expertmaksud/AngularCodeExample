(function () {
    'use strict';

    angular
        .module('finance')
        .controller('receivePaymentListController', receivePaymentListController);

    receivePaymentListController.$inject = ['$scope', '$location', 'appSession', '$state', '$stateParams', 'abp.services.finance.paymentCollection'];

    function receivePaymentListController($scope, $location, appSession, $state, $stateParams, paymentCollectionService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Distribution Wise Received Payment List';

        var localize = abp.localization.getSource('SPMS');

        vm.getAllPaymentCollectionList = getAllPaymentCollectionList;

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
              { name: 'Sl', field: 'sl' },
              { name: 'DistributorId', field: 'distributorId', visible: false },
              { name: 'Distributor', field: 'distributorName' },
              { name: 'PaidAmount', field: 'paidAmount' },
              { name: 'PaymentMode', field: 'paymentModeName' },
              { name: 'PaymentModeDate', field: 'paymentModeDate' },
              { name: 'PaymentModeNumber', field: 'paymentModeNumber' },
              { name: 'BankName', field: 'bankName' },
              { name: 'BankBranch', field: 'bankBranch' }
            ],
            onRegisterApi: function (gridApi) {
                vm.myGridApi = gridApi;
                vm.myGridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    vm.disableEdit = false;
                    vm.selectedRowEntity = angular.copy(row.entity);
                });
            }
        };

        function getAllPaymentCollectionList() {
            abp.ui.setBusy(
                    null,
                    paymentCollectionService.getAllPaymentCollections().success(function (data) {
                        angular.forEach(data.paymentCollections, function (item, key) {
                            data.paymentCollections[key].sl = key + 1;
                        });
                        vm.gridOptions.data = data.paymentCollections;

                    })
                );
        };

        //vm.editSelectedRow = function () {

        //    var rowId = angular.copy(vm.selectedRowEntity.id);
        //    vm.disableEdit = true;
        //    $location.path('/productdistribution/confirm/' + rowId);
        //}

        activate();

        function activate() {
            vm.disableEdit = true;

            vm.getAllPaymentCollectionList();

        }
    }
})();