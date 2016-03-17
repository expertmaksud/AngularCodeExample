(function () {
    'use strict';

    angular
        .module('inventory')
        .controller('deliveryChallanController', deliveryChallanController);

    deliveryChallanController.$inject = ['$scope', '$location', 'appSession', '$state', '$stateParams', 'abp.services.app.warehouse', 'abp.services.inventory.distribution'];

    function deliveryChallanController($scope, $location, appSession, $state, $stateParams, warehouseService, distributionService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Delivery Challan';
        vm.getChalanDetails = getChalanDetails;
        vm.getTotal = getTotal;
        vm.getCanvas = getCanvas;
        vm.createPDF = createPDF;
        vm.print = print;



        function getChalanDetails() {
            var input = {
                distributionId: $stateParams.id
            };

            distributionService.getDCByDistributionId(input).success(function (data) {
                vm.distribution = data.distribution;
                vm.distributionDetails = data.distributionDetails;
                vm.getTotal();

            });
        }

        function getTotal() {
            var total = 0;
            angular.forEach(vm.distributionDetails, function (item, key) {
                total += item['packSize'] != 0 ? item['packSize'] * item['multiplier'] * item['quantity'] : item['quantity'];
            });

            vm.totalQuantity = total;
        }

        function print() {
            var printContents = document.getElementById('divChalan').innerHTML;
            var popupWin = window.open('', '_blank', 'width=300,height=300');
            popupWin.document.open();
            popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="/Content/bootstrap-cosmo.min.css" />'
                + '<link rel="stylesheet" href="/App/assets/css/app.css"></head><body onload="window.print()">' + printContents + '</body></html>');
            popupWin.document.close();
        }

        /* function createPDF() {
              var pdf = new jsPDF('p','pt','a4');
             pdf.addHTML($('#divChalan').first(), function () {
                 //pdf.save("DeliveryChalan.pdf");
                 pdf.output("dataurlnewwindow");
              });
 
             //pdf.fromHTML($('#divChalan').html(), 10, 10, { 'width': 180 });
             //pdf.save("DeliveryChalan.pdf");
             debugger  
             var source = $("#divChalan").get(0);
            
             pdf.fromHTML(
                 source,
                 15,
                 15,
                 {
                     'width': 500
                 });
 
             pdf.output("dataurlnewwindow"); 
         }   */

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
                doc.save(vm.distribution.dcNumber + '.pdf');
                vm.chalandiv.width(vm.chalanWidth);
            });
        }

        // create canvas object
        function getCanvas() {
            vm.chalandiv.width((vm.a4[0] * 1.33333) - 80).css('max-width', 'none');
            return html2canvas(vm.chalandiv, {
                imageTimeout: 2000,
                removeContainer: true
            });
        }
        activate();

        function activate() {
            vm.chalandiv = $('#divChalan')
            vm.chalanWidth = vm.chalandiv.width(),
            vm.a4 = [595.28, 841.89];

            vm.totalQuantity = 0;
            vm.getChalanDetails();

        }
    }
})();
