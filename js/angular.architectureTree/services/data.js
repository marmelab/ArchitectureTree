

angular.module('ChartsApp').service('data', function ($http, $q, bus) {
    'use strict';

    var jsonData;

    /**
     * Get the tree object from json file
     * @returns {Promise}
     */
    var fetchJsonData = function () {
        if (typeof (jsonData) !== 'undefined') {
            return $q.when(jsonData);
        }

        return $http.get("data.json").success(function(data) {
            setJsonData(data);
            return data;
        });
    };

    var emitRefresh = function() {
        bus.emit('updateData', jsonData);
    };

    /**
     * Get the tree object
     */
    var getJsonData = function () {
        return jsonData;
    };

    /**
     * Set the tree object
     */
    var setJsonData = function (data) {
        jsonData = data;
        emitRefresh();
    };

    var getNodeByName = function(name, data) {
        data = data || jsonData;
        if (data.name === name) {
            return data;
        }
        if (!data.children) return null;
        for (var i = data.children.length - 1; i >= 0; i--) {
            var matchingNode = getNodeByName(name, data.children[i]);
            if (matchingNode) return matchingNode;
        }
    };

    var getParentNodeByName = function(name, data) {
        data = data || jsonData;
        if (!data.children) return null;
        for (var i = data.children.length - 1; i >= 0; i--) {
            if (data.children[i].name === name) return data;
            var matchingNode = getParentNodeByName(name, data.children[i]);
            if (matchingNode) return matchingNode;
        }
    };

    /**
     * Update a node using another node data
     *
     * @param {Array}  path e.g. ['foo', 'bar', 'baz']
     * @param {Object} updatedNode New node data to use
     * @param {Object} cursor
     */
    var updateNode = function(name, updatedNode) {
        var node = getNodeByName(name);
        updateDependencies(node.name, updatedNode.name);
        for (var i in updatedNode) {
            if (updatedNode.hasOwnProperty(i) && i !== 'children' && i !== 'parent' && i !== 'details') {
                node[i] = updatedNode[i];
            }
        }
    };

    /**
     * Updates a name in the tree dependencies
     * @param {String} name
     * @param {String} newName
     * @param {Object} cursor
     */
    var updateDependencies = function(name, newName, cursor) {
        cursor = cursor || jsonData;

        updateNodeDependency(name, newName, cursor);

        if(typeof(cursor.children) !== 'undefined' && cursor.children.length) {
            cursor.children.forEach(function (child) {
                updateDependencies(name, newName, child);
            });
        }
    };

    /**
     * Function destined to be used in array.map()
     */
    var removeDependencies = function(name) {
        updateDependencies(name);
    };

    /**
     * Update or remove one element in a node's dependencies
     *
     * @param {String} name
     * @param {String} newName
     * @param {Object} node
     */
    var updateNodeDependency = function(name, newName, node) {
        if (typeof(node.dependsOn) === 'undefined') {
            return;
        }
        var pos = node.dependsOn.indexOf(name);
        if (pos === -1) return;
        if (newName) {
            // rename dependency
            node.dependsOn[pos] = newName;
        } else {
            // remove dependency
            node.dependsOn.splice(pos, 1);
        }
    };

    /**
     * Adds a child node to the specified node name
     */
    var addNode = function(name, newNode) {
        newNode = newNode || { name: 'New node' };
        var node = getNodeByName(name);
        if (!node.children) {
            node.children = [];
        }
        node.children.push(newNode);
    };

    /**
     * Removes a node in the tree
     */
    var removeNode = function(name) {
        var parentNode = getParentNodeByName(name);
        if (!parentNode) return false;
        for (var i = 0, length = parentNode.children.length; i < length; i++) {
            var child = parentNode.children[i];
            if (child.name === name) {
                // we're in the final Node
                // remove the node (and children) from dependencies
                getBranchNames(child).map(removeDependencies);
                // remove the node
                return parentNode.children.splice(i, 1);
            }
        }
    };

    /**
     * Move anode under another parent
     */
    var moveNode = function(nodeName, newParentNodeName) {
        var removedNodes = removeNode(nodeName);
        if (!removedNodes || removedNodes.length === 0) return false;
        addNode(newParentNodeName, removedNodes[0]);
    };

    /**
     * Get an array of all the names in the branch
     * Including branch root name, and all descendents names
     */
    var getBranchNames = function(node) {
        var names = [node.name];
        if (node.children) {
            node.children.forEach(function(child) {
                names = names.concat(getBranchNames(child));
            });
        }
        return names;
    };

    return {
        fetchJsonData: fetchJsonData,
        getJsonData: getJsonData,
        setJsonData: setJsonData,
        emitRefresh: emitRefresh,
        getNodeByName: getNodeByName,
        updateNode: updateNode,
        addNode: addNode,
        removeNode: removeNode,
        moveNode: moveNode
    };
});
