// visPlayerAddInServer.h : Declaration of the CvisPlayerAddInServer

#pragma once
#include "resource.h"       // main symbols
#include "visPlayerAddIn.h"
#include "ExportPartCommandButton.h"

// CvisPlayerAddInServer

class ATL_NO_VTABLE CvisPlayerAddInServer : 
	public CComObjectRootEx<CComSingleThreadModel>,
	public CComCoClass<CvisPlayerAddInServer, &CLSID_visPlayerAddInServer>,
	public IDispatchImpl<IvisPlayerAddInServer, &IID_IvisPlayerAddInServer, &LIBID_visPlayerAddInLib, 1, 0>,
	public IDispEventImpl<1, CvisPlayerAddInServer, &DIID_UserInterfaceEventsSink, &LIBID_Inventor, 1, 0>
{

private:
	CComPtr<Application> m_pApplication;
	CComPtr<ApplicationAddInSite> m_pAddInSite;

	// user interface event
	CComPtr<UserInterfaceEventsObject> m_pUserInterfaceEvtsObj;

	// commands
	// Export Part command
	CComObject<CExportPartCommandButton>* m_pExportPartCmdBtn;
	
	// visPlayer panel
	CComPtr<RibbonPanel> m_pPartSketchvisPlayerRibbonPanel;

public:
	CvisPlayerAddInServer()
	{
		m_pApplication = NULL;
		m_pAddInSite = NULL;
		m_pUserInterfaceEvtsObj = NULL;

		m_pExportPartCmdBtn = NULL;
		m_pPartSketchvisPlayerRibbonPanel = NULL;
	}

	DECLARE_REGISTRY_RESOURCEID(IDR_VISPLAYERADDINSERVER)

	BEGIN_COM_MAP(CvisPlayerAddInServer)
		COM_INTERFACE_ENTRY(IvisPlayerAddInServer)
		COM_INTERFACE_ENTRY(IDispatch)
	END_COM_MAP()

	BEGIN_SINK_MAP(CvisPlayerAddInServer)
		SINK_ENTRY_EX (1, DIID_UserInterfaceEventsSink, UserInterfaceEventsSink_OnResetCommandBarsMeth, OnResetCommandBars)
		SINK_ENTRY_EX (1, DIID_UserInterfaceEventsSink, UserInterfaceEventsSink_OnResetEnvironmentsMeth, OnResetEnvironments)
		SINK_ENTRY_EX (1, DIID_UserInterfaceEventsSink, UserInterfaceEventsSink_OnResetRibbonInterfaceMeth, OnResetRibbonInterface)
	END_SINK_MAP()


	DECLARE_PROTECT_FINAL_CONSTRUCT()

	HRESULT FinalConstruct()
	{
		return S_OK;
	}
	
	void FinalRelease() 
	{
	}

public:
	STDMETHOD(Activate)(IDispatch* pDisp, VARIANT_BOOL FirstTime);
	STDMETHOD(Deactivate)(void);
	STDMETHOD(ExecuteCommand)(long CommandId);
	STDMETHOD(get_Automation)(IDispatch** ppResult);

	//----- UserInterfaceEventsSink 
	STDMETHOD(OnResetCommandBars) (ObjectsEnumerator* pCommandBars, NameValueMap* pContext);
	STDMETHOD(OnResetEnvironments) (ObjectsEnumerator* pEnvironments, NameValueMap* pContext);
	STDMETHOD(OnResetRibbonInterface) (NameValueMap* pContext);
};

OBJECT_ENTRY_AUTO(__uuidof(visPlayerAddInServer), CvisPlayerAddInServer)
