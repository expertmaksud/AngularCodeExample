(function () {
    'use strict';

    angular
        .module('main')
        .controller('distributorController', distributorController);

    distributorController.$inject = ['$scope', '$location', 'appSession', 'abp.services.app.distributor', 'abp.services.app.zone'];

    function distributorController($scope, $location, appSession, distributorService, zoneService) {
        var vm = this;
        vm.title = 'Distributor';
        vm.getZones = getZones;

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
              { name: 'Code', field: 'distributorCode' },
              { name: 'Name', field: 'distributorName' },
              { name: 'CreditLimit', field: 'creditLimit' },
              { name: 'City', field: 'distributorCity' },
              { name: 'ContactPerson', field: 'distributorContactPerson' },
              { name: 'MobileNumber', field: 'distributorMobileNumber' },
              { name: 'PreviousDue', field: 'previousDueAmount' },
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


        vm.addNewDistributor = function () {
            vm.distributor.zoneId = vm.selectedZone.id;
            abp.ui.setBusy(
                    null,
                    distributorService.createDistributor(
                        vm.distributor
                    ).success(function () {
                        abp.notify.info(abp.utils.formatString(localize("DistributorCreatedMessage"), vm.distributor.distributorName));
                        activate();

                    })
                );
        };
        vm.deleteDistributor = function () {
            var data = {
                id: vm.selectedRowEntity.id
            };
            abp.ui.setBusy(
                    null,
                    distributorService.deleteDistributor(
                    data
                    ).success(function () {
                        abp.notify.info(abp.utils.formatString(localize("DistributorDeletedMessage"), vm.distributor.distributorName));
                        activate();

                    })
                );
        };

        vm.getDistributors = function () {
            abp.ui.setBusy( //Set whole page busy until getTasks complete
                    null,
                    distributorService.getAllDistributors().success(function (data) {
                        vm.gridOptions.data = data.distributors;
                    })
                );
        };

        function getZones() {
            abp.ui.setBusy(
                    null,
                    zoneService.getAllZones().success(function (data) {
                        vm.zones = data.zones;
                    })
                );
        };

        vm.editSelectedRow = function () {
            vm.distributor = vm.selectedRowEntity;
            vm.selectedZone.id = vm.distributor.zoneId;
        }

        vm.updateDistributor = function () {
            vm.distributor.zoneId = vm.selectedZone.id;
            abp.ui.setBusy(
                    null,
                    distributorService.updateDistributor(
                        vm.distributor
                    ).success(function () {
                        abp.notify.info(abp.utils.formatString(localize("DistributorUpdatedMessage"), vm.distributor.distributorName));
                        activate();
                    })
                );
        };

        vm.saveDistributor = function () {
            if (vm.distributor.id != 0) {
                vm.updateDistributor();
            }
            else {
                vm.addNewDistributor();
            }

        }

        activate();

        function activate() {
            vm.disableEdit = true;
            vm.distributor = {
                id: 0,
                distributorCode: '',
                distributorName: '',
                distributorCity: '',
                creditLimit:'',
                distributorContactPerson: '',
                distributorMobileNumber: '',
                previousDueAmount:'',
                creatorUserId: appSession.user.id
            };

            vm.selectedZone = {
                id: ''
            };

            vm.getDistributors();
            vm.getZones();
        }
    }
})();