(function () {
    'use strict';

    angular
        .module('production')
        .controller('confirmProductionController', confirmProductionController);

    confirmProductionController.$inject = ['$scope', '$location', 'appSession', '$state', '$stateParams', 'abp.services.app.finishProduct', 'abp.services.production.approvedProductionRequisition', 'abp.services.production.finishProductProduction',
    'abp.services.app.stockBin'];

    function confirmProductionController($scope, $location, appSession, $state, $stateParams, finishProductService, approvedProductionRequisitionService, finishProductProductionService, stockBinService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Confirm Finish Product Production';

        vm.getApprovedProductRequistionById = getApprovedProductRequistionById;
        vm.addNewconfirmProduction = addNewconfirmProduction;
        vm.getBinTypes = getBinTypes;

        var localize = abp.localization.getSource('SPMS');

        function addNewconfirmProduction() {
            if (vm.approvedProductionRequisition.availableFinishProduct == 0 || vm.approvedProductionRequisition.availableFinishProduct < vm.confirmProduction.finishProductQuantity) {
                abp.notify.info("You can't produce more finish product than available quantity.");
                return;
            }

            vm.confirmProduction.approvedProductionRequisitionId = $stateParams.id;
            vm.confirmProduction.stockBinId = vm.selectedStockType.id;

            abp.ui.setBusy(
                   null,
                   finishProductProductionService.createFinishProductProduction(
                       vm.confirmProduction
                   ).success(function () {
                       abp.notify.info(abp.utils.formatString(localize("ProductionConfirmCreatedMessage"), vm.confirmProduction.finishProductQuantity));
                       //When 2 quantity is equal i,e produce all product close the requisition
                       debugger
                       if (vm.approvedProductionRequisition.availableFinishProduct == vm.confirmProduction.finishProductQuantity) {
                           var data = {
                               id: $stateParams.id
                           };
                           abp.ui.setBusy(
                                   null,
                                   approvedProductionRequisitionService.completeProduction(data).success(function (data) {
                                       $location.path('/product/confirmRequisitionList');
                                   })
                                   );
                       } else {
                           $location.path('/product/confirmRequisitionList');
                       }


                   })
               );
        };

        function getApprovedProductRequistionById(id) {
            var data = {
                id: id
            };
            abp.ui.setBusy(
                    null,
                    approvedProductionRequisitionService.getApprovedProductionRequisitionById(data).success(function (data) {
                        //vm.selectedWareHouse.id = data.productionRequisition.warehouseId;
                        //vm.selectedFinishProduct.id = data.productionRequisition.finishProductId;
                        vm.approvedProductionRequisition.fullProductName = data.approvedProductionRequisition.fullProductName;
                        vm.approvedProductionRequisition.finishProductQuantity = data.approvedProductionRequisition.finishProductQuantity;
                        vm.approvedProductionRequisition.availableFinishProduct = data.approvedProductionRequisition.availableFinishProduct;
                        //vm.getFinishProductDetailsById();
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

            vm.confirmProduction = {
                id: 0,
                approvedProductionRequisitionId: '',
                stockBinId:'',
                finishProductQuantity: 0,
                creatorUserId: appSession.user.id
            };

            vm.approvedProductionRequisition = {
                fullProductName: '',
                finishProductQuantity: ''
            };

            vm.stockTypes = [];
            vm.selectedStockType = {
                id: ''
            };

            vm.getBinTypes();

            vm.getApprovedProductRequistionById($stateParams.id);
            //vm.getApprovedProductRequisitionList();

        }
    }
})();