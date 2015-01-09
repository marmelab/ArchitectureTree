angular.module('ChartsApp').controller('undoCtrl', function($scope, bus, data) {

    var history = [];

    bus.on('updateData', function(data) {
        history.push(angular.copy(data));
    });

    $scope.hasHistory = function() {
        return history.length > 1;
    };

    $scope.undo = function() {
        history.pop(); // remove current state
        data.setJsonData(history.pop()); // restore previsous state
    };

});
