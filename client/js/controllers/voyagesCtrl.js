angular
  .module('app')
  .controller('VoyagesCtrl', VoyagesCtrl);

VoyagesCtrl.$inject = ['$window', '$log', '$sce', 'PortCall', 'ngProgressFactory'];
function VoyagesCtrl($window, $log, $sce, PortCall, ngProgressFactory) {

  let ctrl = this;
  ctrl.getRoutes = getRoutes;
  ctrl.isSortBy = isSortBy;
  ctrl.setSortBy = setSortBy;
  ctrl.isReverse = isReverse;
  ctrl.highlight = highlight;
  ctrl.progressBar = ngProgressFactory.createInstance();
  ctrl.filteredVoyages = [];
  ctrl.sortBy = {
    column: 'routeId',
    reverse: false
  };
  ctrl.dateOptions = {
    initDate: new Date('2016-01-01 00:00:00'),
    formatYear: 'yy',
    startingDay: 1
  };

  $window.document.title = 'Voyages';

  function getRoutes(etd, eta, isTranshipmentEnabled) {
    const params = {etd, eta, isTranshipmentEnabled};
    ctrl.progressBar.start();
    PortCall.getRoutes(params).$promise
      .then(voyages => {
        ctrl.voyages = voyages;
      })
      .catch(err => {
        $log.error(err);
      })
      .finally(() => {
        ctrl.progressBar.complete();
      });
  }

  function isSortBy(columnId) {
    return ctrl.sortBy.column === columnId;
  }

  function setSortBy(columnId) {
    if (ctrl.sortBy.column !== columnId) {
      ctrl.sortBy.reverse = true;
    }
    ctrl.sortBy.column = columnId;
    ctrl.sortBy.reverse = !ctrl.sortBy.reverse;
  }

  function isReverse() {
    return ctrl.sortBy.reverse;
  }

  function highlight(text, search, token, glyphClass) {
    if (!search) {
      return $sce.trustAsHtml(text.replace(new RegExp(token),
        '<span class="left-buffer-sm right-buffer-sm glyphicon ' +
        glyphClass + '" title="transfers to"></span>'));
    }
    text = text.replace(new RegExp(search, 'gi'), '<span class="highlightedText">$&</span>');
    text = text.replace(new RegExp(token),
          '<span class="left-buffer-sm right-buffer-sm glyphicon ' + glyphClass + '"></span>');
    return $sce.trustAsHtml(text);
  }

}
