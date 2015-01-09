angular.module('ChartsApp').controller('filterCtrl', function ($scope, bus) {
    'use strict';

    bus.on('updateData', function(data) {
        $scope.technos = computeTechnos(data);
        $scope.hosts = computeHosts(data);
    });

    $scope.nameFilter = '';

    var technosFilter = [];
    var hostsFilter = [];

    $scope.$watch('nameFilter', function(name) {
        bus.emit('nameFilterChange', name);
    });

    $scope.toggleTechnoFilter = function(techno) {
        if ($scope.isTechnoInFilter(techno)) {
            technosFilter.splice(technosFilter.indexOf(techno), 1);
        } else {
            technosFilter.push(techno);
        }
        bus.emit('technosFilterChange', technosFilter);
    };

    $scope.isTechnoInFilter = function(techno) {
        return technosFilter.indexOf(techno) !== -1;
    };

    $scope.toggleHostFilter = function(host) {
        if ($scope.isHostInFilter(host)) {
            hostsFilter.splice(hostsFilter.indexOf(host), 1);
        } else {
            hostsFilter.push(host);
        }
        bus.emit('hostsFilterChange', hostsFilter);
    };

    $scope.isHostInFilter = function(host) {
        return hostsFilter.indexOf(host) !== -1;
    };

    function computeTechnos(rootNode) {
        var technos = [];

        function addNodeTechnos(node) {
            if (node.technos) {
                node.technos.forEach(function(techno) {
                    technos[techno] = true;
                });
            }
            if (node.children) {
                node.children.forEach(function(childNode) {
                    addNodeTechnos(childNode);
                });
            }
        }

        addNodeTechnos(rootNode);

        return Object.keys(technos).sort();
    }

    function computeHosts(rootNode) {
        var hosts = {};

        function addNodeHosts(node) {
            if (node.host) {
                for (var i in node.host) {
                    hosts[i] = true;
                }
            }
            if (node.children) {
                node.children.forEach(function(childNode) {
                    addNodeHosts(childNode);
                });
            }
        }

        addNodeHosts(rootNode);

        return Object.keys(hosts).sort();
    }

});
