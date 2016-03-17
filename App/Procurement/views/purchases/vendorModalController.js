(function () {
    'use strict';

    angular
        .module('app')
        .controller('vendorModalController', vendorModalController);

    vendorModalController.$inject = ['$filter', 'abp.services.app.vendor', '$modalInstance'];

    function vendorModalController($filter, vendorService, $modalInstance) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'vendorModalController';
        vm.saveVendor = saveVendor;
        vm.cancel = cancel;

        function saveVendor() {
            var vendorData;
            abp.ui.setBusy(
                    null,
                    vendorService.createVendor(
                       $scope.vm.vendor
                    ).success(function () {
                        abp.notify.info(abp.utils.formatString("VendorCreatedMessage", $scope.vm.vendor.vendorName));
                        vendorService.getAllVendors().success(function (data) {
                            $modalInstance.close(data, $scope.vm.selectedVendor);
                            // activate();
                        });

                    }
                )
                )
        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        };

        activate();

        function activate() { }
    }
})();
