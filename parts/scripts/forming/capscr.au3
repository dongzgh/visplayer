; Change working directory
FileChangeDir("C:\Temp\dieface")

; Start application.
Run("C:\FTI\FormingSuite\FS.exe")
Local $hApp = WinWaitActive("FormingSuite")
WinSetState($hApp, "", @SW_MAXIMIZE)

; Search for files
Local $hSearch = FileFindFirstFile("*.*")
While 1
   ; Find a file
   Local $sFileName = FileFindNextFile($hSearch)
   If @error Then ExitLoop

   ; Check picture file
   Local $sPicName = StringTrimRight($sFileName, 3)
   $sPicName &= "jpg"
   If FileExists($sPicName) Then ContinueLoop

   ; New a project
   WinActivate($hApp)
   WinWaitActive($hApp)
   WinMenuSelectItem($hApp, "", "&Project", "&New")

   ; Enter Part Definition workbench
   WinActivate($hApp)
   WinWaitActive($hApp)
   WinMenuSelectItem($hApp, "", "Work&bench", "Part Definition")

   ; Open Import Geometry dialog box
   WinActivate($hApp)
   WinWaitActive($hApp)
   ControlClick($hApp, "", "[CLASS:ToolbarWindow32; INSTANCE:5]", "left", 1, 18, 25)
   Local $hOpen = WinWaitActive("Open")

   ; Change file selection filter to IGES
   WinActivate($hOpen)
   WinWaitActive($hOpen)
   ControlCommand($hOpen, "", "[CLASS:ComboBox; INSTANCE:2]", "SelectString", "IGES Files (*.igs *.iges)")

   ; Send file name to be opened
   WinActivate($hOpen)
   WinWaitActive($hOpen)
   ControlSetText($hOpen, "", "[CLASS:Edit; INSTANCE:1]", $sFileName)

   ; Open file
   WinActivate($hOpen)
   WinWaitActive($hOpen)
   ControlClick($hOpen, "", "[CLASS:Button; INSTANCE:1]")
   Sleep(5000)
   While 1
	  Local $sStatus = StatusbarGetText($hApp)
	  If $sStatus == "Ready" Then ExitLoop
   WEnd

   ; Capture screen
   WinActivate($hApp)
   WinWaitActive($hApp)
   WinMenuSelectItem($hApp, "", "&Project", "Scr&een Capture")
   Local $hSaveAs = WinWaitActive("Save As")

   ; Send file name to be saved
   WinActivate($hSaveAs)
   WinWaitActive($hSaveAs)
   ControlSetText($hSaveAs, "", "[CLASS:Edit; INSTANCE:1]", $sPicName)

   ; Save screen picture
   WinActivate($hSaveAs)
   WinWaitActive($hSaveAs)
   ControlClick($hSaveAs, "", "[CLASS:Button; INSTANCE:1]");
   Sleep(5000)
   While 1
	  Local $sStatus = StatusbarGetText($hApp)
	  If $sStatus == "Ready" Then ExitLoop
   WEnd

   ; Close file
   WinActivate($hApp)
   WinWaitActive($hApp)
   WinMenuSelectItem($hApp, "", "&Project", "&Close")
   Local $hClose = WinWaitActive("[CLASS:#32770]")

   ; Confirm close
   WinActivate($hClose)
   WinWaitActive($hClose)
   ControlClick($hClose, "", "[CLASS:Button; INSTANCE:2]")
WEnd

; Finish search
FileClose($hSearch)

; Close application
WinClose($hApp)
