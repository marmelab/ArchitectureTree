angular.module('ChartsApp').controller('panelCtrl', function ($scope, $timeout, $window, data, bus) {
    'use strict';

    var container = angular.element(document.querySelector('#panel')),
        graph = document.querySelector('#graph');

    bus.on('updateData', function(data) {
        var clonedData = angular.copy(data);
        $scope.data = formatData(clonedData);
    });

    function formatData(data) {

        var addParent = function(node) {
            if (node.children) {
                node.children.forEach(function(childNode) {
                    childNode.parent = node;
                    addParent(childNode);
                });
            }
        };

        var addDependents = function(node) {
            if (node.dependsOn) {
                node.dependsOn.forEach(function(dependsOn) {
                    var dependency = getNodeByName(dependsOn, data);
                    if (!dependency) {
                        console.log('Dependency', dependsOn, 'not found for node', node);
                        return;
                    }
                    if (!dependency.dependents) {
                        dependency.dependents = [];
                    }
                    dependency.dependents.push(node.name);
                });
            }
            if (node.children) {
                node.children.map(addDependents);
            }
        };

        var addDetails = function(node) {
            addDetailsForNode(node);
            if (node.children) {
                node.children.map(addDetails);
            }
        };

        /**
         * Add details to a node, including inherited ones (shown between parentheses).
         *
         * Mutates the given node.
         *
         * Example added properties:
         * {
         *   details: {
         *     Dependencies: ["Foo", "Bar (Babar)"],
         *     Dependents: ["Baz", "Buzz"];
         *     Technos: ["Foo", "Bar (Babar)" }
         *     Host: ["OVH", "fo (Foo)"]
         *   }
         * }
         */
        var addDetailsForNode = function(node) {
            node.details = {};
            var dependsOn = getDetailCascade(node, 'dependsOn');
            if (dependsOn.length > 0) {
                node.details.Dependencies = dependsOn.map(getValueAndAncestor);
            }
            if (node.dependents) {
                node.details.Dependents = node.dependents;
            }
            var technos = getDetailCascade(node, 'technos');
            if (technos.length > 0) {
                node.details.Technos = technos.map(getValueAndAncestor);
            }
            if (node.host) {
                node.details.Host = [];
                for (var i in node.host) {
                    node.details.Host.push(i);
                }
            }

            return node;
        };

        var getDetailCascade = function(node, detailName, via) {
            var values = [];
            if (node[detailName]) {
                node[detailName].forEach(function(value) {
                    values.push({ value: value, via: via });
                });
            }
            if (node.parent) {
                values = values.concat(getDetailCascade(node.parent, detailName, node.parent.name));
            }
            return values;
        };

        var getValueAndAncestor = function(detail) {
            return detail.via ? detail.value + ' (' + detail.via + ')' : detail.value;
        };

        addParent(data);
        addDependents(data);
        addDetails(data);

        return data;
    }


    /**
     * Returns the node path
     * @param {Object} d
     * @returns {Array}
     */
    var getNodePath = function(node) {
        var path = [],
            current = node;

        do {
            path.push(current.name);
            current = current.parent;
        } while (typeof(current) !== 'undefined');

        return path.reverse();
    };

    var getNodeByName = function(name, data) {
        if (data.name === name) {
            return data;
        }
        if (!data.children) return null;
        for (var i = data.children.length - 1; i >= 0; i--) {
            var matchingNode = getNodeByName(name, data.children[i]);
            if (matchingNode) return matchingNode;
        }
    };

    // Events
    container
        .on('hoverNode', function(event) {
            $scope.node = getNodeByName(event.detail, $scope.data);
            $scope.detail = true;
            $scope.edit = false;
            $scope.$digest();
        })
        .on('selectNode', function(event) {
            $scope.enterEdit(event.detail);
            $scope.$digest();
        })
        .on('unSelectNode', function(event) {
            if ($scope.edit) {
                $scope.leaveEdit();
                $scope.$digest();
            }
        });

    $scope.enterEdit = function(name) {
        $scope.originalNode = getNodeByName(name, $scope.data);
        $scope.node = angular.copy($scope.originalNode);
        $scope.detail = false;
        $scope.edit = true;

        // have to keep the host keys in an array to manage edition
        $scope.hostKeys = {};
        angular.forEach($scope.node.host, function(value, key) {
            $scope.hostKeys[key] = key;
        });
    };

    $scope.leaveEdit = function() {
        $scope.node = angular.copy($scope.originalNode);
        $scope.detail = true;
        $scope.edit = false;
        bus.emit('unselect');
    };

    $scope.editNode = function(form, $event) {
        $event.preventDefault();

        angular.forEach($scope.hostKeys, function(value, key) {
            if (value !== key) {
                $scope.node.host[value] = angular.copy($scope.node.host[key]);
                delete $scope.node.host[key];
            }
        });

        data.updateNode($scope.originalNode.name, $scope.node);
        data.emitRefresh();

        $scope.node = getNodeByName($scope.node.name, $scope.data);
        $scope.detail = true;
        $scope.edit = false;
    };

    $scope.deleteNode = function() {
        if (!$window.confirm('Are you sure you want to delete that node?')) return;
        data.removeNode($scope.originalNode.name);
        data.emitRefresh();

        $scope.detail = false;
        $scope.edit = false;
    };

    $scope.moveNode = function() {
        var dest = $window.prompt('Please type the name of the parent node to move to');
        data.moveNode($scope.originalNode.name, dest);
        data.emitRefresh();

        $timeout(function() {
            bus.emit('select', $scope.originalNode.name);
        });
    };

    $scope.addNode = function() {
        data.addNode($scope.originalNode.name);
        data.emitRefresh();

        $timeout(function() {
            bus.emit('select', 'New node');
        });
    };

    $scope.addDependency = function() {
        if (typeof ($scope.node.dependsOn) === 'undefined') {
            $scope.node.dependsOn = [];
        }
        $scope.node.dependsOn.push('');
    };

    $scope.deleteDependency = function(index) {
        $scope.node.dependsOn.splice(index, 1);
    };

    $scope.addTechno = function() {
        if (typeof ($scope.node.technos) === 'undefined') {
            $scope.node.technos = [];
        }
        $scope.node.technos.push('');
    };

    $scope.deleteTechno = function(index) {
        $scope.node.technos.splice(index, 1);
    };

    $scope.addHost = function(key) {
        if (typeof ($scope.node.host[key]) === 'undefined') {
            $scope.node.host[key] = [];
        }
        $scope.node.host[key].push('');
    };

    $scope.deleteHost = function(key, index) {
        $scope.node.host[key].splice(index, 1);
    };

    $scope.addHostCategory = function() {
        if (typeof ($scope.node.host) === 'undefined') {
            $scope.node.host = {};
        }
        $scope.node.host[''] = [];
        $scope.hostKeys[''] = '';
    };

    $scope.deleteHostCategory = function(key) {
        delete $scope.hostKeys[key];
        delete $scope.node.host[key];
    };
});
