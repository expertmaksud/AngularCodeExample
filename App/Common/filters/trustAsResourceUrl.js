(function () {
    'use strict';

    angular
        .module('common')
        .filter('trustAsResourceUrl', trustAsResourceUrl);

    trustAsResourceUrl.$inject = ['$sce'];
    function trustAsResourceUrl($sce) {
        return trustAsResourceUrlFilter;

        function trustAsResourceUrlFilter(input) {
            return $sce.trustAsResourceUrl(input);
        }
    }
})();