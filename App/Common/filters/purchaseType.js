(function () {
    'use strict';

    angular
        .module('common')
        .filter('purchaseType', purchaseType);

    purchaseType.$inject = ['purchaseTypeFactory'];
    
    function purchaseType(purchaseTypeFactory) {
        return purchaseTypeFilter;

        function purchaseTypeFilter(input) {
            var data = purchaseTypeFactory.getData();
            return data[input].name;
        }
    }
})();