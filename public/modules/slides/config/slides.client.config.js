'use strict';

// Configuring the Slides module
angular.module('slides').run(['$rootScope', 'Menus', 'Tools', 'Trees', 'Dialogs', 'Languages',
  function($rootScope, Menus, Tools, Trees, Dialogs, Languages) {
    // Set language for now here
    Languages.code = 'eng';
    $rootScope.language = Languages.localization();
    if($rootScope.language === undefined)
        $rootScope.language = Languages.localization('eng');
    var language = $rootScope.language;

    // Adding tools
    Tools.addTool('sidebar');
    Tools.addTool('files');
    Tools.addTool('scene');
    Tools.addTool('modeling');

    // Set sidebar tool items
    Tools.addToolItem('sidebar', 'files', 'icon-files', 'slides/edit/files', undefined, undefined, language.sidebar.files);    
    Tools.addToolItem('sidebar', 'scene', 'icon-scenes', 'slides/edit/scene', undefined, undefined, language.sidebar.scene);
    Tools.addToolItem('sidebar', 'modeling', 'icon-tools', 'slides/edit/modeling', undefined, undefined, language.sidebar.modeling);
    

    // Set files tool items
    Tools.addToolItem('files', 'upload', 'icon-upload', undefined, undefined, 'uploadFiles', language.files.upload);
    Tools.addToolItem('files', 'download', 'icon-download', undefined, undefined, 'downloadFiles', language.files.download);
    Tools.addToolItem('files', 'load', 'icon-load', undefined, undefined, 'loadFiles', language.files.load);
    Tools.addToolItem('files', 'delete', 'icon-delete', undefined, undefined, 'deleteFiles', language.files.delete);

    // Set scene tool items
    Tools.addToolItem('scene', 'snapshot', 'icon-snapshot', undefined, undefined, 'takeSnapshot', language.scene.snapshot);
    Tools.addToolItem('scene', 'delete', 'icon-delete', undefined, undefined, 'removeObjects', language.scene.delete);

    // Set modeling tool items
    Tools.addToolItem('modeling', 'createBox', 'icon-box', undefined, undefined, 'createBox', language.modeling.createBox);
    Tools.addToolItem('modeling', 'serialize', 'icon-serialize', undefined, undefined, 'serialize', language.modeling.createBox);
    Tools.addToolItem('modeling', 'viewFit', 'icon-view-fit', undefined, undefined, 'viewFit', language.modeling.viewFit);
    Tools.addToolItem('modeling', 'viewTop', 'icon-view-top', undefined, undefined, 'viewTop', language.modeling.viewTop);
    Tools.addToolItem('modeling', 'viewBottom', 'icon-view-bottom', undefined, undefined, 'viewBottom', language.modeling.viewBottom);
    Tools.addToolItem('modeling', 'viewLeft', 'icon-view-left', undefined, undefined, 'viewLeft', language.modeling.viewLeft);
    Tools.addToolItem('modeling', 'viewRight', 'icon-view-right', undefined, undefined, 'viewRight', language.modeling.viewRight);
    Tools.addToolItem('modeling', 'viewFront', 'icon-view-front', undefined, undefined, 'viewFront', language.modeling.viewFront);
    Tools.addToolItem('modeling', 'viewBack', 'icon-view-back', undefined, undefined, 'viewBack', language.modeling.viewBack);
    Tools.addToolItem('modeling', 'viewClear', 'icon-pick-nothing', undefined, undefined, 'viewClear', language.modeling.viewClear);
    Tools.addToolItem('modeling', 'pickModel', 'icon-pick-model', undefined, false, 'pickModel', language.modeling.pickModel);
    Tools.addToolItem('modeling', 'pickFace', 'icon-pick-face', undefined, false, 'pickFace', language.modeling.pickFace);
    Tools.addToolItem('modeling', 'pickEdge', 'icon-pick-edge', undefined, false, 'pickEdge', language.modeling.pickEdge);
    Tools.addToolItem('modeling', 'pickCurve', 'icon-pick-curve', undefined, false, 'pickCurve', language.modeling.pickCurve);
    Tools.addToolItem('modeling', 'pickPoint', 'icon-pick-point', undefined, false, 'pickPoint', language.modeling.pickPoint);
    Tools.addToolItem('modeling', 'displayShaded', 'icon-display-shaded', undefined, undefined, 'displayShaded', language.modeling.displayShaded);
    Tools.addToolItem('modeling', 'displayRendered', 'icon-display-rendered', undefined, undefined, 'displayRendered', language.modeling.displayRendered);
    Tools.addToolItem('modeling', 'displayAnalysis', 'icon-display-analysis', undefined, undefined, 'displayAnalysis', language.modeling.displayAnalysis);
    Tools.addToolItem('modeling', 'displayMesh', 'icon-display-mesh', undefined, undefined, 'displayMesh', language.modeling.displayMesh);
    Tools.addToolItem('modeling', 'displayWireframe', 'icon-display-wireframe', undefined, undefined, 'displayWireframe', language.modeling.displayWireframe);
    Tools.addToolItem('modeling', 'translate', 'icon-translate', undefined, undefined, 'translate', language.modeling.translate);

    // Adding trees
    Trees.addTree('scene');
    Trees.addTree('files');

    // Set file tree node items
    Trees.addTreeItem('files', 'Models', 'icon-file', 'models');

    // Set scene tree node items
    Trees.addTreeItem('scene', 'Models', 'icon-file', 'models');
  }
]);

// Configure http interseptor
angular.module('slides').factory('httpResponseInterceptor', ['$q', function($q) {
    return {
      response: function(res) {
        return res || $q.when(res);
      }
    };
  }])
  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('httpResponseInterceptor');
  }]);
