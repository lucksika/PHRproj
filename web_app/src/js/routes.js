'use strict';

/**
 * Route configuration for the RDash module.
 */
angular.module('RDash').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        // For unmatched routes
        $urlRouterProvider.otherwise('/');

        // Application routes
        $stateProvider
            .state('index', {
                url: '/',
                templateUrl: 'templates/dashboard.html'
            })
            .state('profile', {
                url: '/profile',
                templateUrl: 'templates/profile.html'
            })
            .state('info', {
                url: '/info',
                templateUrl: 'templates/info.html'
            })
            .state('medication', {
                url: '/medication',
                templateUrl: 'templates/medication.html'
            })
            .state('foods', {
                url: '/foods',
                templateUrl: 'templates/foods.html'
            })
            .state('labresults', {
                url: '/labresults',
                templateUrl: 'templates/labresults.html'
            })
            .state('appointment', {
                url: '/appointment',
                templateUrl: 'templates/appointment.html'
            })
            .state('resultDetail', {
                url: '/resultDetail:ref',
                templateUrl: 'templates/resultDetail.html',
                controller: 'LabResultDetailCtrl'
            })
            .state('tables', {
                url: '/tables',
                templateUrl: 'templates/tables.html'
            });
    }
]);