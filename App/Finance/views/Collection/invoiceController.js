(function () {
    'use strict';

    angular
        .module('finance')
        .controller('invoiceController', invoiceController);

    invoiceController.$inject = ['$location', 'appSession', '$state', '$stateParams', 'abp.services.finance.invoice', ];

    function invoiceController($location, appSession, $state, $stateParams, invoiceService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Invoice ';
        vm.getInvoice = getInvoice;
        vm.getTotal = getTotal;
        vm.print = print;
        vm.createPDF = createPDF;
        vm.getCanvas = getCanvas;

        function getInvoice() {
            var input = {
                id: $stateParams.id
            };
            abp.ui.setBusy(
                    null,
                    invoiceService.getInvoiceById(input).success(function (data) {
                        vm.invoice = data.invoice;
                        vm.invoiceDetails = data.invoiceDetails;
                        vm.getTotal()
                    })
                );
        };

        function getTotal() {
            var total = 0;
            angular.forEach(vm.invoiceDetails, function (item, key) {
                total += item['totalPrice'];
            });

            vm.totalPrice = total;
        }

        function print() {
            var printContents = document.getElementById('divInvoice').innerHTML;
            var popupWin = window.open('', '_blank', 'width=300,height=300');
            popupWin.document.open();
            popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="/Content/bootstrap-cosmo.min.css" />'
                + '<link rel="stylesheet" href="/App/assets/css/app.css"></head><body onload="window.print()">' + printContents + '</body></html>');
            popupWin.document.close();
        }

        function createPDF() {
            $('body').scrollTop(0);
            vm.getCanvas().then(function (canvas) {
                var
                img = canvas.toDataURL("image/png"),
                doc = new jsPDF({
                    unit: 'px',
                    format: 'a4'
                });
                doc.addImage(img, 'JPEG', 20, 20);
                doc.save(vm.invoice.invoiceNumber + '.pdf');
                vm.invoiceDiv.width(vm.invoiceWidth);
            });
        }

        // create canvas object
        function getCanvas() {
            vm.invoiceDiv.width((vm.a4[0] * 1.33333) - 80).css('max-width', 'none');
            return html2canvas(vm.invoiceDiv, {
                imageTimeout: 2000,
                removeContainer: true
            });
        }

        activate();

        function activate() {
            vm.invoiceDiv = $('#divInvoice')
            vm.invoiceWidth = vm.invoiceDiv.width(),
            vm.a4 = [595.28, 841.89];

            vm.totalPrice = 0;
            vm.getInvoice();
        }
    }
})();
