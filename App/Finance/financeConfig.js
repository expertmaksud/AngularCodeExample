(function () {
    'use strict';

    angular
        .module('finance')
        .config(configure);

    configure.$inject = ['$stateProvider', '$urlRouterProvider'];

    function configure($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        
        $stateProvider
        .state('receivedPaymentList', {
           url: '/Finance/ReceivedPaymentList',
           templateUrl: '/App/Finance/views/Collection/ReceivePaymentList.cshtml',
           menu: 'ReceivedPaymentList'
        })
        .state('receivePayment', {
            url: '/Finance/ReceivePayment',
            templateUrl: '/App/Finance/views/Collection/ReceivePayment.cshtml',
            menu: 'ReceivePayment'
        })
        .state('invoiceList', {
            url: '/Finance/InvoiceList',
            templateUrl: '/App/Finance/views/Collection/InvoiceList.cshtml',
            menu: 'InvoiceList'
        })
        .state('invoice', {
            url: '/invoice/:id',
            templateUrl: '/App/Finance/views/Collection/invoice.cshtml',
            menu: 'Invoice'
        })
    }
})();
