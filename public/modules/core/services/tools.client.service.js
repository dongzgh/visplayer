'use strict';

//Tool service used for managing  tools
angular.module('core').service('Tools', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the tools object
		this.tools = {};

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

		// Validate tool existance
		this.validateToolExistance = function(toolId) {
			if (toolId && toolId.length) {
				if (this.tools[toolId]) {
					return true;
				} else {
					throw new Error('Tool does not exists');
				}
			} else {
				throw new Error('ToolId was not provided');
			}

			return false;
		};

		// Get the tool object by tool id
		this.getTool = function(toolId) {
			// Validate that the tool exists
			this.validateToolExistance(toolId);

			// Return the tool object
			return this.tools[toolId];
		};

		// Add new tool object by tool id
		this.addTool = function(toolId, isPublic, roles) {
			// Create the new tool
			this.tools[toolId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the tool object
			return this.tools[toolId];
		};

		// Remove existing tool object by tool id
		this.removeTool = function(toolId) {
			// Validate that the tool exists
			this.validateToolExistance(toolId);

			// Return the tool object
			delete this.tools[toolId];
		};

		// Add tool item object
		this.addToolItem = function(toolId, toolItemTitle, toolItemURL, toolItemIcon, toolItemType, toolItemUIRoute, isPublic, roles, position) {
			// Validate that the tool exists
			this.validateToolExistance(toolId);

			// Push new tool item
			this.tools[toolId].items.push({
				title: toolItemTitle,
				icon: toolItemIcon,
				link: toolItemURL,
				toolItemType: toolItemType || 'item',
				toolItemClass: toolItemType,
				uiRoute: toolItemUIRoute || ('/' + toolItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.tools[toolId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.tools[toolId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the tool object
			return this.tools[toolId];
		};

		// Add subtool item object
		this.addSubToolItem = function(toolId, rootToolItemURL, toolItemTitle, toolItemIcon, toolItemURL, toolItemUIRoute, isPublic, roles, position) {
			// Validate that the tool exists
			this.validateToolExistance(toolId);

			// Search for tool item
			for (var itemIndex in this.tools[toolId].items) {
				if (this.tools[toolId].items[itemIndex].link === rootToolItemURL) {
					// Push new subtool item
					this.tools[toolId].items[itemIndex].items.push({
						title: toolItemTitle,
						icon: toolItemIcon,
						link: toolItemURL,
						uiRoute: toolItemUIRoute || ('/' + toolItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.tools[toolId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.tools[toolId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the tool object
			return this.tools[toolId];
		};

		// Remove existing tool object by tool id
		this.removeToolItem = function(toolId, toolItemURL) {
			// Validate that the tool exists
			this.validateToolExistance(toolId);

			// Search for tool item to remove
			for (var itemIndex in this.tools[toolId].items) {
				if (this.tools[toolId].items[itemIndex].link === toolItemURL) {
					this.tools[toolId].items.splice(itemIndex, 1);
				}
			}

			// Return the tool object
			return this.tools[toolId];
		};

		// Remove existing tool object by tool id
		this.removeSubToolItem = function(toolId, subtoolItemURL) {
			// Validate that the tool exists
			this.validateToolExistance(toolId);

			// Search for tool item to remove
			for (var itemIndex in this.tools[toolId].items) {
				for (var subitemIndex in this.tools[toolId].items[itemIndex].items) {
					if (this.tools[toolId].items[itemIndex].items[subitemIndex].link === subtoolItemURL) {
						this.tools[toolId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the tool object
			return this.tools[toolId];
		};

		//Adding the topbar tool
		this.addTool('sidebar');
	}
]);