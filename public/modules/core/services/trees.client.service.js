'use strict';

//Tree service used for managing  trees
angular.module('core').service('Trees', [

  function() {
    // Define a set of default roles
    this.defaultRoles = ['*'];

    // Define the trees object
    this.trees = {};

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

    // Validate tree existance
    this.validateTreeExistance = function(treeId) {
      if (treeId && treeId.length) {
        if (this.trees[treeId]) {
          return true;
        } else {
          throw new Error('Tree does not exists');
        }
      } else {
        throw new Error('TreeId was not provided');
      }

      return false;
    };

    // Get the tree object by tree id
    this.getTree = function(treeId) {
      // Validate that the tree exists
      this.validateTreeExistance(treeId);

      // Return the tree object
      return this.trees[treeId];
    };

    // Add new tree object by tree id
    this.addTree = function(treeId, isPublic, roles) {
      // Create the new tree
      this.trees[treeId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      };

      // Return the tree object
      return this.trees[treeId];
    };

    // Remove existing tree object by tree id
    this.removeTree = function(treeId) {
      // Validate that the tree exists
      this.validateTreeExistance(treeId);

      // Return the tree object
      delete this.trees[treeId];
    };

    // Add tree item object
    this.addTreeItem = function(treeId, treeItemTitle, treeItemIcon, treeItemURL, isPublic, roles) {
      // Validate that the tree exists
      this.validateTreeExistance(treeId);

      // Push new tree item
      this.trees[treeId].items.push({
        title: treeItemTitle,
        icon: treeItemIcon,
        link: treeItemURL,
        isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.trees[treeId].isPublic : isPublic),
        roles: ((roles === null || typeof roles === 'undefined') ? this.trees[treeId].roles : roles),
        items: [],
        shouldRender: shouldRender
      });

      // Return the tree object
      return this.trees[treeId];
    };

    // Add subtree item object
    this.addSubTreeItem = function(treeId, rootTreeItemURL, treeItemTitle, treeItemIcon, treeItemWidgets, treeItemURL, isPublic, roles) {
      // Validate that the tree exists
      this.validateTreeExistance(treeId);

      // Search for tree item
      for (var itemIndex in this.trees[treeId].items) {
        if (this.trees[treeId].items[itemIndex].link === rootTreeItemURL) {
          // Push new subtree item
          this.trees[treeId].items[itemIndex].items.push({
            title: treeItemTitle,
            icon: treeItemIcon,
            widgets: treeItemWidgets,
            link: treeItemURL,
            isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.trees[treeId].items[itemIndex].isPublic : isPublic),
            roles: ((roles === null || typeof roles === 'undefined') ? this.trees[treeId].items[itemIndex].roles : roles),
            shouldRender: shouldRender
          });
        }
      }

      // Return the tree object
      return this.trees[treeId];
    };

    // Remove existing tree object by tree id
    this.removeTreeItem = function(treeId, treeItemURL) {
      // Validate that the tree exists
      this.validateTreeExistance(treeId);

      // Search for tree item to remove
      for (var itemIndex in this.trees[treeId].items) {
        if (this.trees[treeId].items[itemIndex].link === treeItemURL) {
          this.trees[treeId].items.splice(itemIndex, 1);
        }
      }

      // Return the tree object
      return this.trees[treeId];
    };

    // Remove existing tree object by tree id
    this.removeSubTreeItem = function(treeId, subtreeItemURL) {
      // Validate that the tree exists
      this.validateTreeExistance(treeId);

      // Search for tree item to remove
      for (var itemIndex in this.trees[treeId].items) {
        for (var subitemIndex in this.trees[treeId].items[itemIndex].items) {
          if (this.trees[treeId].items[itemIndex].items[subitemIndex].link === subtreeItemURL) {
            this.trees[treeId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the tree object
      return this.trees[treeId];
    };

    // Adding the file tree tree
    this.addTree('fileTree');

    // Adding the scene tree tree
    this.addTree('sceneTree');
  }
]);
