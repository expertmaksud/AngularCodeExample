(function () {
    'use strict';

    angular
        .module('common')
        .factory('paymentModeFactory', paymentModeFactory);

    paymentModeFactory.$inject = ['$http'];

    function paymentModeFactory($http) {
        var service = {
            getData: getData
        };

        return service;

        function getData() {
            var paymentMode = [
                { id: '0', name: 'CASH' },
                { id: '1', name: 'CHEQUE' },
                { id: '2', name: 'PAYORDER' },
                { id: '3', name: 'DEMANDDRAFT' },
                { id: '4', name: 'BANKTRANSFER' }
            ];
            
            return paymentMode;
        }
    }
})();