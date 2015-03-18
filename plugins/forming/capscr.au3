Run("C:\FTI\FormingSuite\FS.exe");
Local $app = WinWaitActive("FormingSuite");
WinMenuSelectItem($app, "", "&Project", "&New");
WinWaitActive($app);
WinMenuSelectItem($app, "", "Work&bench", "Part Definition");
ControlClick($app, "", "[ID:133]", "left", 1, 18, 25);
Local $open = WinWaitActive("Open");
ControlClick($open, "", "[ID:1136]");
ControlCommand($open, "", "[ID:1136]", "SelectString", "IGES Files (*.igs; *.iges)");