(function () {
    'use strict';

    angular
        .module('common')
        .factory('rawMaterialTypeFactory', rawMaterialTypeFactory);

    rawMaterialTypeFactory.$inject = ['$http'];

    function rawMaterialTypeFactory($http) {
        var service = {
            getData: getData
        };

        return service;

        function getData() {
            var rawMaterialTypes = [{ id: '0', name: 'Additive' },
                                { id: '1', name: 'Base Oil' }];
            return rawMaterialTypes;
        }
    }
})();