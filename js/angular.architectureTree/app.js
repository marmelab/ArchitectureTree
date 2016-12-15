angular.module('ChartsApp', [])
    .run(function(data) {

        data.fetchJsonData().then(function (response) {
            console.log('data loaded' ,data);
            //console.log(response)
        }, console.error);
    });
