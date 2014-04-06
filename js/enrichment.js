(function(exports) {

  /**
   * Get an array of all technos in a list of nodes
   */
  exports.computeTechnos = function(nodes) {
    var technos = {};
    nodes.forEach(function(node) {
      if (node.technos) {
        node.technos.forEach(function(techno) {
          technos[techno] = true;
        });
      }
    });
    return Object.keys(technos).sort();
  };

  /**
   * Get an array of all hosts in a list of nodes
   */
  exports.computeHost = function(nodes) {
    var host = {};
    nodes.forEach(function(node) {
      if (node.host) {
        for (var i in node.host) {
          host[i] = true;
        }
      }
    });
    return Object.keys(host).sort();
  };

  /**
   * Enrich a list of nodes by adding dependends and details
   * 
   * Mutates the given array of nodes.
   */
  exports.enrich = function(nodes) {
    addDependents(nodes);
    nodes.map(function(node) {
      addDetails(node);
    });
  };

  /**
   * For an array of nodes, add a dependents array to each node based on dependsOn property.
   *
   * Mutates the given array of nodes.
   */
  var addDependents = function(nodes) {
    var dependents = [];
    nodes.forEach(function(node) {
      if (node.dependsOn) {
        node.dependsOn.forEach(function(dependsOn) {
          if (!dependents[dependsOn]) {
            dependents[dependsOn] = [];
          }
          dependents[dependsOn].push(node.name);
        });
      }
    });
    nodes.forEach(function(node, index) {
      if (dependents[node.name]) {
        nodes[index].dependents = dependents[node.name];
      }
    });
  };

  /**
   * Add details to a node, including inherited ones (shown between parentheses).
   *
   * Mutates the given node (datum).
   *
   * Example added properties:
   * {
   *   details: { // for display only
   *     Dependencies: ["Foo", "Bar (Babar)"],
   *     Dependents: ["Baz", "Buzz"];
   *     Technos: ["Foo", "Bar (Babar)" }
   *     Host: ["OVH", "fo (Foo)"]
   *   },
   *   index: { // for filters only
   *     relatedNodes: ["Foo", "Bar", "Baz", "Buzz"],
   *     technos: ["Foo", "Bar"],
   *     host: ["OVH", "fo"] 
   *   }
   * }
   */
  var addDetails = function(d) {
    d.details = {};
    d.index = {
      relatedNodes: [],
      technos: [],
      host: []
    };
    var dependsOn = getDetailCascade(d, 'dependsOn');
    if (dependsOn.length > 0) {
      d.details.Dependencies = dependsOn.map(getValueAndAncestor);
      d.index.relatedNodes = d.index.relatedNodes.concat(dependsOn.map(getValue));
    }
    if (d.dependents) {
      d.details.Dependents = d.dependents;
      d.index.relatedNodes = d.index.relatedNodes.concat(d.dependents);
    }
    var technos = getDetailCascade(d, 'technos');
    if (technos.length > 0) {
      d.details.Technos = technos.map(getValueAndAncestor);
      d.index.technos = technos.map(getValue);
    }
    if (d.host) {
      d.details.Host = [];
      d.index.host = [];
      for (var i in d.host) {
        d.details.Host.push(i);
        d.index.host.push(i);
      }
    }
  };

  var getDetailCascade = function(d, detailName, via) {
    var values = [];
    if (d[detailName]) {
      d[detailName].forEach(function(value) {
        values.push({ value: value, via: via });
      });
    }
    if (d.parent) {
      values = values.concat(getDetailCascade(d.parent, detailName, d.parent.name));
    }
    return values;
  };

  var getValueAndAncestor = function(detail) {
    return detail.via ? detail.value + ' (' + detail.via + ')' : detail.value;
  };

  var getValue = function(detail) {
    return detail.value;
  };

})(window);
