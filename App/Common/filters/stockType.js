(function () {
    'use strict';

    angular
        .module('common')
        .filter('stockType', stockType);

    stockType.$inject = ['stockTypeFactory'];
    
    function stockType(stockTypeFactory) {
        return stockTypeFilter;

        function stockTypeFilter(input) {
            var data = stockTypeFactory.getData();
            return data[input].name;
        }
    }
})();