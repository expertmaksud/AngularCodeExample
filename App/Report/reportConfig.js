(function () {
    'use strict';

    angular
        .module('report')
        .config(configure);

    configure.$inject = ['$stateProvider', '$urlRouterProvider'];

    function configure($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('purchaseReports', {
                url: '/report/purchase',
                templateUrl: '/App/Report/views/reports/purchaseReport.cshtml',
                menu: 'PurchaseReport'
            })
           

    }

})();