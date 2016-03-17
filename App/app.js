(function () {
    'use strict';

    var app = angular.module('app', [
         // Angular modules
        'ngAnimate',
        'ngSanitize',
        'ngMessages',

        // 3rd Party Module
        'ui.router',
        'ui.bootstrap',
        'ui.jq',
        'ui.grid',
        'ui.grid.edit',
        'ui.grid.selection',
        'ui.date',
        'ui.select',
        'ui.grid.resizeColumns',
        'daterangepicker',

        //Custom Module
        'abp',
        'common',
        'main',
        'procurement',
        'inventory',
        'production',
        'sales',
        'finance',
        'report'

 
    ]);

    //Configuration for Angular UI routing.
    app.config([
        '$urlRouterProvider', 'uiSelectConfig',
    function ($urlRouterProvider, uiSelectConfig) {
        $urlRouterProvider.otherwise('/');


        uiSelectConfig.theme = 'bootstrap';
        uiSelectConfig.resetSearchInput = true;
        uiSelectConfig.appendToBody = true;
    }
    ]);
})();