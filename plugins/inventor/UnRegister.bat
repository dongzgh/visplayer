@echo off

echo Registering visPlayerAddIn...

if exist Release\visPlayerAddIn.dll (
regsvr32 /u Release\visPlayerAddIn.dll
)

if exist X64\Release\visPlayerAddIn.dll (
regsvr32 /u X64\Release\visPlayerAddIn.dll
)