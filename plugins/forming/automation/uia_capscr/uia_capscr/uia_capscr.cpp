// UITest.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"

#include <ctime>
#include <iostream>
#include <fstream>
using namespace std;

#define DIR "C:\\Temp\\dieface"
#define LOG "C:\\Temp\\uia_capscr.log"

// Log current time
void LogTime(ofstream & logFile)
{
	struct tm newtime;
	char am_pm[] = "AM";
	__time64_t long_time;
	char timebuf[26];
	errno_t err;

	// Get time as 64-bit integer.
	_time64( &long_time ); 
	// Convert to local time.
	err = _localtime64_s( &newtime, &long_time ); 
	if (err)	exit(1);
	if( newtime.tm_hour > 12 )        // Set up extension. 
		strcpy_s( am_pm, sizeof(am_pm), "PM" );
	if( newtime.tm_hour > 12 )        // Convert from 24-hour 
		newtime.tm_hour -= 12;					// to 12-hour clock. 
	if( newtime.tm_hour == 0 )        // Set hour to 12 if midnight.
		newtime.tm_hour = 12;

	// Convert to an ASCII representation. 
	err = asctime_s(timebuf, 26, &newtime);
	if (err) exit(1);
	char msg[1024];
	sprintf_s(msg, "%.19s %s", timebuf, am_pm );
	logFile << msg << ": ";
}

// Find element by type and name
HRESULT FindElementByTypeByName(
	IUIAutomation *i_pAutomation, IUIAutomationElement * i_pRootElement, 
	long i_lElementTypeId, CString & i_strElementName, TreeScope i_eTreeScope, 
	IUIAutomationElement ** i_ppElement)
{
	HRESULT hr;
	IUIAutomationCondition * pTypeCondition = NULL;
	IUIAutomationCondition * pNameCondition = NULL;
	IUIAutomationCondition * pAndCondition = NULL;

	// Create edit type condition
	VARIANT varTypeProp;
	varTypeProp.vt = VT_I4;
	varTypeProp.llVal = i_lElementTypeId;
	hr = i_pAutomation->CreatePropertyCondition(UIA_ControlTypePropertyId, varTypeProp, &pTypeCondition);
	if (FAILED(hr) || pTypeCondition == NULL) {hr = S_FALSE; goto CleanUp;}

	// Create edit name condition
	VARIANT varNameProp;
	varNameProp.vt = VT_BSTR;
	varNameProp.bstrVal = i_strElementName.AllocSysString();
	hr = i_pAutomation->CreatePropertyCondition(UIA_NamePropertyId, varNameProp, &pNameCondition);
	if (FAILED(hr) || pNameCondition == NULL) {hr = S_FALSE; goto CleanUp;}

	// Create AND condition	
	hr = i_pAutomation->CreateAndCondition(pTypeCondition, pNameCondition, &pAndCondition);
	if(FAILED(hr) || pAndCondition == NULL) {hr = S_FALSE; goto CleanUp;}

	// Find element
	hr = i_pRootElement->FindFirst(i_eTreeScope, pAndCondition, i_ppElement);
	if (FAILED(hr) || (*i_ppElement) == NULL) {hr = S_FALSE; goto CleanUp;}

CleanUp:

	// Release
	if(pTypeCondition) pTypeCondition->Release(); pTypeCondition = NULL;
	if(pNameCondition) pNameCondition->Release(); pNameCondition = NULL;
	if(pAndCondition) pAndCondition->Release(); pAndCondition = NULL;
	SysFreeString(varNameProp.bstrVal);

	// Return
	return hr;
}

// Wait window by type and name
HRESULT WaitWindowByTypeByName (
	IUIAutomation *i_pAutomation, IUIAutomationElement * i_pRootElement, 
	long i_lElementTypeId, CString & i_strElementName, TreeScope i_eTreeScope, 
	IUIAutomationElement ** i_ppElement)
{
	HRESULT hr;
	IUIAutomationWindowPattern  * pWindowPattern = NULL;
	int nCount = 0, nSleep = 100, nMaxCount = 1000;

	// Try to find element
	while(nCount < nMaxCount) {		
		hr = FindElementByTypeByName(i_pAutomation, i_pRootElement, i_lElementTypeId, i_strElementName, i_eTreeScope, i_ppElement);
		if(FAILED(hr) || (*i_ppElement) == NULL) {Sleep(nSleep); nCount++; continue;}
		break;
	}
	if(FAILED(hr) || nCount >= nMaxCount) {hr = S_FALSE; goto CleanUp;}

	// Find window pattern
	hr = (*i_ppElement)->GetCurrentPattern(UIA_WindowPatternId, reinterpret_cast<IUnknown**>(&pWindowPattern));
	if(FAILED(hr) || pWindowPattern == NULL) {hr = S_FALSE; goto CleanUp;}

	// Try to wait for input
	nCount = 0;
	while(nCount < nMaxCount) {
		WindowInteractionState eWindowState = WindowInteractionState_Running;
		hr = pWindowPattern->get_CurrentWindowInteractionState(&eWindowState);
		if(eWindowState != WindowInteractionState_ReadyForUserInteraction) {Sleep(nSleep); nCount++; continue;}
		break;
	}
	if(FAILED(hr) || nCount >= nMaxCount) {hr = S_FALSE; goto CleanUp;}

CleanUp:

	// Release
	if(pWindowPattern) pWindowPattern->Release(); pWindowPattern = NULL;

	// Return
	return hr;
}

// Wait window by type and name
HRESULT WaitStatusBar (IUIAutomation *i_pAutomation, IUIAutomationElement * i_pRootElement)
{
	HRESULT hr;
	IUIAutomationElement * pStatusElement = NULL;
	int nCount = 0, nSleep = 100, nMaxCount = 1000;

	// Try to find element
	while(nCount < nMaxCount) {		
		hr = FindElementByTypeByName(i_pAutomation, i_pRootElement, UIA_StatusBarControlTypeId, CString(_T("")), TreeScope_Descendants, &pStatusElement);
		if(FAILED(hr) || pStatusElement == NULL) {Sleep(nSleep); nCount++; continue;}
		break;
	}
	if(FAILED(hr) || nCount >= nMaxCount) {hr = S_FALSE; goto CleanUp;}

CleanUp:

	// Return
	return hr;
}

// Trigger a toolbar button
HRESULT TiggerToolbarButton (
	IUIAutomation *i_pAutomation, IUIAutomationElement * i_pAppElement, 
	CString & i_strToolbarName, long lControlTypeId, int i_nIndex)
{
	HRESULT hr;
	IUIAutomationElement * pToolbarElement = NULL;
	IUIAutomationCondition * pButtonTypeCondition = NULL;
	IUIAutomationElementArray * pButtonElements = NULL;
	IUIAutomationElement * pButtonElement = NULL;
	IUIAutomationInvokePattern * pInvokePattern = NULL;

	// Find toolbar
	hr = FindElementByTypeByName(i_pAutomation, i_pAppElement, UIA_ToolBarControlTypeId, i_strToolbarName, TreeScope_Descendants, &pToolbarElement);
	if(FAILED(hr) || pToolbarElement == NULL) {hr = S_FALSE; goto CleanUp;}

	// Create button type condition
	VARIANT varButtonTypeProp;
	varButtonTypeProp.vt = VT_I4;
	varButtonTypeProp.llVal = lControlTypeId;
	hr = i_pAutomation->CreatePropertyCondition(UIA_ControlTypePropertyId, varButtonTypeProp, &pButtonTypeCondition);
	if (FAILED(hr) || pButtonTypeCondition == NULL) {hr = S_FALSE; goto CleanUp;}

	// Find all item	
	pToolbarElement->FindAll(TreeScope_Children, pButtonTypeCondition, &pButtonElements);
	if (FAILED(hr) || pButtonElements == NULL) {hr = S_FALSE; goto CleanUp;}

	// Find button element
	hr = pButtonElements->GetElement(i_nIndex, &pButtonElement);
	if (FAILED(hr) || pButtonElement == NULL) {hr = S_FALSE; goto CleanUp;}

	// Find invoke pattern	
	hr = pButtonElement->GetCurrentPattern(UIA_InvokePatternId, reinterpret_cast<IUnknown**>(&pInvokePattern));
	if(FAILED(hr) || pInvokePattern == NULL) {hr = S_FALSE; goto CleanUp;}

	// Invoke
	hr = pInvokePattern->Invoke();
	if(FAILED(hr)) {hr = S_FALSE; goto CleanUp;}

CleanUp:

	// Release
	if(pToolbarElement) pToolbarElement->Release(); pToolbarElement = NULL;
	if(pButtonElements) pButtonElements->Release(); pButtonElements = NULL;
	if(pButtonElement) pButtonElement->Release(); pButtonElement = NULL;
	if(pInvokePattern) pInvokePattern->Release(); pInvokePattern = NULL;

	// Return
	return hr;
}

// Trigger to open a file
HRESULT TiggerOpenFile(IUIAutomation *i_pAutomation, IUIAutomationElement * i_pDialogElement, CString & i_strFilePath)
{
	HRESULT hr;
	IUIAutomationElement * pEditElement = NULL;
	BSTR bstrFileName = i_strFilePath.AllocSysString();
	IUIAutomationValuePattern * pValuePattern = NULL;
	IUIAutomationElement * pButtonElement = NULL;
	IUIAutomationInvokePattern * pInvokePattern = NULL;

	// Find edit box
	hr = FindElementByTypeByName(i_pAutomation, i_pDialogElement, UIA_EditControlTypeId, CString(_T("File name:")), TreeScope_Descendants, &pEditElement);
	if (FAILED(hr) || pEditElement == NULL) {hr = S_FALSE; goto CleanUp;}

	// Find value pattern
	hr = pEditElement->GetCurrentPattern(UIA_ValuePatternId, reinterpret_cast<IUnknown**>(&pValuePattern));
	if(FAILED(hr) || pValuePattern == NULL) {hr = S_FALSE; goto CleanUp;}

	// Set value	
	hr = pValuePattern->SetValue(bstrFileName);
	if(FAILED(hr)) {hr = S_FALSE; goto CleanUp;}

	// Find button
	hr = FindElementByTypeByName(i_pAutomation, i_pDialogElement, UIA_SplitButtonControlTypeId, CString(_T("Open")), TreeScope_Descendants, &pButtonElement);
	if (FAILED(hr) || pButtonElement == NULL) {hr = S_FALSE; goto CleanUp;}

	// Find invoke pattern
	hr = pButtonElement->GetCurrentPattern(UIA_InvokePatternId, reinterpret_cast<IUnknown**>(&pInvokePattern));
	if(FAILED(hr) || pInvokePattern == NULL) {hr = S_FALSE; goto CleanUp;}

	// Invoke
	hr = pInvokePattern->Invoke();
	if(FAILED(hr)) {hr = S_FALSE; goto CleanUp;}

CleanUp:

	// Release
	if(pEditElement) pEditElement->Release(); pEditElement = NULL;
	if(pValuePattern) pValuePattern->Release(); pValuePattern = NULL;
	if(pButtonElement) pButtonElement->Release(); pButtonElement = NULL;
	if(pInvokePattern) pInvokePattern->Release(); pInvokePattern = NULL;
	SysFreeString(bstrFileName);

	// Return
	return hr;
}

// Trigger a tree item
HRESULT TriggerTreeItem (IUIAutomation *i_pAutomation, IUIAutomationElement * i_pAppElement)
{
	HRESULT hr;
	IUIAutomationElement * pTreeElement = NULL;
	IUIAutomationElement * pItemElement = NULL;
	IUIAutomationSelectionItemPattern * pSelectItemPattern = NULL;

	// Find tree
	hr = FindElementByTypeByName(i_pAutomation, i_pAppElement, UIA_TreeControlTypeId, CString(_T("")), TreeScope_Descendants, &pTreeElement);
	if(FAILED(hr) || pTreeElement == NULL) {hr = S_FALSE; goto CleanUp;}

	// Find item
	hr = FindElementByTypeByName(i_pAutomation, pTreeElement, UIA_TreeItemControlTypeId, CString(_T("Part Definition")), TreeScope_Descendants, &pItemElement);
	if(FAILED(hr) || pItemElement == NULL) {hr = S_FALSE; goto CleanUp;}

	// Find select pattern	
	hr = pItemElement->GetCurrentPattern(UIA_SelectionItemPatternId, reinterpret_cast<IUnknown**>(&pSelectItemPattern));
	if(FAILED(hr) || pSelectItemPattern == NULL) {hr = S_FALSE; goto CleanUp;}

	// Select
	hr = pSelectItemPattern->Select();
	if(FAILED(hr)) {hr = S_FALSE; goto CleanUp;}

CleanUp:

	// Release
	if(pTreeElement) pTreeElement->Release(); pTreeElement = NULL;
	if(pItemElement) pItemElement->Release(); pItemElement = NULL;
	if(pSelectItemPattern) pSelectItemPattern->Release(); pSelectItemPattern = NULL;

	// Return
	return hr;
}

// Trigger to save a file
HRESULT TiggerSaveFile(IUIAutomation *i_pAutomation, IUIAutomationElement * i_pDialogElement, CString & i_strFilePath)
{
	HRESULT hr;
	IUIAutomationElement * pEditElement = NULL;
	BSTR bstrFileName = i_strFilePath.AllocSysString();
	IUIAutomationValuePattern * pValuePattern = NULL;
	IUIAutomationElement * pButtonElement = NULL;
	IUIAutomationInvokePattern * pInvokePattern = NULL;

	// Find edit box
	hr = FindElementByTypeByName(i_pAutomation, i_pDialogElement, UIA_EditControlTypeId, CString(_T("File name:")), TreeScope_Descendants, &pEditElement);
	if (FAILED(hr) || pEditElement == NULL) {hr = S_FALSE; goto CleanUp;}

	// Find value pattern
	hr = pEditElement->GetCurrentPattern(UIA_ValuePatternId, reinterpret_cast<IUnknown**>(&pValuePattern));
	if(FAILED(hr) || pValuePattern == NULL) {hr = S_FALSE; goto CleanUp;}

	// Set value	
	hr = pValuePattern->SetValue(bstrFileName);
	if(FAILED(hr)) {hr = S_FALSE; goto CleanUp;}

	// Find button
	hr = FindElementByTypeByName(i_pAutomation, i_pDialogElement, UIA_ButtonControlTypeId, CString(_T("Save")), TreeScope_Descendants, &pButtonElement);
	if (FAILED(hr) || pButtonElement == NULL) {hr = S_FALSE; goto CleanUp;}

	// Find invoke pattern
	hr = pButtonElement->GetCurrentPattern(UIA_InvokePatternId, reinterpret_cast<IUnknown**>(&pInvokePattern));
	if(FAILED(hr) || pInvokePattern == NULL) {hr = S_FALSE; goto CleanUp;}

	// Invoke
	hr = pInvokePattern->Invoke();
	if(FAILED(hr)) {hr = S_FALSE; goto CleanUp;}

CleanUp:

	// Release
	if(pEditElement) pEditElement->Release(); pEditElement = NULL;
	if(pValuePattern) pValuePattern->Release(); pValuePattern = NULL;
	if(pButtonElement) pButtonElement->Release(); pButtonElement = NULL;
	if(pInvokePattern) pInvokePattern->Release(); pInvokePattern = NULL;
	SysFreeString(bstrFileName);

	// Return
	return hr;
}

// Trigger a menu bar button
HRESULT TriggerLegacyMenuBarButton (IUIAutomation *i_pAutomation, IUIAutomationElement * i_pAppElement, CString & i_strMenuBarName, CString & i_strButtonName)
{
	HRESULT hr;
	IUIAutomationElement * pMenuBarElement = NULL;
	IUIAutomationElement * pButtonElement = NULL;
	IUIAutomationLegacyIAccessiblePattern * pLegacyIAccessiblePattern = NULL;

	// Find bar item
	hr = FindElementByTypeByName(i_pAutomation, i_pAppElement, UIA_MenuBarControlTypeId, i_strMenuBarName, TreeScope_Descendants, &pMenuBarElement);
	if(FAILED(hr) || pMenuBarElement == NULL) {hr = S_FALSE; goto CleanUp;}

	// Find menu item
	hr = FindElementByTypeByName(i_pAutomation, pMenuBarElement, UIA_ButtonControlTypeId, i_strButtonName, TreeScope_Children, &pButtonElement);
	if(FAILED(hr) || pMenuBarElement == NULL) {hr = S_FALSE; goto CleanUp;}

	// Find legacy pattern	
	hr = pButtonElement->GetCurrentPattern(UIA_LegacyIAccessiblePatternId, reinterpret_cast<IUnknown**>(&pLegacyIAccessiblePattern));
	if(FAILED(hr) || pLegacyIAccessiblePattern == NULL) {hr = S_FALSE; goto CleanUp;}

	// Default action
	hr = pLegacyIAccessiblePattern->DoDefaultAction();
	if(FAILED(hr) || pLegacyIAccessiblePattern == NULL) {hr = S_FALSE; goto CleanUp;}

CleanUp:

	// Release
	if(pMenuBarElement) pMenuBarElement->Release(); pMenuBarElement = NULL;
	if(pButtonElement) pButtonElement->Release(); pButtonElement = NULL;
	if(pLegacyIAccessiblePattern) pLegacyIAccessiblePattern->Release(); pLegacyIAccessiblePattern = NULL;

	// Return
	return hr;
}

// Trigger to save a file
HRESULT TiggerNoSave(IUIAutomation *i_pAutomation, IUIAutomationElement * i_pDialogElement)
{
	HRESULT hr;
	IUIAutomationElement * pButtonElement = NULL;
	IUIAutomationInvokePattern * pInvokePattern = NULL;

	// Find edit box
	hr = FindElementByTypeByName(i_pAutomation, i_pDialogElement, UIA_ButtonControlTypeId, CString(_T("No")), TreeScope_Descendants, &pButtonElement);
	if (FAILED(hr) || pButtonElement == NULL) {hr = S_FALSE; goto CleanUp;}

	// Find invoke pattern
	hr = pButtonElement->GetCurrentPattern(UIA_InvokePatternId, reinterpret_cast<IUnknown**>(&pInvokePattern));
	if(FAILED(hr) || pInvokePattern == NULL) {hr = S_FALSE; goto CleanUp;}

	// Invoke
	hr = pInvokePattern->Invoke();
	if(FAILED(hr)) {hr = S_FALSE; goto CleanUp;}

CleanUp:

	// Release
	if(pButtonElement) pButtonElement->Release(); pButtonElement = NULL;
	if(pInvokePattern) pInvokePattern->Release(); pInvokePattern = NULL;

	// Return
	return hr;
}

// Main entry
int _tmain(int argc, _TCHAR* argv[])
{
	HRESULT hr;
	IUIAutomation * pAutomation = NULL;
	IUIAutomationElement * pRootElement = NULL;
	IUIAutomationElement * pAppElement = NULL;
	IUIAutomationElement * pDialogElement = NULL;
	CString strDirectory(_T(DIR));	
	CFileFind fileFinder;
	HWND hWnd = 0;

	// Open log file
	ofstream logFile(LOG, ios::out | ios::app);

	// Initialize COM
	hr = CoInitialize(NULL);
	if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}

	// Create automation instance
	hr = CoCreateInstance(CLSID_CUIAutomation, NULL,
		CLSCTX_INPROC_SERVER, IID_IUIAutomation, 
		reinterpret_cast<void**>(&pAutomation));
	if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}

	// Find root element	
	hr = pAutomation->GetRootElement(&pRootElement);
	if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}

	// Find application element
	hr = FindElementByTypeByName(pAutomation, pRootElement, UIA_WindowControlTypeId, CString(_T("FormingSuite")), TreeScope_Children, &pAppElement);
	if(hr == S_FALSE) {LogTime(logFile); logFile << "Can't find FormingSuite!" << endl; goto CleanUp;}

	// Set directory	
	SetCurrentDirectory(strDirectory);

	// Iterate to find file
	BOOL bWorking = fileFinder.FindFile(_T("*.igs"));
	while(bWorking) {
		bWorking = fileFinder.FindNextFile();

		// Get file name
		CString strFilePath = fileFinder.GetFilePath();

		// Get pic name
		int nIdx = strFilePath.ReverseFind(_T('.'));
		CString strPicPath = strFilePath.Left(nIdx + 1);
		strPicPath += _T("jpg");

		// Check file existance
		CFileFind fileCheck;
		BOOL bExistance = fileCheck.FindFile(strPicPath);
		if(bExistance) continue;

		// Action: create a new project
		hr = TiggerToolbarButton(pAutomation, pAppElement, CString(_T("Standard Toolbar")), UIA_ButtonControlTypeId, 0);
		if(hr == S_FALSE) {LogTime(logFile); logFile << "Can't trigger New from Standard Toolbar!" << endl; goto CleanUp;}

		// Action: enter product definition workbench
		hr = TiggerToolbarButton(pAutomation, pAppElement, CString(_T("Workbench Wizard")), UIA_CheckBoxControlTypeId, 0);
		if(hr == S_FALSE) {LogTime(logFile); logFile << "Can't trigger Product Definition from Workbench Wizard!" << endl; goto CleanUp;}

		// Action: import geometry
		hr = TiggerToolbarButton(pAutomation, pAppElement, CString(_T("Workbench Toolbar")), UIA_CheckBoxControlTypeId, 0);
		if(hr == S_FALSE) {LogTime(logFile); logFile << "Can't trigger Import Geometry from Workbench Toolbar!" << endl; goto CleanUp;}

		// Wait: open file dialog
		hr = WaitWindowByTypeByName(pAutomation, pAppElement, UIA_WindowControlTypeId, CString(_T("Open")), TreeScope_Descendants, &pDialogElement);
		if(hr == S_FALSE) {LogTime(logFile); logFile << "Can't wait for Open dialog box!" << endl; goto CleanUp;}

		// Action: open an *.igs file
		hr = TiggerOpenFile(pAutomation, pDialogElement, strFilePath);
		if(hr == S_FALSE) {LogTime(logFile); logFile << "Can't trigger Open *.igs file!" << endl; goto CleanUp;}

		// Wait: status bar	
		hr = WaitStatusBar(pAutomation, pAppElement);
		if(hr == S_FALSE) {LogTime(logFile); logFile << "Can't wait for the completion of Open *.igs file from Statusbar!" << endl; goto CleanUp;}

		// Action: select tree
		hr = TriggerTreeItem(pAutomation, pAppElement);
		if(hr == S_FALSE) {LogTime(logFile); logFile << "Can't trigger Tree Item!" << endl; goto CleanUp;}

		// Action: capture screen
		hr = TiggerToolbarButton(pAutomation, pAppElement, CString(_T("Standard Toolbar")), UIA_CheckBoxControlTypeId, 0);
		if(hr == S_FALSE) {LogTime(logFile); logFile << "Can't trigger Capture Screen from Workbench Toolbar!" << endl; goto CleanUp;}

		// Wait: save as dialog
		if(pDialogElement) pDialogElement->Release();	pDialogElement = NULL;
		hr = WaitWindowByTypeByName(pAutomation, pAppElement, UIA_WindowControlTypeId, CString(_T("Save As")), TreeScope_Descendants, &pDialogElement);
		if(hr == S_FALSE) {LogTime(logFile); logFile << "Can't wait for Save As dialog box!" << endl; goto CleanUp;}

		// Action: save the captured *.jpg file
		hr = TiggerSaveFile(pAutomation, pDialogElement, strPicPath);
		if(hr == S_FALSE) {LogTime(logFile); logFile << "Can't trigger Save *.jpg file!" << endl; goto CleanUp;}

		// Wait: status bar	
		hr = WaitStatusBar(pAutomation, pAppElement);
		if(hr == S_FALSE) {LogTime(logFile); logFile << "Can't wait for the completion of Save *.jpg file from Statusbar!" << endl; goto CleanUp;}

		// Action: select tree
		hr = TriggerTreeItem(pAutomation, pAppElement);
		if(hr == S_FALSE) {LogTime(logFile); logFile << "Can't trigger Tree Item!" << endl; goto CleanUp;}

		// Action: close window
		hr = TriggerLegacyMenuBarButton(pAutomation, pAppElement, CString(_T("Application")), CString("Close"));
		if(hr == S_FALSE) {LogTime(logFile); logFile << "Can't close window!" << endl; goto CleanUp;}

		// Wait: save changes dialog
		if(pDialogElement) pDialogElement->Release();	pDialogElement = NULL;
		hr = WaitWindowByTypeByName(pAutomation, pAppElement, UIA_WindowControlTypeId, CString(_T("FormingSuite")), TreeScope_Descendants, &pDialogElement);
		if(hr == S_FALSE) {LogTime(logFile); logFile << "Can't wait for FormingSuite dialog box!" << endl; goto CleanUp;}

		// Action: click No button
		hr = TiggerNoSave(pAutomation, pDialogElement);
		if(hr == S_FALSE) {LogTime(logFile); logFile << "Can't close FormingSuite dialog box!" << endl; goto CleanUp;}
	}

CleanUp:

	// Release COM
	if(pAutomation) pAutomation->Release(); pAutomation = NULL;
	if(pRootElement) pRootElement->Release(); pRootElement = NULL;
	if(pAppElement) pAppElement->Release(); pAppElement = NULL;
	if(pDialogElement) pDialogElement->Release(); pDialogElement = NULL;
	CoUninitialize();

	// Close log file
	logFile.close();

	// Return
	return hr;
}

