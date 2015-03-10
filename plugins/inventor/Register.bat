@echo off

echo Registering visPlayerAddIn...

if exist Release\visPlayer.dll (
regsvr32 Release\visPlayerAddIn.dll
)

if exist X64\Release\visPlayerAddIn.dll (
regsvr32 X64\Release\visPlayerAddIn.dll
)