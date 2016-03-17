(function () {
    'use strict';

    angular
        .module('app')
        .controller('userWarehouseController', userWarehouseController);

    userWarehouseController.$inject = ['$location', '$state', '$stateParams', 'abp.services.app.warehouse', 'abp.services.app.user', 'abp.services.app.userWarehouse'];

    function userWarehouseController($location, $state, $stateParams, warehouseService, userService, userWarehouseService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Set Warehouse';
        vm.getUser = getUser;
        vm.getWareHouses = getWareHouses;
        vm.getUserWarehouse = getUserWarehouse;
        vm.addNew = addNew;
        vm.update = update;
        vm.save = save;

        function getWareHouses() {
            abp.ui.setBusy(
                    null,
                    warehouseService.getAllWarehouses().success(function (data) {
                        vm.wareHouses = data.warehouses;
                        vm.getUserWarehouse();
                    })
                );
        };

        function getUser() {
            var input = {
                userId: $stateParams.id
            };
            abp.ui.setBusy(
                 null,
                 userService.getUserById(input).success(function (data) {
                     vm.user = data;
                 })
             );
        }

        function getUserWarehouse() {
            var input = {
                userId: $stateParams.id
            };

            abp.ui.setBusy(
                 null,
                 userWarehouseService.getUserWarehouseByUser(input).success(function (data) {
                     vm.userWarehouse = data.userWarehouse;
                     vm.selectedWareHouse.id = vm.userWarehouse.warehouseId;
                 })
             );
        }
        function addNew() {
            var input = {
                userId: vm.user.id,
                warehouseId: vm.selectedWareHouse.id
            }

            abp.ui.setBusy(
                 null,
                 userWarehouseService.createUserWareHouse(input).success(function (data) {
                     abp.notify.info('Warehouse set for ' + vm.user.name + ' successfully', 'Set Warehouse');
                 })
             );

        }
        function update() {
            var input = {
                id: vm.userWarehouse.id,
                warehouseId: vm.selectedWareHouse.id
            }

            abp.ui.setBusy(
                 null,
                 userWarehouseService.updateUserWarehouse(input).success(function (data) {
                     abp.notify.info('Warehouse updated for ' + vm.user.name + ' successfully', 'Update Warehouse');
                 })
             );
        }
        function save() {
            
            if (vm.userWarehouse === null) {
                vm.addNew();
            } else {
                vm.update();
            }

            $location.path('/users');
        }

        activate();

        function activate() {
            vm.userWarehouse = {
                id: 0,
                userId: '',
                warehouseId: ''
            }
            vm.selectedWareHouse = { id: '' };

            vm.getUser();
            vm.getWareHouses();

        }
    }
})();
