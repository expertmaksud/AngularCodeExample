(function () {
    'use strict';

    angular
        .module('finance')
        .controller('receivePaymentController', receivePaymentController);

    receivePaymentController.$inject = ['$scope', '$location', 'appSession', '$state', '$stateParams', 'ENUMS', 'paymentModeFactory', 'abp.services.finance.paymentCollection', 'abp.services.app.distributor'];

    function receivePaymentController($scope, $location, appSession, $state, $stateParams, Enums, paymentModeFactory, paymentCollectionService, distributorService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Distribution Wise Received Payment List';

        var localize = abp.localization.getSource('SPMS');

        vm.getAllDistributors = getAllDistributors;
        vm.newReceivePayment = newReceivePayment;
        vm.changePaymentMode = changePaymentMode;
        vm.open = open;

        function getAllDistributors() {
            abp.ui.setBusy(
                    null,
                    distributorService.getAllDistributors().success(function (data) {
                        angular.forEach(data.distributors, function (item, key) {
                            data.distributors[key].sl = key + 1;
                        });
                        vm.distributors = data.distributors;

                    })
                );
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            minDate: new Date(),
            orientation: "top auto"
        };

        function open($event, option) {
            if (option === 'paymentMode') {
                vm.status.paymentModeDateOpened = true;
            }
            else if (option === 'payment') {
                vm.status.paymentDateOpened = true;
            }
        };

        function newReceivePayment() {
            vm.receivePayment.distributorId= vm.selectedDistributor.id;
            vm.receivePayment.paymentMode = vm.selectedPaymentMode.id;

            abp.ui.setBusy(
                    null,
                    paymentCollectionService.createPaymentCollection(
                        vm.receivePayment
                    ).success(function () {
                        abp.notify.info(abp.utils.formatString(localize("ReceivePaymentCreatedMessage"), vm.receivePayment.paidAmount));
                        $location.path('/Finance/ReceivedPaymentList');
                    })
                );
        };

        function changePaymentMode() {
            if (vm.selectedPaymentMode === undefined || parseInt(vm.selectedPaymentMode.id) === Enums.PaymentCollectionMode.CASH) {
                vm.disablePaymentMode = false;
            }
            else {
                vm.disablePaymentMode = true;
                if (parseInt(vm.selectedPaymentMode.id) === Enums.PaymentCollectionMode.CHEQUE)
                {
                    vm.paymentModeDateLabel = "Cheque Date";
                    vm.paymentModeNumberLabel = "Cheque Number";
                    vm.bankNameLabel = "Bank Name";
                    vm.bankBranchLabel = "Bank Branch";
                }
                else if (parseInt(vm.selectedPaymentMode.id) === Enums.PaymentCollectionMode.PAYORDER)
                {
                    vm.paymentModeDateLabel = "PayOrder Date";
                    vm.paymentModeNumberLabel = "PayOrder Number";
                    vm.bankNameLabel = "Bank Name";
                    vm.bankBranchLabel = "Bank Branch";
                }
                else if (parseInt(vm.selectedPaymentMode.id) === Enums.PaymentCollectionMode.DEMANDDRAFT) {
                    vm.paymentModeDateLabel = "DemandDraft Date";
                    vm.paymentModeNumberLabel = "DemandDraft Number";
                    vm.bankNameLabel = "Bank Name";
                    vm.bankBranchLabel = "Bank Branch";
                }
                else if (parseInt(vm.selectedPaymentMode.id) === Enums.PaymentCollectionMode.BANKTRANSFER) {
                    vm.paymentModeDateLabel = "BankTransfer Date";
                    vm.paymentModeNumberLabel = "Account Number";
                    vm.bankNameLabel = "Bank Name";
                    vm.bankBranchLabel = "Bank Branch";
                }
                else {
                    vm.paymentModeDateLabel = "Payment Mode Date";
                    vm.paymentModeNumberLabel = "Payment Mode Number";
                    vm.bankNameLabel = "Bank Name";
                    vm.bankBranchLabel = "Bank Branch";
                }
            }
        };

        //vm.editSelectedRow = function () {

        //    var rowId = angular.copy(vm.selectedRowEntity.id);
        //    vm.disableEdit = true;
        //    $location.path('/productdistribution/confirm/' + rowId);
        //}

        activate();

        function activate() {
            vm.disableEdit = true;
            vm.disablePaymentMode = false;

            vm.paymentModeDateLabel = "Payment Mode Date";
            vm.paymentModeNumberLabel = "Payment Mode Number";
            vm.bankNameLabel = "Bank Name";
            vm.bankBranchLabel = "Bank Branch";

            vm.paymentModes = paymentModeFactory.getData();
            vm.selectedPaymentMode = {
                id: ''
            };

            vm.status = {
                paymentDateOpened: false,
                paymentModeDateOpened: false
            };

            vm.distributors = {};
            vm.selectedDistributor = {
                id: ''
            };

            vm.getAllDistributors();

        }
    }
})();