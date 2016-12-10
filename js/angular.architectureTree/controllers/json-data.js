angular.module('ChartsApp').controller('jsonDataCtrl', function ($scope, bus, data) {
    'use strict';

    var previousData;





    bus.on('updateData', function(data) {
        previousData = data;
        
        console.log(previousData);

        savejson(previousData);
        $scope.data = JSON.stringify(data, undefined, 2);
    });


    $scope.updateData = function() {
        var newData = JSON.parse($scope.data);
        if (!angular.equals(newData, previousData)) {
            data.setJsonData(newData);
        }
    };

});



var myjsondata;

function savejson(jsondata){

  myjsondata = JSON.parse(JSON.stringify(jsondata));
  console.log(myjsondata);


    $.ajax({
    
    url: 'datajson.php',
   data:{ myjsondata: myjsondata},

    type:"POST",
        async: false,
    success: function (data) {
      // hide the "loading..." message
    //  alert("Neural Network Algortihm was Succesfully done by Matlab")
  console.log('data.json is saved Succesfully');

  
    },
    error: function (err) {
      console.log('Error', err);
      if (err.status === 0) {
        alert('Failed to load json.\nPlease run this example on a server.');
      }
      else {
        alert('Failed to load json.');
      }
    }
  });
    //console.log(savejson,neuralnetjson,'birkam');
   // return neuralnetjson;
}
 
 