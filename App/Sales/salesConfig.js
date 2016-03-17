(function () {
    'use strict';

    angular
        .module('sales')
        .config(configure);

    configure.$inject = ['$stateProvider', '$urlRouterProvider'];

    function configure($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        if (abp.auth.hasPermission('SalesManagement.CreateRequisition')) {
            $stateProvider
                .state('createSales', {
                    url: '/sales/requisitions/',
                    templateUrl: '/App/Sales/views/newrequisition.cshtml',
                    menu: 'CreateSales'
                })

        }
        if (abp.auth.hasPermission('SalesManagement.SalesRequisitions')) {
            $stateProvider
            .state('salesRequisitionList', {
                url: '/sales/requisitionlist',
                templateUrl: '/App/Sales/views/salesRequisitionList.cshtml',
                menu: 'salesRequisitionList',
                data: {
                    action: 'requisitionList'
                }
            })
            .state('editsalesRequisition', {
                url: '/sales/requisitions/:id',
                templateUrl: '/App/Sales/views/editRequisition.cshtml',
                menu: 'editsalesRequisition',
                data: {
                    action: "edit"
                }
            })
            .state('salesRequisitionDetails', {
                url: '/sales/requisiondetail/:id',
                templateUrl: '/App/Sales/views/requisitionDetails.cshtml',
                menu: 'salesRequisitionDetails',
                data: {
                    action: "detail"
                }
            })
        }
        if (abp.auth.hasPermission('SalesManagement.SalesList')) {
            $stateProvider
             .state('salesList', {
                 url: '/sales/list',
                 templateUrl: '/App/Sales/views/salesRequisitionList.cshtml',
                 menu: 'SalesList',
                 data: {
                     action: 'approvedList'
                 }
             })
             .state('editSalesDetiails', {
                 url: '/sales/items/edit/:id',
                 templateUrl: '/App/Sales/views/approved/editSales.cshtml',
                 menu: 'EditSalesDetiails'
             })
        }
        if (abp.auth.hasPermission('SalesManagement.SecondLevelApproval')) {
            $stateProvider
             .state('salesSecondApprovedList', {
                 url: '/sales/senior/list',
                 templateUrl: '/App/Sales/views/salesRequisitionList.cshtml',
                 menu: 'salesSecondApprovedList',
                 data: {
                     action: 'seniorApproveRequired'
                 }
             })
            .state('salesSecondLevelApprove', {
                url: '/sales/approvesecond/:id',
                templateUrl: '/App/Sales/views/approvedSecond/approveSale.cshtml',
                data: {
                    action: "2ndLevelApprove"
                }
            })
        }
        if (abp.auth.hasPermission('SalesManagement.PendingRequisitions')) {
            $stateProvider
                .state('pendingRequisitions', {
                    url: '/sales/pending/requisitions',
                    templateUrl: '/App/Sales/views/salesRequisitionList.cshtml',
                    menu: 'pendingRequisitions',
                    data: {
                        action: "pending"
                    }
                })
                
                .state('salesRequitionApprove', {
                    url: '/sales/approverequisition/:id',
                    templateUrl: '/App/Sales/views/pending/approveRequisition.cshtml',
                    menu: 'SalesRequitionApprove',
                    data: {
                        action: "approve"
                    }
                })

        }
    }
})();
