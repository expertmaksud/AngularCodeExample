(function () {
    'use strict';

    angular
        .module('report')
        .controller('purchaseReportController', purchaseReportController);

    purchaseReportController.$inject = ['$location', 'purchaseTypeFactory', 'abp.services.app.vendor'];

    function purchaseReportController($location, purchaseTypeFactory, vendorService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'reportController';
        vm.getVendors = getVendors;
        vm.iFrameURL = null;
        vm.reports = [
       {
           id: 'PurchaseReport.rdlc',
           name: 'Purchase Report'
       },
       {
           id: 'Report2',
           name: 'Report 2'
       },
        ];
        vm.lcDateRange = { startDate: moment().subtract(7, "days"), endDate: moment() };
        vm.poDateRange = { startDate: null, endDate: null };

        vm.dateRangeOption = {
            locale: {
                applyClass: 'btn-green',
                format: 'MMM DD, YYYY',
                customRangeLabel: 'Custom Range',
                firstDay: 1
            },
            ranges: {
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'Last 2 Months': [moment().subtract(59, 'days'), moment()],
                'Last 6 Months': [moment().subtract(6, 'months'), moment()]
            }
        };



        vm.openReport = function () {
            var protocol = $location.protocol();
            var host = $location.host();
            var port = $location.port();
            vm.lcStartDate = vm.lcDateRange.startDate.toISOString();
            vm.lcEndDate = vm.lcDateRange.endDate.toISOString();
            vm.poStartDate = vm.poDateRange.startDate == null ? moment('1/1/2010').toISOString() : vm.poDateRange.startDate.toISOString();
            vm.poEndDate = vm.poDateRange.endDate == null ? moment().toISOString() : vm.poDateRange.endDate.toISOString();
            vm.lcNum = (vm.lcNumber === undefined || vm.lcNumber === null) ? '' : vm.lcNumber;
            vm.poNum = (vm.poNumber === undefined || vm.poNumber === null) ? '' : vm.poNumber;
            vm.purchaseType = (vm.selectedPurchaseType === undefined || vm.selectedPurchaseType === null) ? '' : vm.selectedPurchaseType.id;
            vm.vendor = (vm.selectedVendor === undefined || vm.selectedVendor === null) ? '' : vm.selectedVendor.id;

            vm.iFrameURL = protocol + '://' + host + ':' + port + '/Reports/PurchaseReportViewer.aspx?id=PurchaseReport.rdlc&purType=' + vm.purchaseType + '&lcSD=' + vm.lcStartDate + '&lcED=' + vm.lcEndDate + '&lcNum=' + vm.lcNum +
                '&poNum=' + vm.poNum + '&vend=' + vm.vendor + '&poSD=' + vm.poStartDate + '&poED=' + vm.poEndDate + '&recStatus=' + vm.selectedReceiveStatus;
        }

        function getVendors() {
            abp.ui.setBusy( //Set whole page busy until getTasks complete
                    null,
                    vendorService.getAllVendors().success(function (data) {
                        vm.vendors = data.vendors;
                    })
                );
        };

        activate();

        function activate() {
            vm.reportId = vm.reports[0].id;
            vm.vendors = [];
            vm.poNumber = '';
            vm.lcNumber = '';
            vm.selectedVendor = {
                id: ''
            };
            vm.purchaseTypes = purchaseTypeFactory.getData();
            vm.selectedPurchaseType = {
                id: ''
            };

            vm.selectedReceiveStatus = '';
            vm.getVendors();
            vm.openReport();

        }
    }
})();
