(function () {
    'use strict';

    angular.module('common')
    .constant("ENUMS", {
        ProductTypes: {
            RAWMATERIAL: 0,
            FINISHPRODUCT: 1,
            PACKAGING: 2,
            OTHER: 3
        },
        RawMaterialTypes: {
            Additives: 0,
            BaseOil: 1

        },
        StockOperationType: {
            STOCKIN: 0,
            STOCKOUT: 1,
            TRANSIT: 2
        },
        QuantityUnit: {
            Liter: 0,
            Unit: 1
        },
        StockType: {
            GOOD: 0,
            DAMAGE: 1,
            SCRAP: 2
        },
        PaymentMode: {
            CASH: 0,
            CREDIT: 1
        },
        PaymentCollectionMode: {
            CASH: 0,
            CHEQUE: 1,
            PAYORDER: 2,
            DEMANDDRAFT: 3,
            BANKTRANSFER: 4
        }
    });
})();