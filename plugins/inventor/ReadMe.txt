  visPlayerAddIn Sample
  =======================
  
  DESCRIPTION
  This is the AddIn for visPlayer operations for Inventor

  How to run this sample:
  1) Register the AddIn dll (Release/visPlayerAddIn.dll) using regsvr32.exe
      (type regsvr32 "dllName.dll" at the command prompt)
  Note: If you build the sample, then you don't need to explicitly register using the 
  above step
  2) Startup Inventor, the AddIn should be loaded
  
  In UI and if you open a part document and activate a sketch and you can see the "visPlayer" panel on "Sketch" tab.

  To unregister the AddIn, use regsvr32.exe (type regsvr32 /u "dllName.dll" at the command prompt)

  Language/Compiler: VC++ 2005
  Server: Inventor.

 