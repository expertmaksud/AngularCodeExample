(function () {
    'use strict';

    angular
        .module('production')
        .config(configure);

    configure.$inject = ['$stateProvider', '$urlRouterProvider'];

    function configure($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        if (abp.auth.hasPermission('ProductionManagement.NewProductRequisition')) {
            $stateProvider
                .state('newProductRequisition', {
                    url: '/product/requisition',
                    templateUrl: '/App/Production/views/finishproductrequisition/finishProductRequisition.cshtml',
                    menu: 'ProductRequisition'
                })
               .state('productRequisitionList', {
                   url: '/product/requisitionlist',
                   templateUrl: '/App/Production/views/finishproductrequisition/finishProductRequisitionList.cshtml',
                   menu: 'ProductRequisitionList'
               })
        }
        if (abp.auth.hasPermission('ProductionManagement.ApproveRequisition')) {
            $stateProvider
           .state('confirmProductRequisitionList', {
               url: '/product/confirmRequisitionList',
               templateUrl: '/App/Production/views/ReceiveProductRequisition/confirmProductRequisitionList.cshtml',
               menu: 'ConfirmProductRequisitionList'
           })
        }
        if (abp.auth.hasPermission('ProductionManagement.ConfirmProduction')) {
            $stateProvider
            .state('receiveRawMaterial', {
                url: '/productRequision/receive/:id',
                templateUrl: '/App/Production/views/ReceiveProductRequisition/receiveRawMaterial.cshtml',
                menu: 'ReceiveRawMaterial'
            })
            .state('confirmProduction', {
                url: '/confirmProduction/:id',
                templateUrl: '/App/Production/views/ReceiveProductRequisition/confirmProduction.cshtml',
                menu: 'ConfirmProduction'
            })
        }
    }
})();