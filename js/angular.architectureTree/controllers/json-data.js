angular.module('ChartsApp').controller('jsonDataCtrl', function ($scope, bus, data, $http) {
    'use strict';

    var previousData;


    bus.on('updateData', function (data) {


        previousData = data;


        $scope.data = JSON.stringify(data, undefined, 2);


        $http({
            url: 'datajson.php',
            method: "POST",
            data: $scope.data,
            headers: {'Content-Type': 'application/json'}
        })
            .then(function (response) {

                    console.log(response)
                    // if success then todo here
                },
                function (response) {
                    console.log('error')
                }
            );


    });


    $scope.updateData = function () {
        var newData = JSON.parse($scope.data);
        if (!angular.equals(newData, previousData)) {
            data.setJsonData(newData);
        }
    };

});

