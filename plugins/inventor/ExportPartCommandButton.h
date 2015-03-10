#pragma once
#include "commandbutton.h"

#include <iostream>
#include <fstream>
#include <vector>

using namespace std;

class CExportPartCommandButton :
	public CCommandButton
{
public:
	//----- ButtonDefinitionSink
	STDMETHOD(ButtonDefinitionEvents_OnExecute) (NameValueMap *pContext);

private:
	//----- local debug functions
	void _TRACE_FLUSH();
	void _TRACE_PRINT(CString & str);
	void _TRACE_PRINT(CComBSTR & bstr);
	void _TRACE_PRINT(char * sz);
	void _TRACE_PRINT(double d);
	void _TRACE_PRINT(long l);
	void _TRACE_PRINT(char * sz, long l);
	void _TRACE_PRINT(char * sz, double d);

private:
	//----- local writting functions
	// write indentation
	void writeIndent(ofstream & file, long n);
	void writeIndent(ofstream & file);
	void writeIndentBegin(ofstream & file);
	void writeIndentEnd(ofstream & file);

	// write container
	void writeObjectBegin(ofstream & file, bool bFirst = false);
	void writeObjectEnd(ofstream & file);
	void writeObjectValueBegin(ofstream & file, const char * sz, bool bFirst = false);
	void writeObjectValueEnd(ofstream & file);
	void writeArrayBegin(ofstream & file, bool bFirst = false);
	void writeArrayEnd(ofstream & file);
	void writeArrayValueBegin(ofstream & file, const char * sz, bool bFirst = false);
	void writeArrayValueEnd(ofstream & file);
	
	// write value
	void writeBoolValue(ofstream & file, const char * saName, VARIANT_BOOL bValue, bool bFirst = false);
	void writeLongValue(ofstream & file, const char * saName, long lValue, bool bFirst = false);
	void writeDoubleValue(ofstream & file, const char * saName, double dValue, bool bFirst = false);
	void writeStringValue(ofstream & file, const char * saName, const char * szValue, bool bFirst = false);

	// write value array
	void writeBoolArrayValue(ofstream & file, long nN, CComSafeArray<VARIANT_BOOL> * pVs);
	void writeLongArrayValue(ofstream & file, long nN, CComSafeArray<long> * pVs);
	void writeDoubleArrayValue(ofstream & file, long nN, CComSafeArray<double> * pVs);

	// checker	
	bool findInVector(vector<long> & vector, long n);

private:
	//----- standard methods
	STDMETHOD(InitializeData) ();
	STDMETHOD(SaveCompData) (CComPtr<PartComponentDefinition> pCompDef);
	STDMETHOD(SaveBodyData) (CComPtr<SurfaceBody> pBody);
	STDMETHOD(SaveShellData) (CComPtr<FaceShell> pShell);
	STDMETHOD(SaveFaceData) (CComPtr<Face> pFace);
	STDMETHOD(SaveUnknownSurfaceData) (CComPtr<IDispatch> pSurface);
	STDMETHOD(SavePlaneSurfaceData) (CComPtr<IDispatch> pSurface);
	STDMETHOD(SaveCylinderSurfaceData) (CComPtr<IDispatch> pSurface);
	STDMETHOD(SaveEllipticalCylinderSurfaceData) (CComPtr<IDispatch> pSurface);
	STDMETHOD(SaveConeSurfaceData) (CComPtr<IDispatch> pSurface);	
	STDMETHOD(SaveEllipticalConeSurfaceData) (CComPtr<IDispatch> pSurface);
	STDMETHOD(SaveTorusSurfaceData) (CComPtr<IDispatch> pSurface);
	STDMETHOD(SaveSphereSurfaceData) (CComPtr<IDispatch> pSurface);
	STDMETHOD(SaveBSplineSurfaceData) (CComPtr<IDispatch> pSurface);
	STDMETHOD(SaveFaceTessellationData) (CComPtr<Face> pFace);
	STDMETHOD(SaveLoopData) (CComPtr<EdgeLoop> pLoop);
	STDMETHOD(SaveEdgeData) (CComPtr<Edge> pEdge);
	STDMETHOD(SaveUnknownCurveData) (CComPtr<IDispatch> pCurve);
	STDMETHOD(SaveLineCurveData) (CComPtr<IDispatch> pCurve);
	STDMETHOD(SaveLineSegmentCurveData) (CComPtr<IDispatch> pCurve);
	STDMETHOD(SaveCircleCurveData) (CComPtr<IDispatch> pCurve);
	STDMETHOD(SaveCircularArcCurveData) (CComPtr<IDispatch> pCurve);
	STDMETHOD(SaveEllipseFullCurveData) (CComPtr<IDispatch> pCurve);
	STDMETHOD(SaveEllipticalArcCurveData) (CComPtr<IDispatch> pCurve);
	STDMETHOD(SaveBSplineCurveData) (CComPtr<IDispatch> pCurve);
	STDMETHOD(SavePolylineCurveData) (CComPtr<IDispatch> pCurve);
	STDMETHOD(SaveEdgeTessellationData) (CComPtr<Edge> pEdge);
	STDMETHOD(SaveEdgeUseData) (CComPtr<EdgeUse> pEdgeUse);
	STDMETHOD(SaveUnknownCurve2dData) (CComPtr<IDispatch> pCurve);
	STDMETHOD(SaveLineCurve2dData) (CComPtr<IDispatch> pCurve);
	STDMETHOD(SaveLineSegmentCurve2dData) (CComPtr<IDispatch> pCurve);
	STDMETHOD(SaveCircleCurve2dData) (CComPtr<IDispatch> pCurve);
	STDMETHOD(SaveCircularArcCurve2dData) (CComPtr<IDispatch> pCurve);
	STDMETHOD(SaveEllipseFullCurve2dData) (CComPtr<IDispatch> pCurve);
	STDMETHOD(SaveEllipticalArcCurve2dData) (CComPtr<IDispatch> pCurve);
	STDMETHOD(SaveBSplineCurve2dData) (CComPtr<IDispatch> pCurve);
	STDMETHOD(SavePolylineCurve2dData) (CComPtr<IDispatch> pCurve);
	STDMETHOD(SaveEdgeUseTessellationData) (CComPtr<EdgeUse> pEdgeUse);
	STDMETHOD(SaveVertexData) (CComPtr<Vertex> pVertex);

private:
	//----- local variables
	// ui
	CComBSTR m_bstrMessage;
	CComPtr<ProgressBarObject> m_pProgressBar;

	// names
	CString				m_strVisFileName;
	CString				m_strLogFileName;

	// topology
	ofstream			m_fileTopology;
	long					m_nTopologyFileInd = 0;

	// faces
	ofstream			m_fileFaces;
	long					m_nFacesFileInd = 0;
	vector<long>	m_alFaceKeys;

	// edges
	ofstream			m_fileEdges;
	long					m_nEdgesFileInd = 0;
	vector<long>	m_alEdgeKeys;

	// edge uses
	ofstream			m_fileEdgeUses;
	long					m_nEdgeUsesFileInd = 0;
	vector<long>	m_alEdgeUseKeys;

	// vertices
	ofstream			m_fileVertices;
	long					m_nVerticesFileInd = 0;
	vector<long>	m_alVertexKeys;
};
