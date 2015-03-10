// visPlayerAddInServer.cpp : Implementation of CvisPlayerAddInServer

#include "stdafx.h"
#include "visPlayerAddInServer.h"

#include <iostream>
#include <fstream>
using namespace std;

// CvisPlayerAddInServer

//-----------------------------------------------------------------------------
//----- Implementation of public methods
//-----------------------------------------------------------------------------
STDMETHODIMP CvisPlayerAddInServer::Activate(IDispatch* pDisp, VARIANT_BOOL FirstTime)
{
	HRESULT hr;

	// check interface pointer
	if (pDisp == NULL) return E_INVALIDARG;

	// get the AddIn site
	hr = pDisp->QueryInterface (__uuidof (m_pAddInSite), reinterpret_cast<void**>(&m_pAddInSite)) ;
	ATLASSERT(SUCCEEDED(hr));
	if (FAILED(hr))	return hr;
	
	// get the application
	hr = m_pAddInSite->get_Application (&m_pApplication);
	ATLASSERT(SUCCEEDED(hr));
	if (FAILED(hr))	return hr;

	// get the command manager
	CComPtr<CommandManager> pCommandManager;
	hr = m_pApplication->get_CommandManager(&pCommandManager);
	if (FAILED(hr)) return hr;

	// create the command button(s)
	// create instance of the "ExportPart" command button class 
	hr = CComObject<CExportPartCommandButton>::CreateInstance (&m_pExportPartCmdBtn);
	if (FAILED(hr))	return hr;
	m_pExportPartCmdBtn->AddRef();

	// create the "ExportPart" button
	CComPtr<ButtonDefinitionObject> pExportPartCmdBtnDef;
	hr = m_pExportPartCmdBtn->CreateButtonDefinition(m_pApplication, 
				CComBSTR(_T("Export Part")), 
				CComBSTR(_T("Autodesk:visPlayerAddIn:ExportPartCmd")), 
				kShapeEditCmdType, 
				CComVariant(_T("{4C9D1FBB-6E63-4437-9643-15C94A5DB053}")), 
				CComBSTR(_T("Export part for the use in visPlayer")), 
				CComBSTR(_T("Export Part")), 
				IDI_ICON_EXPORTPART, 
				IDI_ICON_EXPORTPART, 
				kDisplayTextInLearningMode,
				&pExportPartCmdBtnDef);
	if (FAILED(hr))	return hr;
	
  // create command category
	// get the command categories collection
	CComPtr<CommandCategories> pCommandCategories;
	hr = pCommandManager->get_CommandCategories(&pCommandCategories);

	// create the command categories for this AddIn
	CComPtr<CommandCategory> pvisPlayerCmdCat;
	hr = pCommandCategories->Add(CComBSTR(_T("visPlayer")), 
				CComBSTR(_T("Autodesk:visPlayerAddIn:visPlayerCmdCat")), 
				CComVariant(_T("{4C9D1FBB-6E63-4437-9643-15C94A5DB053}")), 
				&pvisPlayerCmdCat);

	if (SUCCEEDED(hr)) {
		// add the commands to the command category
		// add the "Export Part" command to the command category
		hr = pvisPlayerCmdCat->Add(pExportPartCmdBtnDef);
	}

	if (FirstTime == VARIANT_TRUE) {
		// get the user interface manager
		CComPtr<UserInterfaceManager> pUserInterfaceMgr;
		hr = m_pApplication->get_UserInterfaceManager(&pUserInterfaceMgr);
		if (FAILED(hr))	return hr;

		// get the user interface style
		InterfaceStyleEnum interfaceStyle;
		pUserInterfaceMgr->get_InterfaceStyle(&interfaceStyle);

		// create gui for the classic interface
		if(interfaceStyle == kClassicInterface)
		{
			// get the command bars collection
			CComPtr<CommandBars> pCommandBars;
			hr = pUserInterfaceMgr->get_CommandBars(&pCommandBars);
			if (FAILED(hr))	return hr;

			// create the "visPlayer" toolbar
			CComPtr<CommandBar> pvisPlayerCmdBar;
			hr = pCommandBars->Add(CComBSTR(_T("visPlayer")), 
						CComBSTR(_T("Autodesk:visPlayerAddIn:visPlayerToolbar")),
						kRegularCommandBar,
						CComVariant(_T("{4C9D1FBB-6E63-4437-9643-15C94A5DB053}")),
						&pvisPlayerCmdBar);

			if (SUCCEEDED(hr)) {		
				// get the controls of the toolbar
				CComPtr<CommandBarControls> pvisPlayerToolBarCtrls;
				hr = pvisPlayerCmdBar->get_Controls(&pvisPlayerToolBarCtrls);
				
				if (SUCCEEDED(hr)) {
					//add the buttons to the toolbar
					CComPtr<CommandBarControl> pExportPartCmdBtnCmdBarCtrl;
					hr = pvisPlayerToolBarCtrls->AddButton(pExportPartCmdBtnDef, 0, &pExportPartCmdBtnCmdBarCtrl);
				}
			}

			// get the envirionments collection
			CComPtr<Environments> pEnvs;
			hr = pUserInterfaceMgr->get_Environments(&pEnvs);
			if(FAILED(hr)) return hr;

			// get the part environment from the environments collection
			CComPtr<Environment> pPartEnv;
			hr = pEnvs->get_Item(CComVariant(_T(PartEnvironment_InternalName)), &pPartEnv);
			
			if (SUCCEEDED(hr)) {
				// get the part environment panel bar
				CComPtr<PanelBarObject> pPartEnvPanelBar;
				hr = pPartEnv->get_PanelBar(&pPartEnvPanelBar);
				
				if (SUCCEEDED(hr)) {
					// get the part environment panel bar command bar list
					CComPtr<CommandBarList> pPartEnvPanelBarCmdBarList;
					hr = pPartEnvPanelBar->get_CommandBarList(&pPartEnvPanelBarCmdBarList);

					// add the visPlayer command bar
					if (SUCCEEDED(hr))
						hr = pPartEnvPanelBarCmdBarList->Add(pvisPlayerCmdBar);
				}
			}
		}
		// create the gui for the ribbon interface
		else
		{
			// get the ribbon associated with part documents
			CComPtr<Ribbons> pRibbons;
			hr = pUserInterfaceMgr->get_Ribbons(&pRibbons);
			if(FAILED(hr)) return hr;

			// get the part ribbon
			CComPtr<Ribbon> pPartRibbon;
			hr = pRibbons->get_Item(CComVariant(_T("Part")), &pPartRibbon);
			if(FAILED(hr)) return hr;

			// get the tabs associated with part ribbon
			CComPtr<RibbonTabs> pRibbonTabs;
			hr = pPartRibbon->get_RibbonTabs(&pRibbonTabs);
			if (FAILED(hr)) return hr;

//#ifdef _DEBUG // print the tabs' internal name
//			{
//				ofstream logFile("C:\\dev\\tmp\\CvisPlayerAddInServer_Activate.log", ios::out);
//				if (logFile.is_open()) {
//					long nNumRibbons = 0;
//					hr = pRibbonTabs->get_Count(&nNumRibbons);
//					for (int i = 0; i < nNumRibbons; i++)
//					{
//						CComPtr<RibbonTab> pRibbonTab;
//						hr = pRibbonTabs->get_Item(CComVariant(i), &pRibbonTab);
//						if (!pRibbonTab) continue;
//						CComBSTR bstrRibbonTabInternalName;
//						hr = pRibbonTab->get_InternalName(&bstrRibbonTabInternalName);
//						CW2A printstr(bstrRibbonTabInternalName);
//						logFile << printstr << endl;
//					}
//				}
//				logFile.close();
//			}
//#endif

			// get the part model ribbon tab
			CComPtr<RibbonTab> pPartModelRibbonTab;
			hr = pRibbonTabs->get_Item(CComVariant(_T("id_TabModel")), &pPartModelRibbonTab);
			if(FAILED(hr)) return hr;

			// create a new panel within the tab
			CComPtr<RibbonPanels> pRibbonPanels;
			hr = pPartModelRibbonTab->get_RibbonPanels(&pRibbonPanels);
			if(FAILED(hr)) return hr;
			hr = pRibbonPanels->Add(CComBSTR(_T("visPlayer")), 
						CComBSTR(_T("Autodesk:visPlayerAddIn:visPlayerRibbonPanel")), 
						CComBSTR(_T("{4C9D1FBB-6E63-4437-9643-15C94A5DB053}")), 
						CComBSTR(_T("")),
						VARIANT_FALSE,
						&m_pPartSketchvisPlayerRibbonPanel);
			if(FAILED(hr)) return hr;

			// add controls to the visPlayer panel
			CComPtr<CommandControls> pPartSketchvisPlayerRibbonPanelCtrls;
			hr = m_pPartSketchvisPlayerRibbonPanel->get_CommandControls(&pPartSketchvisPlayerRibbonPanelCtrls);

			if (SUCCEEDED(hr)) {
				//add the buttons to the ribbon panel
				CComPtr<CommandControl> pExportPartCmdBtnCmdCtrl;
				hr = pPartSketchvisPlayerRibbonPanelCtrls->AddButton(pExportPartCmdBtnDef, 
							VARIANT_FALSE, 
							VARIANT_TRUE, 
							CComBSTR(_T("")), 
							VARIANT_FALSE, 
							&pExportPartCmdBtnCmdCtrl);
			}		
		}
	}

	// get the user interface manager
	CComPtr<UserInterfaceManager> pUsrInterfaceMgr;
	hr = m_pApplication->get_UserInterfaceManager(&pUsrInterfaceMgr);
	if(FAILED(hr)) return hr;

	// get the user interface events
	hr = pUsrInterfaceMgr->get_UserInterfaceEvents(&m_pUserInterfaceEvtsObj);
	if(FAILED(hr)) return hr;

	// dispatch user interface event
	hr = DispEventAdvise(m_pUserInterfaceEvtsObj);
	if(FAILED(hr)) return hr;

	return S_OK;
}

STDMETHODIMP CvisPlayerAddInServer::Deactivate(void)
{
	HRESULT hr;

	// disconnect button sinks
	hr = m_pExportPartCmdBtn->Disconnect();
	m_pExportPartCmdBtn->Release();
	m_pExportPartCmdBtn = NULL;

	// disconnect part sketch visPlayer ribbon panel
	if  (m_pPartSketchvisPlayerRibbonPanel != NULL )
	{
		m_pPartSketchvisPlayerRibbonPanel.Release();
		m_pPartSketchvisPlayerRibbonPanel = NULL;
	}
	
	// unadvice user interface event
	hr = DispEventUnadvise(m_pUserInterfaceEvtsObj);
	
	// release AddIn site
	m_pAddInSite.Release();

	// relrease application
	m_pApplication.Release();

	return S_OK;
}

STDMETHODIMP CvisPlayerAddInServer::ExecuteCommand(long CommandId)
{
	return E_NOTIMPL;
}

STDMETHODIMP CvisPlayerAddInServer::get_Automation(IDispatch** ppResult)
{
	if (ppResult == NULL) 
		return E_INVALIDARG;

	*ppResult = NULL;

	return E_NOTIMPL;
}

//-----------------------------------------------------------------------------
//----- Implementation of UserInterface Events sink methods
//-----------------------------------------------------------------------------
STDMETHODIMP CvisPlayerAddInServer::OnResetCommandBars(ObjectsEnumerator* pCommandBars, NameValueMap* pContext)
{
	HRESULT hr = S_OK;

	// get the number of command bars
	long lNoCmdBars;
	hr = pCommandBars->get_Count(&lNoCmdBars);
	if (FAILED(hr)) return hr;
	
	// iterate each command bar
	for (long lCmdBarCt = 1; lCmdBarCt <= lNoCmdBars; lCmdBarCt++)
	{
		// get the command bar
		CComPtr<IDispatch> pCmdBarDisp;
		hr = pCommandBars->get_Item(lCmdBarCt, &pCmdBarDisp);
		if (FAILED(hr)) continue;
		
		CComQIPtr<CommandBar> pCmdBar(pCmdBarDisp);
		if (!pCmdBar) continue;

		// get the command bar internal name
		CComBSTR bstrCmdBarInternalName;
		hr = pCmdBar->get_InternalName(&bstrCmdBarInternalName);
		if (FAILED(hr)) continue;
		
		// add the command buttons back to the visPlayer toolbar
		if (bstrCmdBarInternalName == _T("Autodesk:visPlayerAddIn:visPlayerToolbar"))
		{
			// get the controls of the command bar
			CComPtr<CommandBarControls> pCmdBarCtrls;
			hr = pCmdBar->get_Controls(&pCmdBarCtrls);
			if (FAILED(hr))	return hr;

			// add the buttons to the toolbar
			CComPtr<ButtonDefinitionObject> pExportPartCmdBtnDef;
			hr = m_pExportPartCmdBtn->GetButtonDefinition(&pExportPartCmdBtnDef);

			if(SUCCEEDED(hr)) {
				CComPtr<CommandBarControl> pExportPartCmdBtnCmdBarCtrl;
				hr = pCmdBarCtrls->AddButton(pExportPartCmdBtnDef, 0, &pExportPartCmdBtnCmdBarCtrl);
			}

			return S_OK;
		}
		
	}	
	return hr;
}

STDMETHODIMP CvisPlayerAddInServer::OnResetEnvironments(ObjectsEnumerator* pEnvironments, NameValueMap* pContext)
{
	HRESULT hr = S_OK;

	// get the user interface manager
	CComPtr<UserInterfaceManager> pUserInterfaceMgr;
	hr = m_pApplication->get_UserInterfaceManager(&pUserInterfaceMgr);
	if(FAILED(hr)) return hr;

	// get the command bars
	CComPtr<CommandBars> pCmdBars;
	hr = pUserInterfaceMgr->get_CommandBars(&pCmdBars);
	if(FAILED(hr)) return hr;

	// get the visPlayer command bar
	CComPtr<CommandBar> pvisPlayerCmdBar;
	hr = pCmdBars->get_Item(CComVariant(_T("Autodesk:visPlayerAddIn:visPlayerToolbar")), &pvisPlayerCmdBar);
	if(FAILED(hr)) return hr;

	// get the number of environments
	long lNoEnvs;
	hr = pEnvironments->get_Count(&lNoEnvs);
	
	// cycle each environment
	for (long lEnvCt = 1; lEnvCt <= lNoEnvs; lEnvCt++)
	{
		// get the environment
		CComPtr<IDispatch> pEnvDisp;
		hr = pEnvironments->get_Item(lEnvCt, &pEnvDisp);
		if (FAILED(hr)) continue;
		
		CComQIPtr<Environment> pEnv(pEnvDisp);
		if (!pEnv) continue;

		// get the environment internal name
		CComBSTR bstrEnvInternalName;
		hr = pEnv->get_InternalName(&bstrEnvInternalName);
		if (FAILED(hr)) continue;
		
		// add the command bar back to the part environment panel bar
		if (bstrEnvInternalName == _T(PartSketchEnvironment_InternalName))
		{
			// get the part environment panel bar
			CComPtr<PanelBarObject> pPartEnvPanelBar;
			hr = pEnv->get_PanelBar(&pPartEnvPanelBar);
			
			if (SUCCEEDED(hr)) {
				// get the part environment panel bar command bar list
				CComPtr<CommandBarList> pPartEnvPanelBarCmdBarList;
				hr = pPartEnvPanelBar->get_CommandBarList(&pPartEnvPanelBarCmdBarList);
				
				// add the visPlayer command bar
				if (SUCCEEDED(hr))
					hr = pPartEnvPanelBarCmdBarList->Add(pvisPlayerCmdBar);
			}

			return S_OK;		
		}
	}

	return hr;
}

STDMETHODIMP CvisPlayerAddInServer::OnResetRibbonInterface(NameValueMap* pContext)
{
	HRESULT hr = S_OK;

	// get the user interface manager
	CComPtr<UserInterfaceManager> pUserInterfaceMgr;
	hr = m_pApplication->get_UserInterfaceManager(&pUserInterfaceMgr);
	if(FAILED(hr)) return hr;

	// get the ribbons
	CComPtr<Ribbons> pRibbons;
	hr = pUserInterfaceMgr->get_Ribbons(&pRibbons);
	if(FAILED(hr)) return hr;

	// get the part ribbon
	CComPtr<Ribbon> pPartRibbon;
	hr = pRibbons->get_Item(CComVariant(_T("Part")), &pPartRibbon);
	if(FAILED(hr)) return hr;

	// get the tabs associated with part ribbon
	CComPtr<RibbonTabs> pRibbonTabs;
	hr = pPartRibbon->get_RibbonTabs(&pRibbonTabs);
	if(FAILED(hr)) return hr;

	// get the part model ribbon tab
	CComPtr<RibbonTab> pPartModelRibbonTab;
	hr = pRibbonTabs->get_Item(CComVariant(_T("id_TabModel")), &pPartModelRibbonTab);
	if(FAILED(hr)) return hr;

	// create a new panel within the tab
	CComPtr<RibbonPanels> pRibbonPanels;
	hr = pPartModelRibbonTab->get_RibbonPanels(&pRibbonPanels);
	if(FAILED(hr)) return hr;
	hr = pRibbonPanels->Add(CComBSTR(_T("visPlayer")), 
								CComBSTR(_T("Autodesk:visPlayerAddIn:visPlayerRibbonPanel")), 
								CComBSTR(_T("{4C9D1FBB-6E63-4437-9643-15C94A5DB053}")), 
								CComBSTR(_T("")),
								VARIANT_FALSE,
								&m_pPartSketchvisPlayerRibbonPanel);
	if(FAILED(hr)) return hr;

	// add controls to the visPlayer panel
	CComPtr<CommandControls> pPartSketchvisPlayerRibbonPanelCtrls;
	hr = m_pPartSketchvisPlayerRibbonPanel->get_CommandControls(&pPartSketchvisPlayerRibbonPanelCtrls);

	if (SUCCEEDED(hr)) {
		// add the buttons to the ribbon panel
		CComPtr<ButtonDefinitionObject> pExportPartCmdBtnDef;
		hr = m_pExportPartCmdBtn->GetButtonDefinition(&pExportPartCmdBtnDef);

		CComPtr<CommandControl> pExportPartCmdBtnCmdCtrl;
		hr = pPartSketchvisPlayerRibbonPanelCtrls->AddButton(pExportPartCmdBtnDef, 
															VARIANT_FALSE, 
															VARIANT_TRUE, 
															CComBSTR(_T("")), 
															VARIANT_FALSE, 
															&pExportPartCmdBtnCmdCtrl);
	}

	return hr;
}
