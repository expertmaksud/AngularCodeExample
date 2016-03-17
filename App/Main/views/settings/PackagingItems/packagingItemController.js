(function () {
    'use strict';

    angular
        .module('main')
        .controller('packagingItemController', packagingItemController);

    packagingItemController.$inject = ['$scope', '$location', 'appSession', '$state', '$stateParams', 'abp.services.app.finishProduct', 'abp.services.app.finishProductFormula', 'abp.services.app.productGrade',
        'abp.services.app.rawMaterial', 'abp.services.app.productApi', 'abp.services.app.productCategory', 'abp.services.app.productUnit', 'abp.services.app.brand', 'uiGridConstants', 'abp.services.app.product'];

    function packagingItemController($scope, $location, appSession, $state, $stateParams, finishProductService, finishProductFormulaService, productGradeService,
        rawMaterialService, productApiService, productCategoryService, productUnitService, brandService, uiGridConstants, productService) {
        var vm = this;
        vm.title = 'Packaging Item';
        var localize = abp.localization.getSource('SPMS');

        vm.addNewPackagingItem = function () {
            vm.product.brandId = vm.selectedBrand.id;
            vm.product.productGradeId = vm.selectedProductGrade.id;
            vm.product.productApiId = vm.selectedProductApi.id;
            vm.product.productCategoryId = vm.selectedProductCategory.id;
            vm.product.productUnitId = vm.selectedProductUnit.id;
            vm.product.productType = 2;

            abp.ui.setBusy(
                    null,
                    productService.createOtherProduct(
                        vm.product
                    ).success(function () {
                        abp.notify.info(abp.utils.formatString(localize("/PackagingItemCreatedMessage"), vm.product.productName));
                        $location.path('/PackagingItems');

                    })
                );
        };        

        //vm.deletePackagingItem = function () {
        //    var data = {
        //        id: vm.selectedRowEntity.id
        //    };
        //    abp.ui.setBusy(
        //            null,
        //            finishProductService.deleteFinishProduct(
        //            data
        //            ).success(function () {
        //                abp.notify.info(abp.utils.formatString(localize("FinishProductDeletedMessage"), vm.finishProduct.productName));
        //                activate();

        //            })
        //        );
        //};

        //vm.getFinishProducts = function () {
        //    abp.ui.setBusy(
        //            null,
        //            finishProductService.getAllFinishProducts().success(function (data) {
        //                //vm.gridOptions.data = data.finishProducts;
        //            })
        //        );
        //};

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

        //vm.getFinishProductTypeBrands = function () {
        //    var data = {
        //        "brandType": 1
        //    };

        //    abp.ui.setBusy(
        //            null,
        //            brandService.getBrandsByBrandType(data).success(function (data) {
        //                vm.brands = data.brands;
        //            })
        //        );
        //};

        vm.getBrands = function () {

            abp.ui.setBusy(
                    null,
                    brandService.getAllBrands().success(function (data) {
                        vm.brands = data.brands;
                    })
                );
        };

        //vm.saveFinishProduct = function () {
        //    if (vm.finishProduct.id != 0) {
        //        vm.updateFinishProduct();
        //    }
        //    else {
        //        vm.addNewFinishProductWithFormula();
        //    }

        //};

        vm.getProductDetailsById = function (id) {
            var data = {
                id: id
            };
            abp.ui.setBusy(
                    null,
                    productService.getProductDetailsById(data).success(function (data) {

                        vm.product= data.product;

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

            vm.product= {
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
                origin:'',
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
            //vm.getFinishProductTypeBrands();
            //vm.getFinishProducts();

            if ($state.current.data != undefined) {
                if ($state.current.data.action === 'edit' || $state.current.data.action === 'detail') {
                    vm.getProductDetailsById($stateParams.id);
                }
            }

        }
    }
})();