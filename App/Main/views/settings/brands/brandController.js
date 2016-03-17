(function () {
    'use strict';

    angular
        .module('main')
        .controller('brandController', brandController);

    brandController.$inject = ['$scope', '$location', 'appSession', 'abp.services.app.brand', 'productTypeFactory', 'productTypeFilter'];

    function brandController($scope, $location, appSession, brandService, productTypeFactory, productTypeFilter) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Brand';
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
              { name: 'BrandCode', field: 'brandCode' },
              { name: 'BrandName', field: 'brandName' },
              //{ name: 'BrandType', field: 'brandType', cellFilter: 'productType' },
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

        vm.addNewBrand = function () {
            //vm.brand.brandType = vm.selectedBrandType.id;
            abp.ui.setBusy(
                    null,
                    brandService.createBrand(
                        vm.brand
                    ).success(function () {
                        abp.notify.info(abp.utils.formatString(localize("BrandCreatedMessage"), vm.brand.brandName));
                        activate();
                        //$location.path('/brands');
                    })
                );
        };

        vm.getBrands = function () {
            abp.ui.setBusy( //Set whole page busy until getTasks complete
                    null,
                    brandService.getAllBrands().success(function (data) {
                        vm.gridOptions.data = data.brands;
                    })
                );
        };

        vm.editSelectedRow = function () {
            //vm.brand = {};
            $scope.newBrandForm.$setPristine();
            vm.brand = vm.selectedRowEntity;
            vm.selectedBrandType.id = vm.brand.brandType;
        }

        vm.updateBrand = function () {
            //if (vm.selectedBrandType.id != undefined) {
            //    vm.brand.brandType = vm.selectedBrandType.id;
            //}
            //else {
            //    vm.brand.brandType = vm.selectedBrandType;
            //}
            abp.ui.setBusy(
                    null,
                    brandService.updateBrand(
                        vm.brand
                    ).success(function () {
                        abp.notify.info(abp.utils.formatString(localize("BrandUpdatedMessage"), vm.brand.brandName));
                        activate();
                        //$location.path('/brands');
                    })
                );
        };

        vm.saveBrand = function () {
            if (vm.brand.id != 0) {
                vm.updateBrand();
            }
            else {
                vm.addNewBrand();
            }
        }

        activate();

        function activate() {
            vm.disableEdit = true;
            vm.brand = {
                id: 0,
                brandCode: '',
                brandName: '',
                brandType: '',
                creatorUserId: appSession.user.id
            };
            //vm.brandType = productTypeFactory.getData();
            //vm.selectedBrandType = {
            //    id: ''
            //};
            vm.getBrands();
        }
    }
})();