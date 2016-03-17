(function () {
    'use strict';

    angular
        .module('main')
        .controller('otherProductController', otherProductController);

    otherProductController.$inject = ['$scope', '$location', 'appSession', '$state', '$stateParams', 'abp.services.app.finishProduct', 'abp.services.app.finishProductFormula', 'abp.services.app.productGrade',
        'abp.services.app.rawMaterial', 'abp.services.app.productApi', 'abp.services.app.productCategory', 'abp.services.app.productUnit', 'abp.services.app.brand', 'uiGridConstants', 'abp.services.app.product'];

    function otherProductController($scope, $location, appSession, $state, $stateParams, finishProductService, finishProductFormulaService, productGradeService,
        rawMaterialService, productApiService, productCategoryService, productUnitService, brandService, uiGridConstants, productService) {
        var vm = this;
        vm.title = 'Packaging Item';
        var localize = abp.localization.getSource('SPMS');

        vm.addNewOtherProduct = function () {
            vm.product.brandId = vm.selectedBrand.id;
            vm.product.productGradeId = vm.selectedProductGrade.id;
            vm.product.productApiId = vm.selectedProductApi.id;
            vm.product.productCategoryId = vm.selectedProductCategory.id;
            vm.product.productUnitId = vm.selectedProductUnit.id;
            vm.product.productType = 3;

            abp.ui.setBusy(
                    null,
                    productService.createOtherProduct(
                        vm.product
                    ).success(function () {
                        abp.notify.info(abp.utils.formatString(localize("/OtherProductCreatedMessage"), vm.product.productName));
                        $location.path('/OtherProducts');

                    })
                );
        };

        vm.getProductGrades = function () {
            abp.ui.setBusy(
                    null,
                    productGradeService.getAllProductGrades().success(function (data) {
                        vm.productGrades = data.productGrades;
                    })
                );
        };

        vm.getProductApis = function () {
            abp.ui.setBusy(
                    null,
                    productApiService.getAllProductApis().success(function (data) {
                        vm.productApis = data.productApis;
                    })
                );
        };

        vm.getProductCategories = function () {
            abp.ui.setBusy(
                    null,
                    productCategoryService.getAllProductCategories().success(function (data) {
                        vm.productCategories = data.productCategories;
                    })
                );
        };

        vm.getProductUnits = function () {
            abp.ui.setBusy(
                    null,
                    productUnitService.getAllProductUnits().success(function (data) {
                        vm.productUnits = data.productUnits;
                    })
                );
        };

        vm.getBrands = function () {

            abp.ui.setBusy(
                    null,
                    brandService.getAllBrands().success(function (data) {
                        vm.brands = data.brands;
                    })
                );
        };

        vm.getProductDetailsById = function (id) {
            var data = {
                id: id
            };
            abp.ui.setBusy(
                    null,
                    productService.getProductDetailsById(data).success(function (data) {

                        vm.product = data.product;

                        vm.selectedBrand.id = vm.product.brandId;
                        vm.selectedProductGrade.id = vm.product.productGradeId;
                        vm.selectedProductApi.id = vm.product.productApiId;
                        vm.selectedProductCategory.id = vm.product.productCategoryId;
                        vm.selectedProductUnit.id = vm.product.productUnitId;
                    })
                );
        };

        activate();

        function activate() {
            vm.disableEdit = true;
            vm.disableSaveNew = true;
            //vm.disableAddToGrid = true;

            vm.product = {
                id: 0,
                productType: '',
                brandId: '',
                productName: '',
                productGradeId: '',
                productApiId: '',
                productCategoryId: '',
                productUnitId: '',
                packSize: '',
                multiplier: '',
                mrp: '',
                reOrderPoint: '',
                model: '',
                sizeGroup: '',
                color: '',
                origin: '',
                creatorUserId: appSession.user.id
            };

            vm.productGrades = {};
            vm.selectedProductGrade = {
                id: ''
            };

            vm.productApis = {};
            vm.selectedProductApi = {
                id: ''
            };

            vm.productCategories = {};
            vm.selectedProductCategory = {
                id: ''
            };

            vm.productUnits = {};
            vm.selectedProductUnit = {
                id: ''
            };

            vm.brands = {};
            vm.selectedBrand = {
                id: ''
            };

            vm.getProductUnits();
            vm.getProductGrades();
            vm.getProductApis();
            vm.getProductCategories();
            vm.getBrands();

            if ($state.current.data != undefined) {
                if ($state.current.data.action === 'edit' || $state.current.data.action === 'detail') {
                    vm.getProductDetailsById($stateParams.id);
                }
            }

        }
    }
})();