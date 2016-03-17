(function () {
    'use strict';

    angular
        .module('common')
        .filter('productType', productType);

    productType.$inject = ['productTypeFactory'];

    function productType(productTypeFactory) {
        return productTypeFilter;

        function productTypeFilter(input) {
            var data = productTypeFactory.getData();
            return data[input].name;
        }
    }
})();