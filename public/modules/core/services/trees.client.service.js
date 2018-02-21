'use strict';

//Tree service used for managing  trees
angular.module('core').service('Trees', ['$log',
  function($log) {
    // Define a set of default roles
    this.defaultRoles = ['*'];

    // Define the trees object
    this.trees = {};

    // A private function for rendering decision
    var shouldRender = function(user) {
      if(user) {
        if(this.roles.indexOf('*') !== -1) {
          return true;
        } else {
          for(let userRoleIndex in user.roles) {
            if(user.roles[userRoleIndex]) {
              for(let roleIndex in this.roles) {
                if(this.roles[roleIndex] && this.roles[roleIndex] === user.roles[userRoleIndex]) {
                  return true;
                }
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
      if(treeId && treeId.length) {
        if(!this.trees[treeId]) {
          $log.error('Tree does not exists');
          return false;
        }
      }
      return true;
    };

    // Get the tree object by tree id
    this.getTree = function(treeId) {
      // Validate that the tree exists
      if(!this.validateTreeExistance(treeId)) {
        return;
      }

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

    // Empty existing tree objects
    this.emptyTree = function(treeId) {
      // Validate that the tree exists
      if(!this.validateTreeExistance(treeId)) {
        return;
      }

      // Search for tree item to remove
      for(let itemIndex in this.trees[treeId].items) {
        if(this.trees[treeId].items[itemIndex]) {
          this.trees[treeId].items[itemIndex].items = [];
        }
      }
    };

    // Remove existing tree object by tree id
    this.removeTree = function(treeId) {
      // Validate that the tree exists
      if(!this.validateTreeExistance(treeId)) {
        return;
      }

      // Return the tree object
      delete this.trees[treeId];
    };

    // Validate tree item existance
    this.validateTreeItemExistance = function(treeId, treeItemURL) {
      if(treeItemURL && treeItemURL.length) {
        for(let itemIndex in this.trees[treeId].items) {
          if(this.trees[treeId].items[itemIndex] && this.trees[treeId].items[itemIndex].link === treeItemURL) {
            $log.error('Tree item is already existant');
            return false;
          }
        }
      }
      return true;
    };

    // Add tree item object
    this.addTreeItem = function(treeId, treeItemTitle, treeItemIcon, treeItemURL, isPublic, roles) {
      // Validate that the tree exists
      if(!this.validateTreeExistance(treeId)) {
        return;
      }

      // Validate that the tree item exists
      if(!this.validateTreeItemExistance(treeId, treeItemURL)) {
        return;
      }

      // Push new tree item
      this.trees[treeId].items.push({
        title: treeItemTitle,
        icon: treeItemIcon,
        link: treeItemURL,
        isPublic: ((isPublic === null || isPublic === undefined) ? this.trees[treeId].isPublic : isPublic),
        roles: ((roles === null || roles === undefined) ? this.trees[treeId].roles : roles),
        items: [],
        checked: false,
        shouldRender: shouldRender
      });

      // Return the tree object
      return this.trees[treeId];
    };

    // Remove existing tree object by tree id
    this.removeTreeItem = function(treeId, treeItemURL) {
      // Validate that the tree exists
      if(!this.validateTreeExistance(treeId)) {
        return;
      }

      // Search for tree item to remove
      for(let itemIndex in this.trees[treeId].items) {
        if(this.trees[treeId].items[itemIndex].link === treeItemURL) {
          this.trees[treeId].items.splice(itemIndex, 1);
        }
      }

      // Return the tree object
      return this.trees[treeId];
    };

    // Validate tree item existance
    this.validateSubTreeItemExistance = function(treeId, rootTreeItemURL, subtreeItemURL) {
      if(subtreeItemURL && subtreeItemURL.length) {
        for(let itemIndex in this.trees[treeId].items) {
          if(this.trees[treeId].items[itemIndex].link === rootTreeItemURL) {
            for(let subitemIndex in this.trees[treeId].items[itemIndex].items) {
              if(this.trees[treeId].items[itemIndex].items[subitemIndex].link === subtreeItemURL) {
                $log.error('Sub tree item is already existant');
                return false;
              }
            }
          }
        }
      }
      return true;
    };

    // Add subtree item object
    this.addSubTreeItem = function(treeId, rootTreeItemURL, treeItemTitle, treeItemIcon, treeItemURL, isPublic, roles) {
      // Validate that the tree exists
      if(!this.validateTreeExistance(treeId)) {
        return;
      }

      // Validate that the tree item exists
      if(!this.validateTreeItemExistance(treeId, treeItemURL)) {
        return;
      }

      // Validate that the tree exists
      if(!this.validateSubTreeItemExistance(treeId, rootTreeItemURL, treeItemURL)) {
        return;
      }

      // Search for tree item
      for(let itemIndex in this.trees[treeId].items) {
        if(this.trees[treeId].items[itemIndex] && this.trees[treeId].items[itemIndex].link === rootTreeItemURL) {
          // Push new subtree item
          this.trees[treeId].items[itemIndex].items.push({
            title: treeItemTitle,
            icon: treeItemIcon,
            link: treeItemURL,
            isPublic: ((isPublic === null || isPublic === undefined) ? this.trees[treeId].items[itemIndex].isPublic : isPublic),
            roles: ((roles === null || roles === undefined) ? this.trees[treeId].items[itemIndex].roles : roles),
            checked: false,
            shouldRender: shouldRender
          });
        }
      }

      // Return the tree object
      return this.trees[treeId];
    };

    // Remove existing tree object by tree id
    this.removeSubTreeItem = function(treeId, subtreeItemURL) {
      // Validate that the tree exists
      if(!this.validateTreeExistance(treeId)) {
        return;
      }

      // Search for tree item to remove
      for(let itemIndex in this.trees[treeId].items) {
        if(this.trees[treeId].items[itemIndex]) {
          for(let subitemIndex in this.trees[treeId].items[itemIndex].items) {
            if(this.trees[treeId].items[itemIndex].items[subitemIndex] && this.trees[treeId].items[itemIndex].items[subitemIndex].link === subtreeItemURL) {
              this.trees[treeId].items[itemIndex].items.splice(subitemIndex, 1);
            }
          }
        }
      }

      // Return the tree object
      return this.trees[treeId];
    };

    // Select subtree items
    this.checkAllSubTreeItems = function(treeId, rootTreeItemURL, checked) {
      // Validate that the tree exists
      if(!this.validateTreeExistance(treeId)) {
        return;
      }

      // Search for subtree items
      for(let itemIndex in this.trees[treeId].items) {
        if(this.trees[treeId].items[itemIndex] && this.trees[treeId].items[itemIndex].link === rootTreeItemURL) {
          let item = this.trees[treeId].items[itemIndex];
          if(item.items !== undefined && item.items.length > 0) {
            for(let subitemIndex in item.items) {
              if(item.items[subitemIndex]) {
                item.items[subitemIndex].checked = checked;
              }
            }
          }
        }
      }
    };

    // Get checked tree object
    this.getCheckedSubTreeItems = function(treeId) {
      // Validate that the tree exists
      if(!this.validateTreeExistance(treeId)) {
        return;
      }

      // Search for tree item to remove
      let items = [];
      for(let itemIndex in this.trees[treeId].items) {
        if(this.trees[treeId].items[itemIndex]) {
          for(let subitemIndex in this.trees[treeId].items[itemIndex].items) {
            if(this.trees[treeId].items[itemIndex].items[subitemIndex] && this.trees[treeId].items[itemIndex].items[subitemIndex].checked) {
              items.push(this.trees[treeId].items[itemIndex].items[subitemIndex]);
            }
          }
        }
      }

      // Return the tree object
      return items;
    };
  }
]);