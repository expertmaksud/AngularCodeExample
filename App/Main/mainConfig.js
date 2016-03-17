(function () {
    'use strict';

    angular
        .module('main')
        .config(configure);

    configure.$inject = ['$stateProvider', '$urlRouterProvider'];


    function configure($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: '/App/Main/views/home/home.cshtml',
                menu: 'Home' //Matches to name of 'Home' menu in SPMSNavigationProvider
            })
        if (abp.auth.hasPermission('Settings')) {
            $stateProvider
           .state('freights', {
               url: '/freights',
               templateUrl: '/App/Main/views/settings/freights/freights.cshtml',
               menu: 'Freights'
           })
           .state('brands', {
               url: '/brands',
               templateUrl: '/App/Main/views/settings/brands/brands.cshtml',
               menu: 'Brands'
           })
           .state('zones', {
               url: '/zones',
               templateUrl: '/App/Main/views/settings/zones/Zones.cshtml',
               menu: 'Zones'
           })

           .state('productGrades', {
               url: '/productGrades',
               templateUrl: '/App/Main/views/settings/productGrades/ProductGrades.cshtml',
               menu: 'ProductGrades'
           })
           .state('productCategories', {
               url: '/productCategories',
               templateUrl: '/App/Main/views/settings/productcategories/ProductCategories.cshtml',
               menu: 'ProductCategories'
           })
           .state('vendors', {
               url: '/vendors',
               templateUrl: '/App/Main/views/settings/vendors/vendors.cshtml',
               menu: 'Vendors'
           })
           .state('productUnits', {
               url: '/ProductUnits',
               templateUrl: '/App/Main/views/settings/productunits/ProductUnits.cshtml',
               menu: 'ProductUnits'
           })
           .state('unitConversions', {
               url: '/UnitConversions',
               templateUrl: '/App/Main/views/settings/unitConversions/UnitConversion.cshtml',
               menu: 'UnitConversions'
           })
           .state('rawMaterialTypes', {
               url: '/RawMaterialTypes',
               templateUrl: '/App/Main/views/settings/rawmaterialtypes/RawMaterialTypes.cshtml',
               menu: 'RawMaterialTypes'
           })
           .state('productApis', {
               url: '/ProductApis',
               templateUrl: '/App/Main/views/settings/productapis/ProductApis.cshtml',
               menu: 'ProductApis'
           })
           .state('distributors', {
               url: '/Distributors',
               templateUrl: '/App/Main/views/settings/distributors/Distributors.cshtml',
               menu: 'Distributors'
           })
           .state('rawMaterials', {
               url: '/RawMaterials',
               templateUrl: '/App/Main/views/settings/rawmaterials/RawMaterials.cshtml',
               menu: 'RawMaterials'
           })
           .state('finishProducts', {
               url: '/FinishProducts',
               templateUrl: '/App/Main/views/settings/finishproducts/finishProductList.cshtml',
               menu: 'FinishProducts'
           })
           .state('packagingItems', {
               url: '/PackagingItems',
               templateUrl: '/App/Main/views/settings/PackagingItems/PackagingItemsList.cshtml',
               menu: 'PackagingItems'
           })
           .state('newPackagingItem', {
               url: '/PackagingItem/new',
               templateUrl: '/App/Main/views/settings/PackagingItems/PackagingItemAdd.cshtml',
               menu: 'newPackagingItem'
           })
           .state('packagingItemDetails', {
               url: '/PackagingItem/detail/:id',
               templateUrl: '/App/Main/views/settings/PackagingItems/PackagingItemDetails.cshtml',
               menu: 'PackagingItemDetails',
               data: {
                   action: "detail"
               }
           })
           .state('otherProducts', {
               url: '/OtherProducts',
               templateUrl: '/App/Main/views/settings/OtherProducts/OtherProductsList.cshtml',
               menu: 'OtherProducts'
           })
           .state('newOtherProduct', {
               url: '/OtherProduct/new',
               templateUrl: '/App/Main/views/settings/OtherProducts/OtherProduct.cshtml',
               menu: 'newOtherProduct'
           })
           .state('otherProductDetails', {
               url: '/OtherProduct/detail/:id',
               templateUrl: '/App/Main/views/settings/OtherProducts/OtherProductDetails.cshtml',
               menu: 'OtherProductDetails',
               data: {
                   action: "detail"
               }
           })
           .state('newFinishProduct', {
               url: '/FinishProduct/new',
               templateUrl: '/App/Main/views/settings/finishproducts/FinishProductWithFormula.cshtml',
               menu: 'newFinishProducts'
           })
           .state('warehouses', {
               url: '/Warehouses',
               templateUrl: '/App/Main/views/settings/warehouses/Warehouses.cshtml',
               menu: 'Warehouses'
           })
           .state('stockbins', {
               url: '/Stockbins',
               templateUrl: '/App/Main/views/settings/StockBins/StockBins.cshtml',
               menu: 'Stockbins'
           })
           .state('finishProductDetails', {
               url: '/finishproduct/detail/:id',
               templateUrl: '/App/Main/views/settings/finishproducts/finishProductDetails.cshtml',
               menu: 'FinishProductDetails',
               data: {
                   action: "detail"
               }
           })
        }
        if (abp.auth.hasPermission('Administration')) {
            $stateProvider
            .state('manageUser', {
                url: '/users',
                templateUrl: '/App/Main/views/administration/users/users.cshtml',
                menu: 'ManageUser'
            })
                 .state('createUser', {
                     url: '/users/new',
                     templateUrl: '/App/Main/views/administration/users/new.cshtml',
                     menu: 'CreateUser'
                 })
            .state('manageRole', {
                url: '/roles',
                templateUrl: '/App/Main/views/administration/roles/roles.cshtml',
                menu: 'ManageRole'
            })
              .state('setUserWarehouse', {
                  url: '/userwarehouse/:id',
                  templateUrl: '/App/Main/views/administration/users/userWarehouse.cshtml',
                  menu: 'setUserWarehouse'
              })
        .state('editUser', {
            url: '/users/edit/:id',
            templateUrl: '/App/Main/views/administration/users/edit.cshtml',
            menu: 'EditUser',
            data: {
                action: "edit"
            }
        })
        .state('addRole', {
            url: '/roles/new',
            templateUrl: '/App/Main/views/administration/roles/new.cshtml',
            menu: 'AddRole',
            data: {
                action: "add"
            }
        })
        .state('editRole', {
            url: '/roles/edit/:id',
            templateUrl: '/App/Main/views/administration/roles/edit.cshtml',
            menu: 'EditRole',
            data: {
                action: "edit"
            }
        })
        .state('editPermission', {
            url: '/roles/permission/:id',
            templateUrl: '/App/Main/views/administration/roles/permissions.cshtml',
            menu: 'EditPermission',
            data: {
                action: "permission"
            }
        })
             .state('employees', {
                 url: '/employees',
                 templateUrl: '/App/Main/views/settings/employees/Employees.cshtml',
                 menu: 'Employees'
             })
        }
    }
})();