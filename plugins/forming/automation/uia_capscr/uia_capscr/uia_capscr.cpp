// UITest.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include <uiautomation.h>

//#ifdef _DEBUG // inspect all button elements
//	{
//		IUIAutomationElementArray * pElementArray = NULL;
//		hr = pAppElement->FindAll(TreeScope_Descendants, pTypeCondition, &pElementArray);
//		int nNumElements = 0;
//		pElementArray->get_Length(&nNumElements);
//		for(int i = 0; i < nNumElements; i++) {
//			IUIAutomationElement * pElement = NULL;
//			pElementArray->GetElement(i, &pElement);
//			BSTR bstrRetVal;
//			pElement->get_CurrentName(&bstrRetVal);
//			pElement->Release();
//		}
//		pElementArray->Release();
//	}
//#endif

// Initialize automation object
HRESULT InitializeUIAutomation(IUIAutomation **ppAutomation)
{
  HRESULT hr;

	// Create automation instance
	hr = CoCreateInstance(CLSID_CUIAutomation, NULL,
      CLSCTX_INPROC_SERVER, IID_IUIAutomation, 
      reinterpret_cast<void**>(ppAutomation));
	if(FAILED(hr) || (*ppAutomation) == NULL) {
		if(*ppAutomation) (*ppAutomation)->Release();
		return S_FALSE;
	}

	return hr;
}

// Find root element
HRESULT FindRootElement (IUIAutomation *pAutomation, IUIAutomationElement ** ppRootElement)
{
	HRESULT hr;

	// Get root element
	hr = pAutomation->GetRootElement(ppRootElement);
	if (FAILED(hr) || (*ppRootElement) == NULL) {
		if(*ppRootElement) (*ppRootElement)->Release();
		return S_FALSE;
	}

	return hr;
}

// Find application element
HRESULT FindAppElement (IUIAutomation *pAutomation, IUIAutomationElement * pRootElement, IUIAutomationElement ** ppAppElement) 
{
	HRESULT hr;
	IUIAutomationCondition * pCondition = NULL;

	// Define condition value
	VARIANT varProp;
  varProp.vt = VT_BSTR;
  varProp.bstrVal = SysAllocString(_T("FormingSuite"));

	// Create property condition
  hr = pAutomation->CreatePropertyCondition(UIA_NamePropertyId, varProp, &pCondition);
	if (FAILED(hr) || pCondition == NULL) {hr = S_FALSE; goto CleanUp;}

	// Seach app element
	hr = pRootElement->FindFirst(TreeScope_Children, pCondition, ppAppElement);
	if(FAILED(hr) || (*ppAppElement) == NULL) {hr = S_FALSE; goto CleanUp;}

CleanUp:

	// Release
	SysFreeString(varProp.bstrVal);
	if(pCondition) pCondition->Release();
	if(FAILED(hr) && (*ppAppElement))
		(*ppAppElement)->Release();

	return hr;
}

// Invoke Product Definition command
HRESULT InvokeToolbarButton (IUIAutomation *i_pAutomation, IUIAutomationElement * i_pAppElement, TCHAR * i_pchToolbarName, long lControlTypeId, int i_nIndex)
{
	HRESULT hr;
	IUIAutomationCondition * pToolbarTypeCondition = NULL;
	IUIAutomationCondition * pToolbarNameCondition = NULL;
	IUIAutomationCondition * pToolbarAndCondition = NULL;
	IUIAutomationElement * pToolbarElement = NULL;
	IUIAutomationCondition * pButtonTypeCondition = NULL;
	IUIAutomationElementArray * pButtonElements = NULL;
	IUIAutomationElement * pButtonElement = NULL;
	IUIAutomationInvokePattern * pInvokePattern = NULL;

	// Create toolbar type condition
	VARIANT varToolbarTypeProp;
  varToolbarTypeProp.vt = VT_I4;
	varToolbarTypeProp.llVal = UIA_ToolBarControlTypeId;
  hr = i_pAutomation->CreatePropertyCondition(UIA_ControlTypePropertyId, varToolbarTypeProp, &pToolbarTypeCondition);
  if (FAILED(hr) || pToolbarTypeCondition == NULL) {hr = S_FALSE; goto CleanUp;}

	// Create toolbar name condition
	VARIANT varNameProp;
	varNameProp.vt = VT_BSTR;
	varNameProp.bstrVal = SysAllocString(i_pchToolbarName);
	hr = i_pAutomation->CreatePropertyCondition(UIA_NamePropertyId, varNameProp, &pToolbarNameCondition);
	if (FAILED(hr) || pToolbarNameCondition == NULL) {hr = S_FALSE; goto CleanUp;}

	// Create AND condition	
	hr = i_pAutomation->CreateAndCondition(pToolbarTypeCondition, pToolbarNameCondition, &pToolbarAndCondition);
	if(FAILED(hr) || pToolbarAndCondition == NULL) {hr = S_FALSE; goto CleanUp;}

	// Find button
	hr = i_pAppElement->FindFirst(TreeScope_Descendants, pToolbarAndCondition, &pToolbarElement);
	if(FAILED(hr) || pToolbarElement == NULL) {hr = S_FALSE; goto CleanUp;}

	// Create button type condition
	VARIANT varButtonTypeProp;
  varButtonTypeProp.vt = VT_I4;
	varButtonTypeProp.llVal = lControlTypeId;
  hr = i_pAutomation->CreatePropertyCondition(UIA_ControlTypePropertyId, varButtonTypeProp, &pButtonTypeCondition);
  if (FAILED(hr) || pButtonTypeCondition == NULL) {hr = S_FALSE; goto CleanUp;}

	// Find firt item	
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
	if(pToolbarTypeCondition) pToolbarTypeCondition->Release();
	if(pToolbarNameCondition) pToolbarNameCondition->Release();
	if(pToolbarAndCondition) pToolbarAndCondition->Release();
	if(pToolbarElement) pToolbarElement->Release();
	if(pButtonElements) pButtonElements->Release();
	if(pButtonElement) pButtonElement->Release();
	if(pInvokePattern) pInvokePattern->Release();
	SysFreeString(varNameProp.bstrVal);

	return hr;
}

int _tmain(int argc, _TCHAR* argv[])
{
	HRESULT hr;
	IUIAutomation * pAutomation;
	IUIAutomationElement * pRootElement = NULL;
	IUIAutomationElement* pAppElement = NULL;
	IUIAutomationElement* pNewElement = NULL;

	// Initialize COM
	hr = CoInitialize(NULL);
	if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}

	// Get automation object	
	hr = InitializeUIAutomation(&pAutomation);
	if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}

	// Find root element	
	hr = FindRootElement(pAutomation, &pRootElement);
	if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}

	// Find app element	
	hr = FindAppElement(pAutomation, pRootElement, &pAppElement);
	if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}

	// Invoke "New" command
	hr = InvokeToolbarButton(pAutomation, pAppElement, _T("Standard Toolbar"), UIA_ButtonControlTypeId, 0);
	if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}

	// Invoke "Product Definition" command
	hr = InvokeToolbarButton(pAutomation, pAppElement, _T("Workbench Wizard"), UIA_CheckBoxControlTypeId, 0);
	if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}

	// Invoke "Import Geometry" command
	hr = InvokeToolbarButton(pAutomation, pAppElement, _T("Workbench Toolbar"), UIA_CheckBoxControlTypeId, 0);
	if(FAILED(hr)) {hr = S_FALSE;	goto CleanUp;}
	
CleanUp:

	// Release COM
	if(pAutomation) pAutomation->Release();
	if(pRootElement) pRootElement->Release();
	if(pAppElement) pAppElement->Release();
	if(pNewElement) pNewElement->Release();
	CoUninitialize();

	return hr;
}

