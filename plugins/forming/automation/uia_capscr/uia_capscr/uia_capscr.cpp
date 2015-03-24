// UITest.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"


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
	if(FAILED(hr) || (*i_ppElement) == NULL)
		return S_FALSE;
	else
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
	if(FAILED(hr) || (*i_ppElement) == NULL)
		return S_FALSE;
	else
		return hr;
}

// Wait window by type and name
HRESULT PeekWindowByTypeByName (
	IUIAutomation *i_pAutomation, IUIAutomationElement * i_pRootElement, 
	long i_lElementTypeId, CString & i_strElementName, TreeScope i_eTreeScope, 
	IUIAutomationElement ** i_ppElement)
{
	HRESULT hr;
	IUIAutomationWindowPattern  * pWindowPattern = NULL;
	int nCount = 1, nSleep = 100, nMaxCount = 10;

	// Wait element
	while(nCount < nMaxCount) {
		// Try to find element
		hr = FindElementByTypeByName(i_pAutomation, i_pRootElement, i_lElementTypeId, i_strElementName, i_eTreeScope, i_ppElement);
		if(FAILED(hr) || (*i_ppElement) == NULL) {Sleep(nSleep); nCount++; continue;}

		// Break
		break;
	}

	// Return
	if(FAILED(hr) || (*i_ppElement) == NULL)
		return S_FALSE;
	else
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

//#ifdef _DEBUG // inspect all button elements
//	{
//		int nNumElements = 0;
//		pButtonElements->get_Length(&nNumElements);
//		for(int i = 0; i < nNumElements; i++) {
//			IUIAutomationElement * pElement = NULL;
//			pButtonElements->GetElement(i, &pElement);
//			BSTR bstrRetVal;
//			pElement->get_CurrentName(&bstrRetVal);
//			pElement->Release(); pElement = NULL;
//		}
//	}
//#endif

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

	return hr;
}

// Trigger a menu item
HRESULT TriggerMenuItem (IUIAutomation *i_pAutomation, IUIAutomationElement * i_pAppElement, CString & i_strItemName)
{
	HRESULT hr;
	IUIAutomationElement * pItemElement = NULL;
	IUIAutomationInvokePattern * pInvokePattern = NULL;

	// Find item
	hr = FindElementByTypeByName(i_pAutomation, i_pAppElement, UIA_MenuItemControlTypeId, i_strItemName, TreeScope_Descendants, &pItemElement);
	if(FAILED(hr) || pItemElement == NULL) {hr = S_FALSE; goto CleanUp;}

	// Find invoke pattern	
	hr = pItemElement->GetCurrentPattern(UIA_InvokePatternId, reinterpret_cast<IUnknown**>(&pInvokePattern));
	if(FAILED(hr) || pInvokePattern == NULL) {hr = S_FALSE; goto CleanUp;}
	
	// Invoke
	hr = pInvokePattern->Invoke();
	if(FAILED(hr)) {hr = S_FALSE; goto CleanUp;}

CleanUp:

	// Release
	if(pItemElement) pItemElement->Release(); pItemElement = NULL;
	if(pInvokePattern) pInvokePattern->Release(); pInvokePattern = NULL;

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
	IUIAutomationElement * pStatusElement = NULL;
	CString strDirectory(_T("C:\\Temp\\test"));	
	CFileFind fileFinder;
	HWND hWnd = 0;

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
	if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}

	// Set directory	
	SetCurrentDirectory(strDirectory);

	// Iterate to find file
	BOOL bWorking = fileFinder.FindFile(_T("*.igs"));
	while(bWorking) {
		bWorking = fileFinder.FindNextFile();

		// Get file name
		CString strFileName = fileFinder.GetFileName();

		// Get pic name
		int nIdx = strFileName.ReverseFind(_T('.'));
		CString strPicName = strFileName.Left(nIdx + 1);
		strPicName += _T("jpg");

		// Check file existance
		CFileFind fileCheck;
		BOOL bExistance = fileCheck.FindFile(strPicName);
		if(bExistance) continue;

		// Action: create a new project
		hr = TiggerToolbarButton(pAutomation, pAppElement, CString(_T("Standard Toolbar")), UIA_ButtonControlTypeId, 0);
		if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}

		// Action: enter product definition workbench
		hr = TiggerToolbarButton(pAutomation, pAppElement, CString(_T("Workbench Wizard")), UIA_CheckBoxControlTypeId, 0);
		if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}

		// Action: import geometry
		hr = TiggerToolbarButton(pAutomation, pAppElement, CString(_T("Workbench Toolbar")), UIA_CheckBoxControlTypeId, 0);
		if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}

		// Wait: open file dialog
		hr = WaitWindowByTypeByName(pAutomation, pAppElement, UIA_WindowControlTypeId, CString(_T("Open")), TreeScope_Descendants, &pDialogElement);
		if (FAILED(hr)) {hr = S_FALSE; goto CleanUp;}

		// Action: open an *.igs file
		hr = TiggerOpenFile(pAutomation, pDialogElement, strFileName);
		if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}

		// Wait: status bar	
		hr = WaitWindowByTypeByName(pAutomation, pAppElement, UIA_StatusBarControlTypeId, CString(_T("")), TreeScope_Descendants, &pStatusElement);
		if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}

		// Action: select tree
		hr = TriggerTreeItem(pAutomation, pAppElement);
		if (FAILED(hr)) {hr = S_FALSE; goto CleanUp;}

		// Action: capture screen
		hr = TiggerToolbarButton(pAutomation, pAppElement, CString(_T("Standard Toolbar")), UIA_CheckBoxControlTypeId, 0);
		if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}

		// Wait: save as dialog
		if(pDialogElement) pDialogElement->Release();	pDialogElement = NULL;
		hr = WaitWindowByTypeByName(pAutomation, pAppElement, UIA_WindowControlTypeId, CString(_T("Save As")), TreeScope_Descendants, &pDialogElement);
		if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}

		// Action: save the captured *.jpg file
		hr = TiggerSaveFile(pAutomation, pDialogElement, strDirectory + _T("\\") + strPicName);
		if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}

		// Wait: status bar	
		hr = WaitWindowByTypeByName(pAutomation, pAppElement, UIA_StatusBarControlTypeId, CString(_T("")), TreeScope_Descendants, &pStatusElement);
		if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}

		// Action: close file
		hr = TriggerMenuItem(pAutomation, pAppElement, CString(_T("Project")));
		if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}

		// Action: close file
		hr = TriggerMenuItem(pAutomation, pAppElement, CString(_T("Close")));
		if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}
	}

CleanUp:

	// Release COM
	if(pAutomation) pAutomation->Release(); pAutomation = NULL;
	if(pRootElement) pRootElement->Release(); pRootElement = NULL;
	if(pAppElement) pAppElement->Release(); pAppElement = NULL;
	if(pDialogElement) pDialogElement->Release(); pDialogElement = NULL;
	if(pStatusElement) pStatusElement->Release(); pStatusElement = NULL;
	CoUninitialize();

	return hr;
}

