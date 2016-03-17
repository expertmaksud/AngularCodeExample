(function () {
    'use strict';
   
    angular
        .module('sales')
        .controller('salesListController', salesListController);

    salesListController.$inject = ['$scope', '$location',  'abp.services.sales.sale'];

    function salesListController($scope, $location, salesService) {
        var vm = this;
       
        var localize = abp.localization.getSource('SPMS');
        
            vm.title = 'Sales List';
            vm.gridOptions = {
                enableSorting: true,
                enableRowSelection: true,
                showSelectionCheckbox: true,
                enableSelectAll: false,
                multiSelect: false,
                enableCellEdit: false,
                columnDefs: [
                  { name: 'SL#', field: 'sl' },
                  { name: 'id', field: 'id',visible:false },
                  { name: 'distributor', field: 'distributorId' },
                  { name: 'paymentMode', field: 'paymentMode' },
                  { name: 'creditDays', field: 'creditDays' },
                  { name: 'Sernior Approval', field: 'approvalRequireBySeniorManagement' },
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

            vm.getSalesList = function () {
                abp.ui.setBusy(
                        null,
                        salesService.getAllSales().success(function (data) {
                            angular.forEach(data.sales, function (item, key) {
                                data.sales[key].sl = key + 1;
                            });
                            vm.gridOptions.data = data.sales
                            
                        })
                    );
            };


            vm.editSelectedRow = function () {
                var salesId = angular.copy(vm.selectedRowEntity.id);
                $location.path('/sales/items/edit/' + salesId);
            }
            vm.displayDetails = function () {
                var salesId = angular.copy(vm.selectedRowEntity.id);
                 $location.path('/sales/requisiondetail/' + salesId);
            }

        activate();

        function activate() {
            vm.getSalesList();
            vm.disableEdit = true;
        }
    };
    
    
})();



