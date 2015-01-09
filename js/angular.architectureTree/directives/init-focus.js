angular.module('ChartsApp').directive('initFocus', function() {
    var timer;
    
    return function(scope, elm, attr) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(function() {
            elm[0].focus();
        }, 0);
    };
});
