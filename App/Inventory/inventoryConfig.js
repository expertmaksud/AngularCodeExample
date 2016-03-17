(function () {
    'use strict';

    angular
        .module('inventory')
        .config(configure);

    configure.$inject = ['$stateProvider', '$urlRouterProvider'];

    function configure($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        if (abp.auth.hasPermission('InventoryManagement.StockReceive')) {
            $stateProvider
                .state('stockReceive', {
                    url: '/stock/openpurchases',
                    templateUrl: '/App/Inventory/views/stocks/purchases.cshtml',
                    menu: 'StockReceive'
                })
                .state('addStock', {
                    url: '/stock/add/:id',
                    templateUrl: '/App/Inventory/views/stocks/addStock.cshtml',
                    menu: 'AddStock',
                    data: {
                        action: "add"
                    }
                })
                .state('stockDetails', {
                    url: '/stock/details/:id',
                    templateUrl: '/App/Inventory/views/stocks/stockDetails.cshtml',
                    menu: 'StockDetails',
                    data: {
                        action: "details"
                    }
                })
        }
        if (abp.auth.hasPermission('InventoryManagement.OpenRequisition')) {
            $stateProvider
            .state('openRequisitionList', {
                url: '/product/openrequisitionlist',
                templateUrl: '/App/Inventory/views/productionRequisition/productRequisitionList.cshtml',
                menu: 'OpenRequisitionList'
            })
            .state('confirmRequisition', {
                url: '/productrequisition/confirm/:id',
                templateUrl: '/App/Inventory/views/productionRequisition/confirmProductRequisition.cshtml',
                menu: 'ConfirmRequisition',
                data: {
                    action: "add"
                }
            })
        }
        if (abp.auth.hasPermission('InventoryManagement.CompletedProduction')) {
            $stateProvider
            .state('completedProductionList', {
                url: '/production/completedlist',
                templateUrl: '/App/Inventory/views/production/completedProductionList.cshtml',
                menu: 'CompletedProductionList'
            })

            .state('receiveFinishProduct', {
                url: '/finishProductConfirm/receive/:id',
                templateUrl: '/App/Inventory/views/production/receiveFinishProduct.cshtml',
                menu: 'ReceiveFinishProduct'
            })

        }
        if (abp.auth.hasPermission('InventoryManagement.ConfirmDeliveryOrder')) {
            $stateProvider
           .state('confirmDeliveryOrderList', {
               url: '/inventory/confirmdolist',
               templateUrl: '/App/Inventory/views/Distribution/confirmDeliveryOrderList.cshtml',
               menu: 'ConfirmDeliveryOrderList'
           })
            .state('confirmProductDistribution', {
                url: '/productdistribution/confirm/:id',
                templateUrl: '/App/Inventory/views/Distribution/confirmDistribution.cshtml',
                menu: 'ConfirmProductDistribution'
            })
           .state('printChalan', {
               url: '/chalan/:id',
               templateUrl: '/App/Inventory/views/Distribution/deliveryChallan.cshtml',
               menu: 'printChalan'
           })
            .state('deliveryChalans', {
                url: '/inventory/chalans',
                templateUrl: '/App/Inventory/views/Distribution/deliveryChallanList.cshtml',
                menu: 'DCList'
            })
        }
        $stateProvider
       .state('productStock', {
           url: '/inventory/productstock',
           templateUrl: '/App/Inventory/views/stocks/ProductStock.cshtml',
           menu: 'ProductStock'
       })

    }
})();