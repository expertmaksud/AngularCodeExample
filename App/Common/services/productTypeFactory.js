(function () {
    'use strict';

    angular
        .module('common')
        .factory('productTypeFactory', productTypeFactory);

    productTypeFactory.$inject = ['$http'];

    function productTypeFactory($http) {
        var service = {
            getData: getData
        };

        return service;

        function getData() {
            var productType = [{ id: '0', name: 'Raw Material' },
                        { id: '1', name: 'Finish Product' },
                        { id: '2', name: 'Packaging' },
                        { id: '3', name: 'Other Product' }];
            return productType;
        }
    }
})();