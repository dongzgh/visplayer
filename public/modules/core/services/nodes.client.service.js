'use strict';

//Node service used for managing  nodes
angular.module('core').service('Nodes', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the nodes object
		this.nodes = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate node existance
		this.validateNodeExistance = function(nodeId) {
			if (nodeId && nodeId.length) {
				if (this.nodes[nodeId]) {
					return true;
				} else {
					throw new Error('Node does not exists');
				}
			} else {
				throw new Error('NodeId was not provided');
			}

			return false;
		};

		// Get the node object by node id
		this.getNode = function(nodeId) {
			// Validate that the node exists
			this.validateNodeExistance(nodeId);

			// Return the node object
			return this.nodes[nodeId];
		};

		// Add new node object by node id
		this.addNode = function(nodeId, isPublic, roles) {
			// Create the new node
			this.nodes[nodeId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the node object
			return this.nodes[nodeId];
		};

		// Remove existing node object by node id
		this.removeNode = function(nodeId) {
			// Validate that the node exists
			this.validateNodeExistance(nodeId);

			// Return the node object
			delete this.nodes[nodeId];
		};

		// Add node item object
		this.addNodeItem = function(nodeId, nodeItemTitle, nodeItemIcon, nodeItemURL, nodeItemType, isPublic, roles) {
			// Validate that the node exists
			this.validateNodeExistance(nodeId);

			// Push new node item
			this.nodes[nodeId].items.push({
				title: nodeItemTitle,
				icon: nodeItemIcon,
				link: nodeItemURL,
				nodeItemType: nodeItemType || 'item',
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.nodes[nodeId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.nodes[nodeId].roles : roles),
				items: [],
				shouldRender: shouldRender
			});

			// Return the node object
			return this.nodes[nodeId];
		};

		// Add subnode item object
		this.addSubNodeItem = function(nodeId, rootNodeItemURL, nodeItemTitle, nodeItemIcon, nodeItemWidgets, nodeItemURL, isPublic, roles) {
			// Validate that the node exists
			this.validateNodeExistance(nodeId);

			// Search for node item
			for (var itemIndex in this.nodes[nodeId].items) {
				if (this.nodes[nodeId].items[itemIndex].link === rootNodeItemURL) {
					// Push new subnode item
					this.nodes[nodeId].items[itemIndex].items.push({
						title: nodeItemTitle,
						icon: nodeItemIcon,
						widgets: nodeItemWidgets,
						link: nodeItemURL,
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.nodes[nodeId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.nodes[nodeId].items[itemIndex].roles : roles),
						shouldRender: shouldRender
					});
				}
			}

			// Return the node object
			return this.nodes[nodeId];
		};

		// Remove existing node object by node id
		this.removeNodeItem = function(nodeId, nodeItemURL) {
			// Validate that the node exists
			this.validateNodeExistance(nodeId);

			// Search for node item to remove
			for (var itemIndex in this.nodes[nodeId].items) {
				if (this.nodes[nodeId].items[itemIndex].link === nodeItemURL) {
					this.nodes[nodeId].items.splice(itemIndex, 1);
				}
			}

			// Return the node object
			return this.nodes[nodeId];
		};

		// Remove existing node object by node id
		this.removeSubNodeItem = function(nodeId, subnodeItemURL) {
			// Validate that the node exists
			this.validateNodeExistance(nodeId);

			// Search for node item to remove
			for (var itemIndex in this.nodes[nodeId].items) {
				for (var subitemIndex in this.nodes[nodeId].items[itemIndex].items) {
					if (this.nodes[nodeId].items[itemIndex].items[subitemIndex].link === subnodeItemURL) {
						this.nodes[nodeId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the node object
			return this.nodes[nodeId];
		};

		//Adding the tree node
		this.addNode('tree');
	}
]);
