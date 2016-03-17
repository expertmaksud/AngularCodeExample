(function () {
    'use strict';

    angular
        .module('inventory')
        .controller('receiveFinishProductController', receiveFinishProductController);

    receiveFinishProductController.$inject = ['$scope', '$location', 'appSession', '$state', '$stateParams', 'abp.services.app.finishProduct', 'abp.services.production.approvedProductionRequisition', 'abp.services.production.finishProductProduction',
    'abp.services.app.stockBin'];

    function receiveFinishProductController($scope, $location, appSession, $state, $stateParams, finishProductService, approvedProductionRequisitionService, finishProductProductionService, stockBinService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Confirm Finish Product Production';

        vm.getConfirmFinishProductById = getConfirmFinishProductById;
        vm.confirmReceiveFinishProduct = confirmReceiveFinishProduct;
        vm.getBinTypes = getBinTypes;

        var localize = abp.localization.getSource('SPMS');

        function confirmReceiveFinishProduct() {

            vm.confirmFinishProduct.id = $stateParams.id;
            vm.confirmFinishProduct.isAddedToStock = true;
            abp.ui.setBusy(
                   null,
                   finishProductProductionService.confirmReceiveFinishProduct(
                       vm.confirmFinishProduct
                   ).success(function () {
                       abp.notify.info(abp.utils.formatString(localize("FinishProductReceiveCreatedMessage"), vm.confirmFinishProduct.finishProductQuantity));
                       $location.path('/production/completedlist');
                   })
               );
        };

        function getConfirmFinishProductById(id) {
            var data = {
                Id: id
            };
            abp.ui.setBusy(
                    null,
                    finishProductProductionService.getFinishProductProductionById(data).success(function (data) {
                        vm.confirmFinishProduct = data.finishProductProduction;
                        vm.selectedStockType.id = data.finishProductProduction.stockBinId;
                        //vm.confirmFinishProduct.finishProductQuantity = data.finishProductProduction.finishProductQuantity;
                    })
                );
        };

        function getBinTypes() {
            abp.ui.setBusy(
                      null,
                      stockBinService.getAllStockBins().success(function (data) {
                          vm.stockTypes = data.stockBins;
                      })
                  );
        }
        activate();

        function activate() {
            vm.disableEdit = true;

            vm.confirmFinishProduct = {
                id: '',
                isAddedToStock: '',
                fullProductName: '',
                warehouseId: '',
                productionRequisitionId: '',
                stockBinId: '',
                productId: '',
                productUnitId: '',
                finishProductQuantity: '',
                editUserId: appSession.user.id
            };

            vm.stockTypes = [];
            vm.selectedStockType = {
                id: ''
            };

            vm.getBinTypes();
            vm.getConfirmFinishProductById($stateParams.id);
            //vm.getApprovedProductRequisitionList();

        }
    }
})();