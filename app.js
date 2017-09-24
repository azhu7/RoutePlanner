var app = angular.module("webApp", ['ui.router', 'ui.bootstrap','ngMap']);

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('home', {
        url: '/',
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl'
    }).state('map', {
        url: '/map',
        templateUrl: 'views/map.html',
    	controller: 'MapCtrl'
    }).state('finalRoute', {
        url: '/itinerary/{trip_code}',
        templateUrl: 'views/route.html',
        controller: 'RouteCtrl'
    });

    $urlRouterProvider.otherwise('/');
});

