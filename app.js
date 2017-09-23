var app = angular.module("webApp", ['ui.router', 'ui.bootstrap']);

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
    });

    $urlRouterProvider.otherwise('/');
});

