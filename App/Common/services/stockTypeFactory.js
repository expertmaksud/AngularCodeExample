(function () {
    'use strict';

    angular
        .module('common')
        .factory('stockTypeFactory', stockTypeFactory);

    stockTypeFactory.$inject = ['$http', 'abp.services.app.stockBin'];

    function stockTypeFactory($http, stockBinService) {
        var service = {
            getData: getData
        };

        return service;

        function getData() {
            var stockTypeObj = {};

            stockTypeObj = stockBinService.getAllStockBins();

            return stockTypeObj;

        }
    }
})();