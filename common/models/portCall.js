'use strict';

module.exports = function (PortCall) {

  const _ = require('lodash');
  const moment = require('moment');

  PortCall.getRoutes = function(etd, eta, isTranshipmentEnabled, cb) {
    // For more information on how to query data in loopback please see
    // https://docs.strongloop.com/display/public/LB/Querying+data
    const query = {
      where: {
        and: [
          { // port call etd >= etd param, or can be null
            or: [{etd: {gte: etd}}, {etd: null}]
          },
          { // port call eta <= eta param, or can be null
            or: [{eta: {lte: eta}}, {eta: null}]
          }
        ]
      }
    };


    PortCall.find(query)
      .then(calls => {
        let voyages = [];
        let routes = _.chain(calls)
          .groupBy('routeId')
          .map((value, key) => { return { routeId: key, calls: value } })
          .value();

        routes.forEach(route => {
          route.calls.forEach((call, j) => {
            for (let k = j + 1; k < route.calls.length; k++) {
              let nextCall = route.calls[k];
              if (call.port !== nextCall.port) {
                voyages.push({
                  routeId: call.routeId,
                  vessel: call.vessel,
                  origin: call.port,
                  destination: route.calls[k].port,
                  eta: moment(nextCall.eta).isValid() ?
                    moment(nextCall.eta).format('YYYY-MM-DD') :
                    nextCall.eta,
                  etd: moment(call.etd).isValid() ?
                    moment(call.etd).format('YYYY-MM-DD') :
                    call.etd
                });
              }
            }
          });
        });

        if (isTranshipmentEnabled) {
          let transhipments = [];

          let vessels = _.chain(voyages).groupBy('vessel')
            .map((value, key) => { return { vessel: key, calls: value } })
            .value();

          vessels.forEach((vessel, i) => {
            let next = i + 1;
            if (next < vessels.length) {
              vessel.calls.forEach(call => {
                vessels[next].calls.forEach(nextVesselCall => {
                  if (call.destination === nextVesselCall.origin &&
                    call.origin !== nextVesselCall.destination &&
                    !moment(call.eta).isAfter(nextVesselCall.etd)) {
                    transhipments.push({
                      routeId: call.routeId + '->' + nextVesselCall.routeId,
                      vessel: call.vessel + '->' + nextVesselCall.vessel,
                      origin: call.origin + '->' + call.destination,
                      destination: nextVesselCall.destination,
                      etd: call.etd,
                      eta: nextVesselCall.eta,
                    });
                  }
                });
              });
            }
          });

          voyages = _.union(voyages, transhipments);
        }
        return cb(null, voyages);
      })
      .catch(err => {
        console.log(err);

        return cb(err);
      });
  };

  PortCall.remoteMethod('getRoutes', {
    accepts: [
      {arg: 'etd', 'type': 'date'},
      {arg: 'eta', 'type': 'date'},
      {arg: 'isTranshipmentEnabled', 'type': 'boolean'}
    ],
    returns: [
      {arg: 'routes', type: 'array', root: true}
    ]
  });
};
