var app = angular.module("webApp", ['ui.router', 'ui.bootstrap']);

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('home', {
        url: '/home',
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl'
    }).state('about', {
        url: '/about',
        templateUrl: 'views/about.html'
    }).state('contact',{
        url: '/contact',
        templateUrl: 'views/contact.html'
    }).state('resume', {
        url: '/resume',
        templateUrl: 'views/resume.html'
    });
    $urlRouterProvider.otherwise('/home');
});

