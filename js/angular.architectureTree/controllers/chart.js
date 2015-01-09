angular.module('ChartsApp').controller('chartCtrl', function ($scope, bus) {
    'use strict';

    bus.on('updateData', function(data) {
        $scope.data = angular.copy(data);
    });
});
