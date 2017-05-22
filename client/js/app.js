angular
  .module('app', [
    'lbServices',
    'ui.router',
    'ui.bootstrap',
    'ngProgress'
  ])
  .config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('voyages', {
          url: '',
          templateUrl: 'views/voyages.html',
          controller: 'VoyagesCtrl as ctrl'
        });

      $urlRouterProvider.otherwise('voyages');
    }
  ]);
