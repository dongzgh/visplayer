#include "stdafx.h"
#include "ExportPartCommandButton.h"

#pragma warning( disable : 4101 )

//-----------------------------------------------------------------------------
//----- Gloal macros
//-----------------------------------------------------------------------------
#define TOLERANCE_GEO		0.01
#define GEO_3D					3
#define GEO_2D					2
#define TESSLLATION_MIN 3
#define TESSLLATION_MAX 100

//-----------------------------------------------------------------------------
//----- Implementation of local debug methods
//-----------------------------------------------------------------------------
void CExportPartCommandButton::_TRACE_FLUSH()
{
#ifdef _DEBUG
	ofstream oFile(m_strLogFileName, ios::out);
	oFile.close();
#endif
}

void CExportPartCommandButton::_TRACE_PRINT(CString & str)
{
#ifdef _DEBUG
	ofstream oFile(m_strLogFileName, ios::app);
	oFile << str << endl;
	oFile.close();
#endif
};

void CExportPartCommandButton::_TRACE_PRINT(CComBSTR & bstr)
{
#ifdef _DEBUG
	ofstream oFile(m_strLogFileName, ios::app);
	CW2A ch(bstr);
	oFile << ch << endl;
	oFile.close();
#endif
};

void CExportPartCommandButton:: _TRACE_PRINT(char * sz)
{
#ifdef _DEBUG
	ofstream oFile(m_strLogFileName, ios::app);
	oFile << sz << endl;
	oFile.close();
#endif
}

void CExportPartCommandButton::_TRACE_PRINT(double d)
{
#ifdef _DEBUG
	ofstream oFile(m_strLogFileName, ios::app);
	oFile << d << endl;
	oFile.close();
#endif
}

void CExportPartCommandButton::_TRACE_PRINT(long l)
{
#ifdef _DEBUG
	ofstream oFile(m_strLogFileName, ios::app);
	oFile << l << endl;
	oFile.close();
#endif
}

void CExportPartCommandButton::_TRACE_PRINT(char * sz, long l)
{
#ifdef _DEBUG
	ofstream oFile(m_strLogFileName, ios::app);
	oFile << sz << l << endl;
	oFile.close();
#endif
}

void CExportPartCommandButton::_TRACE_PRINT(char * sz, double d)
{
	ofstream oFile(m_strLogFileName, ios::app);
	oFile << sz << d << endl;
	oFile.close();
}

//-----------------------------------------------------------------------------
//----- Implementation of local methods
//-----------------------------------------------------------------------------
// - write indentation
void CExportPartCommandButton::writeIndent(ofstream & file, long n) {
	for(long i = 0; i < n; i++) file << "\t";
}

void CExportPartCommandButton::writeIndent(ofstream & file) {
	if (&file == &m_fileTopology)
		writeIndent(file, m_nTopologyFileInd);
	else if (&file == &m_fileFaces)
		writeIndent(file, m_nFacesFileInd);
	else if (&file == &m_fileEdges)
		writeIndent(file, m_nEdgesFileInd);
	else if (&file == &m_fileEdgeUses)
		writeIndent(file, m_nEdgeUsesFileInd);
	else if (&file == &m_fileVertices)
		writeIndent(file, m_nVerticesFileInd);
}

void CExportPartCommandButton::writeIndentBegin(ofstream & file) {
	if (&file == &m_fileTopology)
		writeIndent(file, m_nTopologyFileInd++);
	else if (&file == &m_fileFaces)
		writeIndent(file, m_nFacesFileInd++);
	else if (&file == &m_fileEdges)
		writeIndent(file, m_nEdgesFileInd++);
	else if (&file == &m_fileEdgeUses)
		writeIndent(file, m_nEdgeUsesFileInd++);
	else if (&file == &m_fileVertices)
		writeIndent(file, m_nVerticesFileInd++);
}

void CExportPartCommandButton::writeIndentEnd(ofstream & file) {
	if (&file == &m_fileTopology)
		writeIndent(file, --m_nTopologyFileInd);
	else if (&file == &m_fileFaces)
		writeIndent(file, --m_nFacesFileInd);
	else if (&file == &m_fileEdges)
		writeIndent(file, --m_nEdgesFileInd);
	else if (&file == &m_fileEdgeUses)
		writeIndent(file, --m_nEdgeUsesFileInd);
	else if (&file == &m_fileVertices)
		writeIndent(file, --m_nVerticesFileInd);
}

// - write container
void CExportPartCommandButton::writeObjectBegin(ofstream & file, bool bFirst) {
	if (!bFirst) file << "," << endl;
	else file << endl;
	writeIndentBegin(file);
	file << "{";
}

void CExportPartCommandButton::writeObjectEnd(ofstream & file) {
	file << endl;
	writeIndentEnd(file);
	file << "}";
}

void CExportPartCommandButton::writeObjectValueBegin(ofstream & file, const char * sz, bool bFirst) {
	if (!bFirst) file << "," << endl;
	else file << endl;
	writeIndentBegin(file);
	file << "\"" << sz << "\":{";
}

void CExportPartCommandButton::writeObjectValueEnd(ofstream & file) {
	file << endl;
	writeIndentEnd(file);
	file << "}";
}

void CExportPartCommandButton::writeArrayBegin(ofstream & file, bool bFirst) {
	if (!bFirst) file << "," << endl;
	else file << endl;
	writeIndentBegin(file);
	file << "[";
}

void CExportPartCommandButton::writeArrayEnd(ofstream & file) {
	file << endl;
	writeIndentEnd(file);
	file << "]";
}

void CExportPartCommandButton::writeArrayValueBegin(ofstream & file, const char * sz, bool bFirst) {
	if (!bFirst) file << "," << endl;
	else file << endl;
	writeIndentBegin(file);
	file << "\"" << sz << "\":[";
}

void CExportPartCommandButton::writeArrayValueEnd(ofstream & file) {
	file << endl;
	writeIndentEnd(file);
	file << "]";
}

// - write value
void CExportPartCommandButton::writeBoolValue(ofstream & file, const char * saName, VARIANT_BOOL bValue, bool bFirst) {
	if (!bFirst) file << "," << endl;
	else file << endl;
	writeIndent(file);
	file << "\"" << saName << "\":";
	file << bValue;
}

void CExportPartCommandButton::writeLongValue(ofstream & file, const char * saName, long lValue, bool bFirst) {
	if (!bFirst) file << "," << endl;
	else file << endl;
	writeIndent(file);
	file << "\"" << saName << "\":";
	file << lValue;
}

void CExportPartCommandButton::writeDoubleValue(ofstream & file, const char * saName, double dValue, bool bFirst) {
	if (!bFirst) file << "," << endl;
	else file << endl;
	writeIndent(file);
	file << "\"" << saName << "\":";
	file << dValue;
}

void CExportPartCommandButton::writeStringValue(ofstream & file, const char * saName, const char * szValue, bool bFirst) {
	if (!bFirst) file << "," << endl;
	else file << endl;
	writeIndent(file);
	file << "\"" << saName << "\":";
	file << "\"" << szValue << "\"";
}

// - write value array
void CExportPartCommandButton::writeBoolArrayValue(ofstream & file, long nN, CComSafeArray<VARIANT_BOOL> * pVs) {
	file << endl;
	writeIndent(file);
	for (long i = 0; i < nN; i++) {
		if (i == nN - 1) file << (*pVs)[i];
		else file << (*pVs)[i] << ",";
	}
}

void CExportPartCommandButton::writeLongArrayValue(ofstream & file, long nN, CComSafeArray<long> * pVs) {
	file << endl;
	writeIndent(file);
	for (long i = 0; i < nN; i++) {
		if (i == nN - 1) file << (*pVs)[i];
		else file << (*pVs)[i] << ",";
	}
}

void CExportPartCommandButton::writeDoubleArrayValue(ofstream & file, long nN, CComSafeArray<double> * pVs) {
	file << endl;
	writeIndent(file);
	for (long i = 0; i < nN; i++) {
		if (i == nN - 1) file << (*pVs)[i];
		else file << (*pVs)[i] << ",";
	}
}

bool CExportPartCommandButton::findInVector(vector<long> & v, long n) {
	vector<long>::const_iterator it;
	for (it = v.cbegin(); it != v.cend(); it++) {
		if (*it == n)	return true;
	}
	return false;
}

//-----------------------------------------------------------------------------
//----- Implementation of public methods
//-----------------------------------------------------------------------------
STDMETHODIMP CExportPartCommandButton::ButtonDefinitionEvents_OnExecute(NameValueMap *pContext)
{
	HRESULT hr;

	// initialize data
	InitializeData();

	// create progress bar
	m_bstrMessage = "Exporting to vis applications...";
	hr = m_pApplication->CreateProgressBar(TRUE, 3, m_bstrMessage, FALSE, m_pApplication->GetMainFrameHWND(), &m_pProgressBar);
	m_pProgressBar->UpdateProgress();
	 
	CComPtr<Document> pActiveDoc;
	hr = m_pApplication->get_ActiveDocument(&pActiveDoc);
	if (FAILED(hr)) return hr;

	// get the document path
	CComBSTR bstrFullDocumentName;
	hr = pActiveDoc->get_FullDocumentName(&bstrFullDocumentName);
	if (FAILED(hr)) return hr;
	CString strFullDocumentName(bstrFullDocumentName);
	CString strPathName = strFullDocumentName.Left(strFullDocumentName.ReverseFind('\\'));

	// get the document name
	CComBSTR bstrDisplayName;
	hr = pActiveDoc->get_DisplayName(&bstrDisplayName);
	if (FAILED(hr)) return hr;
	CString strDisplayName(bstrDisplayName);
	CString strDocName = strDisplayName.Left(strDisplayName.Find(_T("."), 0));

	// reinterpret document
	CComQIPtr<PartDocument> pPartDocument(pActiveDoc);

	// get the part component definition
	CComPtr<PartComponentDefinition> pPartCompDef;
	hr = pPartDocument->get_ComponentDefinition(&pPartCompDef);
	if (FAILED(hr)) return hr;

	// determine vis and log file names
	m_strLogFileName = strPathName + "\\" + strDocName + ".log";
	m_strVisFileName = strPathName + "\\" + strDocName + ".vis";

	// flush log file
	//_TRACE_FLUSH();
	
	// open file stream for writting
	CString strTopologyFile = "t"; // topology
	m_fileTopology.open(strTopologyFile, ios::out | ios::binary);
	CString strFacesFile = "f"; // faces
	m_fileFaces.open(strFacesFile, ios::out | ios::binary);
	CString strEdgesFile = "e"; // edges
	m_fileEdges.open(strEdgesFile, ios::out | ios::binary);
	CString strEdgeUsesFile = "u"; // edge uses
	m_fileEdgeUses.open(strEdgeUsesFile, ios::out | ios::binary);
	CString strVerticesFile = "v"; // vertices
	m_fileVertices.open(strVerticesFile, ios::out | ios::binary);	

	// write component data
	SaveCompData(pPartCompDef);

	// close file streams
	m_fileTopology.close();
	m_fileFaces.close();
	m_fileEdges.close();
	m_fileEdgeUses.close();
	m_fileVertices.close();

	// create file list for compression
	CString str7zipFile = "7z.list";
	ofstream fileList(str7zipFile, ios::out);
	fileList << strTopologyFile << endl;
	fileList << strFacesFile << endl;
	fileList << strEdgesFile << endl;
	fileList << strEdgeUsesFile << endl;
	fileList << strVerticesFile << endl;
	fileList.close();

	// compress files
	CString str7zipCmd = "7z a -tzip ";
	str7zipCmd += "\"" + m_strVisFileName + "\" ";
	str7zipCmd += "@\"" + str7zipFile + "\"";
	system(str7zipCmd);
	
	// remove temporary files
	remove(strTopologyFile);
	remove(strFacesFile);
	remove(strEdgesFile);
	remove(strEdgeUsesFile);
	remove(strVerticesFile);
	remove(str7zipFile);

	// delete progress bar
	m_pProgressBar->Close();

	return S_OK;
}

//-----------------------------------------------------------------------------
//----- Implementation of private methods
//-----------------------------------------------------------------------------
STDMETHODIMP CExportPartCommandButton::InitializeData()
{
	// ui
	m_pProgressBar = NULL;
	
	// topology
	m_nTopologyFileInd = 0;

	// faces
	m_nFacesFileInd = 0;
	m_alFaceKeys.clear();

	// edges
	m_nEdgesFileInd = 0;
	m_alEdgeKeys.clear();

	// edge uses
	m_nEdgeUsesFileInd = 0;
	m_alEdgeUseKeys.clear();

	// vertices
	m_nVerticesFileInd = 0;
	m_alVertexKeys.clear();

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveCompData(CComPtr<PartComponentDefinition> pCompDef)
{
	HRESULT hr;

	// update progress bar
	m_pProgressBar->UpdateProgress();

	// get part features
	CComPtr<PartFeatures> pFeatures;
	hr = pCompDef->get_Features(&pFeatures);
	if (FAILED(hr))	return hr;

	// get the first part feature
	CComPtr<PartFeature> pFeature;
	hr = pFeatures->get_Item(CComVariant(1), &pFeature);
	if (FAILED(hr))	return hr;

	// get part feature type
	ObjectTypeEnum objectType;
	hr = pFeature->get_Type(&objectType);
	if (FAILED(hr))	return hr;

	// write non-parametric feature
	if (objectType == kNonParametricBaseFeatureObject)
	{
		// get the first non-parametric feature
		CComPtr<NonParametricBaseFeature> pNonParametricBaseFeature;
		hr = pFeatures->get_NonParametricBaseFeature(&pNonParametricBaseFeature);
		if (FAILED(hr)) return hr;

		// get non-parametric feature type
		VARIANT_BOOL bIsSolid;
		hr = pNonParametricBaseFeature->get_IsSolid(&bIsSolid);
		if (FAILED(hr)) return hr;
		
		if (bIsSolid == VARIANT_TRUE)
		{
			// get surface bodies
			CComPtr<SurfaceBodies> pSurfaceBodies;
			hr = pCompDef->get_SurfaceBodies(&pSurfaceBodies);
			if (SUCCEEDED(hr) && pSurfaceBodies->GetCount() != 0l)
			{
				// get the first surface body
				CComPtr<SurfaceBody> pBody;
				hr = pSurfaceBodies->get_Item(1, &pBody);
				if (FAILED(hr)) return hr;

				// begin writting data
				writeObjectBegin(m_fileTopology, true);
				writeArrayBegin(m_fileFaces, true);
				writeArrayBegin(m_fileEdges, true);
				writeArrayBegin(m_fileEdgeUses, true);
				writeArrayBegin(m_fileVertices, true);

				// write body data
				SaveBodyData(pBody);

				// end writting data
				writeObjectEnd(m_fileTopology);
				writeArrayEnd(m_fileFaces);
				writeArrayEnd(m_fileEdges);
				writeArrayEnd(m_fileEdgeUses);
				writeArrayEnd(m_fileVertices);

				// update progress bar
				m_pProgressBar->UpdateProgress();

				return S_OK;
			}
		}
		else
		{
			// begin writting faces
			writeArrayBegin(m_fileTopology, true);
			writeArrayBegin(m_fileFaces, true);
			writeArrayBegin(m_fileEdges, true);
			writeArrayBegin(m_fileEdgeUses, true);
			writeArrayBegin(m_fileVertices, true);

			// get faces
			CComPtr<Faces> pFaces;
			hr = pNonParametricBaseFeature->get_Faces(&pFaces);

			// iterate each face
			long faceCount = 1;
			CComPtr<Face> pFace;
			for (; (hr = pFaces->get_Item(faceCount, &pFace)) == S_OK; faceCount++, pFace.Release())
			{
				// begin writting face
				writeObjectBegin(m_fileTopology, (faceCount == 1));

				// write face
				SaveFaceData(pFace);

				// end writting face
				writeObjectEnd(m_fileTopology);
			}

			// end writting faces
			writeArrayEnd(m_fileTopology);
			writeArrayEnd(m_fileFaces);
			writeArrayEnd(m_fileEdges);
			writeArrayEnd(m_fileEdgeUses);
			writeArrayEnd(m_fileVertices);

			// update progress bar
			m_pProgressBar->UpdateProgress();

			return S_OK;
		}
	}
	else
	{
		// get surface bodies
		CComPtr<SurfaceBodies> pSurfaceBodies;	
		hr = pCompDef->get_SurfaceBodies(&pSurfaceBodies);
		if (SUCCEEDED(hr) && pSurfaceBodies->GetCount() != 0l) 
		{
			// get the first surface body
			CComPtr<SurfaceBody> pBody;
			hr = pSurfaceBodies->get_Item(1, &pBody);
			if (FAILED(hr)) return hr;

			// begin writting data
			writeObjectBegin(m_fileTopology, true);
			writeArrayBegin(m_fileFaces, true);
			writeArrayBegin(m_fileEdges, true);
			writeArrayBegin(m_fileEdgeUses, true);
			writeArrayBegin(m_fileVertices, true);

			// write body data
			SaveBodyData(pBody);

			// end writting data
			writeObjectEnd(m_fileTopology);
			writeArrayEnd(m_fileFaces);
			writeArrayEnd(m_fileEdges);
			writeArrayEnd(m_fileEdgeUses);
			writeArrayEnd(m_fileVertices);

			// update progress bar
			m_pProgressBar->UpdateProgress();

			return S_OK;
		}
	}

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveBodyData(CComPtr<SurfaceBody> pBody)
{
	HRESULT hr;
	
	// write body type
	writeStringValue(m_fileTopology, "type", "surfaceBody", true);

	// get shells
	CComPtr<FaceShells> pShells;
	hr = pBody->get_FaceShells(&pShells);
	if (FAILED(hr)) return hr;

	// begin writting shells
	writeArrayValueBegin(m_fileTopology, "shells");

	// iterate each shell
	long shellCount = 1;
	CComPtr<FaceShell> pShell;
	for (; (hr = pShells->get_Item(shellCount, &pShell)) == S_OK; shellCount++, pShell.Release())
	{
		// begin writting shell
		writeObjectBegin(m_fileTopology, (shellCount == 1));

		// write shell		
		SaveShellData(pShell);

		// end writting shell
		writeObjectEnd(m_fileTopology);
	}

	// end writting shells
	writeArrayValueEnd(m_fileTopology);	

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveShellData(CComPtr<FaceShell> pShell)
{
	HRESULT hr;		

	// write shell id
	long lKey = 0;
	pShell->get_TransientKey(&lKey);
	writeLongValue(m_fileTopology, "id", lKey, true);

	// write shell type
	writeStringValue(m_fileTopology, "type", "shell");

	// get faces
	CComPtr<Faces> pFaces;
	hr = pShell->get_Faces(&pFaces);
	if (FAILED(hr)) return hr;

	// begin writting faces
	writeArrayValueBegin(m_fileTopology, "faces");

	// iterate each face
	long faceCount = 1;
	CComPtr<Face> pFace;
	for (; (hr = pFaces->get_Item(faceCount, &pFace)) == S_OK; faceCount++, pFace.Release())
	{
		// begin writting face
		writeObjectBegin(m_fileTopology, (faceCount == 1));

		// write face
		SaveFaceData(pFace);

		// end writting face
		writeObjectEnd(m_fileTopology);
	}

	// end writting faces
	writeArrayValueEnd(m_fileTopology);	

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveFaceData(CComPtr<Face> pFace)
{
	HRESULT hr;

	// write face id
	long lKey = 0;
	pFace->get_TransientKey(&lKey);
	writeLongValue(m_fileTopology, "id", lKey, true);

	// write face type
	writeStringValue(m_fileTopology, "type", "face");

	// write face details
	if (!findInVector(m_alFaceKeys, lKey))
	{
		// save key
		m_alFaceKeys.push_back(lKey);

		// begin writting face detail
		writeObjectBegin(m_fileFaces, m_alFaceKeys.capacity() == 1);

		// write face id
		writeLongValue(m_fileFaces, "id", lKey, true);

		// get surface type
		SurfaceTypeEnum surfaceType;
		hr = pFace->get_SurfaceType(&surfaceType);
		if (FAILED(hr)) return hr;

		// get surface geometry
		CComPtr<IDispatch> pSurface;
		hr = pFace->get_Geometry(&pSurface);
		if (FAILED(hr)) return hr;

		// write surface
		if (surfaceType == kUnknownSurface) {
			SaveUnknownSurfaceData(pSurface);
		}
		else if (surfaceType == kPlaneSurface) {
			SavePlaneSurfaceData(pSurface);
		}
		else if (surfaceType == kCylinderSurface) {
			SaveCylinderSurfaceData(pSurface);
		}
		else if (surfaceType == kEllipticalCylinderSurface) {
			SaveEllipticalCylinderSurfaceData(pSurface);
		}
		else if (surfaceType == kConeSurface) {
			SaveConeSurfaceData(pSurface);
		}
		else if (surfaceType == kEllipticalConeSurface) {
			SaveEllipticalConeSurfaceData(pSurface);
		}
		else if (surfaceType == kTorusSurface) {
			SaveTorusSurfaceData(pSurface);
		}
		else if (surfaceType == kSphereSurface) {
			SaveSphereSurfaceData(pSurface);
		}		
		else if (surfaceType == kBSplineSurface) {
			SaveBSplineSurfaceData(pSurface);
		}

		// begin writting tessellation
		writeObjectValueBegin(m_fileFaces, "tessellation");

		// write tessellation 
		SaveFaceTessellationData(pFace);

		// end writting tessellation
		writeObjectValueEnd(m_fileFaces);		

		// end writting face detail
		writeObjectEnd(m_fileFaces);		
	}

	// get loops
	CComPtr<EdgeLoops> pLoops;
	hr = pFace->get_EdgeLoops(&pLoops);
	if (FAILED(hr)) return hr;

	// begin writting loops
	writeArrayValueBegin(m_fileTopology, "loops");

	// iterate each loop
	long loopCount = 1;
	CComPtr<EdgeLoop> pLoop;
	for (; (hr = pLoops->get_Item(loopCount, &pLoop)) == S_OK; loopCount++, pLoop.Release()) 
	{
		// begin writting loop
		writeObjectBegin(m_fileTopology, (loopCount == 1));

		// write loop
		SaveLoopData(pLoop);

		// end writting loop
		writeObjectEnd(m_fileTopology);
	}

	// end writting loops
	writeArrayValueEnd(m_fileTopology);	

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveUnknownSurfaceData(CComPtr<IDispatch> pSurface)
{
	HRESULT hr;

	// write surface type
	writeLongValue(m_fileFaces, "surfaceType", kUnknownSurface);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SavePlaneSurfaceData(CComPtr<IDispatch> pSurface)
{
	HRESULT hr;

	// reinterpret surface
	CComQIPtr<Plane> pPlane(pSurface);

	// write surface type
	writeLongValue(m_fileFaces, "surfaceType", kPlaneSurface);

	// get plane definition
	CComSafeArray<double> *pRootPoint;
	pRootPoint = new CComSafeArray<double>;
	CComSafeArray<double> *pNormal;
	pNormal = new CComSafeArray<double>;
	hr = pPlane->GetPlaneData(
		(*pRootPoint).GetSafeArrayPtr(),
		(*pNormal).GetSafeArrayPtr());
	if (FAILED(hr)) return hr;

	// write plane root point
	writeArrayValueBegin(m_fileFaces, "rootPoint");
	writeDoubleArrayValue(m_fileFaces, 3, pRootPoint);
	writeArrayValueEnd(m_fileFaces);

	// write plane normal
	writeArrayValueBegin(m_fileFaces, "normal");
	writeDoubleArrayValue(m_fileFaces, 3, pNormal);
	writeArrayValueEnd(m_fileFaces);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveCylinderSurfaceData(CComPtr<IDispatch> pSurface)
{
	HRESULT hr;

	// reinterpret surface
	CComQIPtr<Cylinder> pCylinder(pSurface);

	// write surface type
	writeLongValue(m_fileFaces, "surfaceType", kCylinderSurface);

	// get cylinder definition
	CComSafeArray<double> *pBasePoint;
	pBasePoint = new CComSafeArray<double>;
	CComSafeArray<double> *pAxisVector;
	pAxisVector = new CComSafeArray<double>;
	double dRadius = 0.0;
	hr = pCylinder->GetCylinderData(
		(*pBasePoint).GetSafeArrayPtr(),
		(*pAxisVector).GetSafeArrayPtr(),
		&dRadius);
	if (FAILED(hr)) return hr;

	// write cylinder base point
	writeArrayValueBegin(m_fileFaces, "basePoint");
	writeDoubleArrayValue(m_fileFaces, 3, pBasePoint);
	writeArrayValueEnd(m_fileFaces);

	// write cylinder axis vector
	writeArrayValueBegin(m_fileFaces, "axisVector");
	writeDoubleArrayValue(m_fileFaces, 3, pAxisVector);
	writeArrayValueEnd(m_fileFaces);

	// write cylinder radius
	writeDoubleValue(m_fileFaces, "radius", dRadius);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveEllipticalCylinderSurfaceData(CComPtr<IDispatch> pSurface)
{
	HRESULT hr;

	// reinterpret surface
	CComQIPtr<EllipticalCylinder> pEllipticalCylinder(pSurface);

	// write surface type
	writeLongValue(m_fileFaces, "surfaceType", kEllipticalCylinderSurface);

	// get elliptical cylinder definition
	CComSafeArray<double> *pBasePoint;
	pBasePoint = new CComSafeArray<double>;
	CComSafeArray<double> *pAxisVector;
	pAxisVector = new CComSafeArray<double>;
	CComSafeArray<double> *pMajorAxis;
	pMajorAxis = new CComSafeArray<double>;
	double dMinorMajorRatio = 0.0;
	hr = pEllipticalCylinder->GetEllipticalCylinderData(
		(*pBasePoint).GetSafeArrayPtr(),
		(*pAxisVector).GetSafeArrayPtr(),
		(*pMajorAxis).GetSafeArrayPtr(),
		&dMinorMajorRatio);
	if (FAILED(hr)) return hr;

	// write elliptical cylinder base point
	writeArrayValueBegin(m_fileFaces, "basePoint");
	writeDoubleArrayValue(m_fileFaces, 3, pBasePoint);
	writeArrayValueEnd(m_fileFaces);

	// write elliptical cylinder axis vector
	writeArrayValueBegin(m_fileFaces, "axisVector");
	writeDoubleArrayValue(m_fileFaces, 3, pAxisVector);
	writeArrayValueEnd(m_fileFaces);

	// write elliptical cylinder major axis
	writeArrayValueBegin(m_fileFaces, "majorAxis");
	writeDoubleArrayValue(m_fileFaces, 3, pMajorAxis);
	writeArrayValueEnd(m_fileFaces);

	// write ellitpical cylinder minor major ratio
	writeDoubleValue(m_fileFaces, "minorMajorRatio", dMinorMajorRatio);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveConeSurfaceData(CComPtr<IDispatch> pSurface)
{
	HRESULT hr;

	// reinterpret surface
	CComQIPtr<Cone> pCone(pSurface);

	// write surface type
	writeLongValue(m_fileFaces, "surfaceType", kConeSurface);

	// get cone definition
	CComSafeArray<double> *pBasePoint;
	pBasePoint = new CComSafeArray<double>;
	CComSafeArray<double> *pAxisVector;
	pAxisVector = new CComSafeArray<double>;
	double dRadius = 0.0, dHalfAngle = 0.0;
	VARIANT_BOOL bIsExpanding;
	hr = pCone->GetConeData(
		(*pBasePoint).GetSafeArrayPtr(),
		(*pAxisVector).GetSafeArrayPtr(),
		&dRadius, &dHalfAngle, &bIsExpanding);
	if (FAILED(hr)) return hr;

	// write cone base point
	writeArrayValueBegin(m_fileFaces, "basePoint");
	writeDoubleArrayValue(m_fileFaces, 3, pBasePoint);
	writeArrayValueEnd(m_fileFaces);

	// write cone axis vector
	writeArrayValueBegin(m_fileFaces, "axisVector");
	writeDoubleArrayValue(m_fileFaces, 3, pAxisVector);
	writeArrayValueEnd(m_fileFaces);

	// write cone radius
	writeDoubleValue(m_fileFaces, "radius", dRadius);

	// write cone radius
	writeDoubleValue(m_fileFaces, "halfAngle", dHalfAngle);

	// write cone expanding
	writeDoubleValue(m_fileFaces, "isExpanding", bIsExpanding);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveEllipticalConeSurfaceData(CComPtr<IDispatch> pSurface)
{
	HRESULT hr;

	// reinterpret surface
	CComQIPtr<EllipticalCone> pEllipticalCone(pSurface);

	// write surface type
	writeLongValue(m_fileFaces, "surfaceType", kEllipticalConeSurface);

	// get elliptical cone definition
	CComSafeArray<double> *pBasePoint;
	pBasePoint = new CComSafeArray<double>;
	CComSafeArray<double> *pAxisVector;
	pAxisVector = new CComSafeArray<double>;
	CComSafeArray<double> *pMajorAxis;
	pMajorAxis = new CComSafeArray<double>;
	double dMinorMajorRatio = 0.0, dHalfAngle = 0.0;
	VARIANT_BOOL bIsExpanding;
	hr = pEllipticalCone->GetEllipticalConeData(
		(*pBasePoint).GetSafeArrayPtr(),
		(*pAxisVector).GetSafeArrayPtr(),
		(*pMajorAxis).GetSafeArrayPtr(),
		&dMinorMajorRatio, &dHalfAngle, &bIsExpanding);
	if (FAILED(hr)) return hr;

	// write elliptical cone base point
	writeArrayValueBegin(m_fileFaces, "basePoint");
	writeDoubleArrayValue(m_fileFaces, 3, pBasePoint);
	writeArrayValueEnd(m_fileFaces);

	// write elliptical cone axis vector
	writeArrayValueBegin(m_fileFaces, "axisVector");
	writeDoubleArrayValue(m_fileFaces, 3, pAxisVector);
	writeArrayValueEnd(m_fileFaces);

	// write elliptical cone major axis
	writeArrayValueBegin(m_fileFaces, "majorAxis");
	writeDoubleArrayValue(m_fileFaces, 3, pMajorAxis);
	writeArrayValueEnd(m_fileFaces);

	// write elliptical cone manio major ratio
	writeDoubleValue(m_fileFaces, "minorMajorRatio", dMinorMajorRatio);

	// write elliptical cone radius
	writeDoubleValue(m_fileFaces, "halfAngle", dHalfAngle);

	// write elliptical cone expanding
	writeDoubleValue(m_fileFaces, "isExpanding", bIsExpanding);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveTorusSurfaceData(CComPtr<IDispatch> pSurface)
{
	HRESULT hr;

	// reinterpret surface
	CComQIPtr<Torus> pTorus(pSurface);

	// write surface type
	writeLongValue(m_fileFaces, "surfaceType", kTorusSurface);

	// get torus definition
	CComSafeArray<double> *pCenterPoint;
	pCenterPoint = new CComSafeArray<double>;
	CComSafeArray<double> *pAxisVector;
	pAxisVector = new CComSafeArray<double>;
	double dMajorRadius = 0.0, dMinorRadius = 0.0;
	hr = pTorus->GetTorusData(
		(*pCenterPoint).GetSafeArrayPtr(),
		(*pAxisVector).GetSafeArrayPtr(),
		&dMajorRadius, &dMinorRadius);
	if (FAILED(hr)) return hr;

	// write torus center point
	writeArrayValueBegin(m_fileFaces, "centerPoint");
	writeDoubleArrayValue(m_fileFaces, 3, pCenterPoint);
	writeArrayValueEnd(m_fileFaces);

	// write torus axis vector
	writeArrayValueBegin(m_fileFaces, "axisVector");
	writeDoubleArrayValue(m_fileFaces, 3, pAxisVector);
	writeArrayValueEnd(m_fileFaces);

	// write torus major radius
	writeDoubleValue(m_fileFaces, "majorRadius", dMajorRadius);

	// write torus minor radius
	writeDoubleValue(m_fileFaces, "minorRadius", dMinorRadius);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveSphereSurfaceData(CComPtr<IDispatch> pSurface)
{
	HRESULT hr;

	// reinterpret surface
	CComQIPtr<Sphere> pSphere(pSurface);

	// write surface type
	writeLongValue(m_fileFaces, "surfaceType", kSphereSurface);

	// get sphere definition
	CComSafeArray<double> *pCenterPoint;
	pCenterPoint = new CComSafeArray<double>;
	double dRadius = 0.0;
	hr = pSphere->GetSphereData(
		(*pCenterPoint).GetSafeArrayPtr(),
		&dRadius);
	if (FAILED(hr)) return hr;

	// write sphere center point
	writeArrayValueBegin(m_fileFaces, "centerPoint");
	writeDoubleArrayValue(m_fileFaces, 3, pCenterPoint);
	writeArrayValueEnd(m_fileFaces);

	// write sphere radius
	writeDoubleValue(m_fileFaces, "radius", dRadius);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveBSplineSurfaceData(CComPtr<IDispatch> pSurface)
{
	HRESULT hr;
	
	// reinterpret surface
	CComQIPtr<BSplineSurface> pBSplineSurface(pSurface);

	// write surface type
	writeLongValue(m_fileFaces, "surfaceType", kBSplineSurface);

	// get bspline surface definition
	CComSafeArray<long> *pOrder;
	pOrder = new CComSafeArray<long>;
	CComSafeArray<long> *pNumPoles;
	pNumPoles = new CComSafeArray<long>;
	CComSafeArray<long> *pNumKnots;
	pNumKnots = new CComSafeArray<long>;
	VARIANT_BOOL bIsRational;
	CComSafeArray<VARIANT_BOOL> *pIsPeriodic;
	pIsPeriodic = new CComSafeArray<VARIANT_BOOL>;
	CComSafeArray<VARIANT_BOOL> *pIsClosed;
	pIsClosed = new CComSafeArray<VARIANT_BOOL>;
	VARIANT_BOOL bIsPlanar;
	CComSafeArray<double> *pPlaneVector;
	pPlaneVector = new CComSafeArray<double>;
	hr = pBSplineSurface->GetBSplineInfo(
		(*pOrder).GetSafeArrayPtr(),
		(*pNumPoles).GetSafeArrayPtr(),
		(*pNumKnots).GetSafeArrayPtr(),
		&bIsRational,
		(*pIsPeriodic).GetSafeArrayPtr(),
		(*pIsClosed).GetSafeArrayPtr(),
		&bIsPlanar,
		(*pPlaneVector).GetSafeArrayPtr());
	if (FAILED(hr)) return hr;

	// get bspline surface data
	CComSafeArray<double> *pPoles;
	pPoles = new CComSafeArray<double>;
	CComSafeArray<double> *pKnotsU;
	pKnotsU = new CComSafeArray<double>;
	CComSafeArray<double> *pKnotsV;
	pKnotsV = new CComSafeArray<double>;
	CComSafeArray<double> *pWeights;
	pWeights = new CComSafeArray<double>;
	hr = pBSplineSurface->GetBSplineData(
		(*pPoles).GetSafeArrayPtr(),
		(*pKnotsU).GetSafeArrayPtr(),
		(*pKnotsV).GetSafeArrayPtr(),
		(*pWeights).GetSafeArrayPtr());
	if (FAILED(hr)) return hr;

	// write bspline surface order
	writeArrayValueBegin(m_fileFaces, "order");
	writeLongArrayValue(m_fileFaces, 2, pOrder);
	writeArrayValueEnd(m_fileFaces);

	// write bspline surface number of poles
	writeArrayValueBegin(m_fileFaces, "numPoles");
	writeLongArrayValue(m_fileFaces, 2, pNumPoles);
	writeArrayValueEnd(m_fileFaces);

	// write bspline surface number of knots
	writeArrayValueBegin(m_fileFaces, "numKnots");
	writeLongArrayValue(m_fileFaces, 2, pNumKnots);
	writeArrayValueEnd(m_fileFaces);

	// write bspline surface rational
	writeDoubleValue(m_fileFaces, "isRational", bIsRational);

	// write bspline surface periodic
	writeArrayValueBegin(m_fileFaces, "isPeriodic");
	writeBoolArrayValue(m_fileFaces, 2, pIsPeriodic);
	writeArrayValueEnd(m_fileFaces);

	// write bspline surface closed
	writeArrayValueBegin(m_fileFaces, "isClosed");
	writeBoolArrayValue(m_fileFaces, 2, pIsClosed);
	writeArrayValueEnd(m_fileFaces);

	// write bspline surface planar
	writeDoubleValue(m_fileFaces, "isPlanar", bIsPlanar);

	// write bspline surface plane vector
	if (bIsPlanar == VARIANT_TRUE)
	{
		writeArrayValueBegin(m_fileFaces, "planeVector");
		writeDoubleArrayValue(m_fileFaces, 3, pPlaneVector);
		writeArrayValueEnd(m_fileFaces);
	}

	// write bspline surface poles
	long nNumPoles = (*pNumPoles)[0] * (*pNumPoles)[1];
	writeArrayValueBegin(m_fileFaces, "poles");
	writeDoubleArrayValue(m_fileFaces, nNumPoles * 3, pPoles);
	writeArrayValueEnd(m_fileFaces);

	// write bspline surface knots U
	writeArrayValueBegin(m_fileFaces, "knotsU");
	writeDoubleArrayValue(m_fileFaces, (*pNumKnots)[0], pKnotsU);
	writeArrayValueEnd(m_fileFaces);

	// write bspline surface knots V
	writeArrayValueBegin(m_fileFaces, "knotsV");
	writeDoubleArrayValue(m_fileFaces, (*pNumKnots)[1], pKnotsV);
	writeArrayValueEnd(m_fileFaces);

	// write bspline surface weights
	if (bIsRational == VARIANT_TRUE) {
		writeArrayValueBegin(m_fileFaces, "weights");
		writeDoubleArrayValue(m_fileFaces, nNumPoles, pWeights);
		writeArrayValueEnd(m_fileFaces);
	}

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveFaceTessellationData(CComPtr<Face> pFace)
{
	HRESULT hr;

	// get tolerances
	long lToleranceCount = 0;
	CComSafeArray<double> *pExistingTolerances;
	pExistingTolerances = new CComSafeArray<double>;
	hr = pFace->GetExistingFacetTolerances(
		&lToleranceCount,
		(*pExistingTolerances).GetSafeArrayPtr());
	if (FAILED(hr)) return hr;

	// write tolerances
	writeArrayValueBegin(m_fileFaces, "tolerances", true);
	writeDoubleArrayValue(m_fileFaces, lToleranceCount, pExistingTolerances);
	writeArrayValueEnd(m_fileFaces);

	// begin writting faces
	writeArrayValueBegin(m_fileFaces, "facets");

	// iterate each facets
	for (long i = 0; i < lToleranceCount; i++)
	{
		// begin writting facet
		writeObjectBegin(m_fileFaces, i == 0);

		// write facet data
		long lVertexCount = 0;
		long lFacetCount = 0;
		CComSafeArray<double> *pVertexCoordinates;
		pVertexCoordinates = new CComSafeArray<double>;
		CComSafeArray<double> *pNormalVectors;
		pNormalVectors = new CComSafeArray<double>;
		CComSafeArray<long> *pVertexIndices;
		pVertexIndices = new CComSafeArray<long>;
		hr = pFace->GetExistingFacets(
			(*pExistingTolerances)[i], &lVertexCount, &lFacetCount,
			(*pVertexCoordinates).GetSafeArrayPtr(),
			(*pNormalVectors).GetSafeArrayPtr(),
			(*pVertexIndices).GetSafeArrayPtr());
		if (FAILED(hr)) return hr;

		// write facets' vertex count
		writeLongValue(m_fileFaces, "vertexCount", lVertexCount, true);

		// write facets's facet count
		writeLongValue(m_fileFaces, "facetCount", lFacetCount);

		// write facets' vertex coordinates
		writeArrayValueBegin(m_fileFaces, "vertexCoordinates");
		writeDoubleArrayValue(m_fileFaces, lVertexCount * 3, pVertexCoordinates);
		writeArrayValueEnd(m_fileFaces);

		// write facets' normal vectors
		writeArrayValueBegin(m_fileFaces, "normalVectors");
		writeDoubleArrayValue(m_fileFaces, lVertexCount * 3, pNormalVectors);
		writeArrayValueEnd(m_fileFaces);

		// write facets' vertex indices
		writeArrayValueBegin(m_fileFaces, "vertexIndices");
		writeLongArrayValue(m_fileFaces, lFacetCount * 3, pVertexIndices);
		writeArrayValueEnd(m_fileFaces);

		// end writting facet
		writeObjectEnd(m_fileFaces);
	}

	// end writting facets
	writeArrayValueEnd(m_fileFaces);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveLoopData(CComPtr<EdgeLoop> pLoop)
{
	HRESULT hr;

	// write loop id
	long lKey = 0;
	pLoop->get_TransientKey(&lKey);
	writeLongValue(m_fileTopology, "id", lKey, true);

	// write loop type
	writeStringValue(m_fileTopology, "type", "loop");

	// get the edges from the loop.
	CComPtr<Edges> pEdges;
	hr = pLoop->get_Edges(&pEdges);
	if (FAILED(hr)) return hr;

	// begin writting edges
	writeArrayValueBegin(m_fileTopology, "edges");

	// iterate each edge
	long edgeCount = 1;
	CComPtr<Edge> pEdge;
	for (; (hr = pEdges->get_Item(edgeCount, &pEdge)) == S_OK; edgeCount++, pEdge.Release())
	{
		// begin writting edge
		writeObjectBegin(m_fileTopology, edgeCount == 1);

		// write loop edge data
		SaveEdgeData(pEdge);

		// end writting edge
		writeObjectEnd(m_fileTopology);
	}

	// end writting edges
	writeArrayValueEnd(m_fileTopology);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveEdgeData(CComPtr<Edge> pEdge)
{
	HRESULT hr;

	// write edge id
	long lKey = 0;
	pEdge->get_TransientKey(&lKey);
	writeLongValue(m_fileTopology, "id", lKey, true);

	// write edge type
	writeStringValue(m_fileTopology, "type", "edge");

	// write edge details
	if (!findInVector(m_alEdgeKeys, lKey))
	{
		// save key
		m_alEdgeKeys.push_back(lKey);

		// begin writting edge detail
		writeObjectBegin(m_fileEdges, m_alEdgeKeys.capacity() == 1);

		// write edge id
		writeLongValue(m_fileEdges, "id", lKey, true);

		// get curve type
		CurveTypeEnum curveType;
		hr = pEdge->get_GeometryType(&curveType);
		if (FAILED(hr)) return hr;

		// get curve geometry
		CComPtr<IDispatch> pCurve;
		hr = pEdge->get_Geometry(&pCurve);
		if (FAILED(hr)) return hr;

		// write curve
		if (curveType == kUnknownCurve) {
			SaveUnknownCurveData(pCurve);
		}
		else if (curveType == kLineCurve) {
			SaveLineCurveData(pCurve);
		}
		else if (curveType == kLineSegmentCurve) {
			SaveLineSegmentCurveData(pCurve);
		}
		else if (curveType == kCircleCurve) {
			SaveCircleCurveData(pCurve);
		}
		else if (curveType == kCircularArcCurve) {
			SaveCircularArcCurveData(pCurve);
		}
		else if (curveType == kEllipseFullCurve) {
			SaveEllipseFullCurveData(pCurve);
		}
		else if (curveType == kEllipticalArcCurve) {
			SaveEllipticalArcCurveData(pCurve);
		}
		else if (curveType == kBSplineCurve) {
			SaveBSplineCurveData(pCurve);
		}
		else if (curveType == kPolylineCurve) {
			SavePolylineCurveData(pCurve);
		}

		// begin writting tessellation
		writeObjectValueBegin(m_fileEdges, "tessellation");

		// write tessellation
		SaveEdgeTessellationData(pEdge);

		// end writting tessellation
		writeObjectValueEnd(m_fileEdges);

		// end writting edge detail
		writeObjectEnd(m_fileEdges);
	}

	// get the edge uses from the edge
	CComPtr<EdgeUses> pEdgeUses;
	hr = pEdge->get_EdgeUses(&pEdgeUses);
	if (FAILED(hr)) return hr;

	// begin writting uses
	writeArrayValueBegin(m_fileTopology, "edgeUses");

	// iterate each edge use
	long useCount = 1;
	CComPtr<EdgeUse> pEdgeUse;
	for (; hr = pEdgeUses->get_Item(useCount, &pEdgeUse) == S_OK; useCount++, pEdgeUse.Release())
	{
		// begin writting edge use
		writeObjectBegin(m_fileTopology, (useCount == 1));

		// write edge use data
		SaveEdgeUseData(pEdgeUse);

		// end writting edge use
		writeObjectEnd(m_fileTopology);
	}

	// end writting uses
	writeArrayValueEnd(m_fileTopology);

	// get start vertex
	CComPtr<Vertex> pVertex;
	hr = pEdge->get_StartVertex(&pVertex);
	if (FAILED(hr)) return hr;	

	// begin writting start vertex
	writeObjectValueBegin(m_fileTopology, "startVertex");

	// write start vertex
	SaveVertexData(pVertex);

	// end writting start vertex
	writeObjectValueEnd(m_fileTopology);

	// get stop vertex
	pVertex.Release();
	hr = pEdge->get_StopVertex(&pVertex);
	if (FAILED(hr)) return hr;

	// begin writting stop vertex
	writeObjectValueBegin(m_fileTopology, "stopVertex");

	// write stop vertex
	SaveVertexData(pVertex);

	// end writting stop vertex
	writeObjectValueEnd(m_fileTopology);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveUnknownCurveData(CComPtr<IDispatch> pCurve)
{
	HRESULT hr;

	// write curve type
	writeLongValue(m_fileEdges, "curveType", kUnknownCurve);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveLineCurveData(CComPtr<IDispatch> pCurve)
{
	HRESULT hr;

	// reinterpret curve
	CComQIPtr<Line> pLine(pCurve);

	// write curve type
	writeLongValue(m_fileEdges, "curveType", kLineCurve);

	// get line definition
	CComSafeArray<double> *pRootPoint;
	pRootPoint = new CComSafeArray<double>;
	CComSafeArray<double> *pDirection;
	pDirection = new CComSafeArray<double>;
	hr = pLine->GetLineData(
		(*pRootPoint).GetSafeArrayPtr(),
		(*pDirection).GetSafeArrayPtr());
	if (FAILED(hr)) return hr;

	// write line root point
	writeArrayValueBegin(m_fileEdges, "rootPoint");
	writeDoubleArrayValue(m_fileEdges, 3, pRootPoint);
	writeArrayValueEnd(m_fileEdges);

	// write line direction
	writeArrayValueBegin(m_fileEdges, "direction");
	writeDoubleArrayValue(m_fileEdges, 3, pDirection);
	writeArrayValueEnd(m_fileEdges);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveLineSegmentCurveData(CComPtr<IDispatch> pCurve)
{
	HRESULT hr;

	// reinterpret curve
	CComQIPtr<LineSegment> pLineSegment(pCurve);

	// write curve type
	writeLongValue(m_fileEdges, "curveType", kLineSegmentCurve);

	// get line segment definition
	CComSafeArray<double> *pStartPoint;
	pStartPoint = new CComSafeArray<double>;
	CComSafeArray<double> *pEndPoint;
	pEndPoint = new CComSafeArray<double>;
	hr = pLineSegment->GetLineSegmentData(
		(*pStartPoint).GetSafeArrayPtr(),
		(*pEndPoint).GetSafeArrayPtr());
	if (FAILED(hr)) return hr;

	// write line segmentstart point
	writeArrayValueBegin(m_fileEdges, "startPoint");
	writeDoubleArrayValue(m_fileEdges, 3, pStartPoint);
	writeArrayValueEnd(m_fileEdges);

	// write line segment end point
	writeArrayValueBegin(m_fileEdges, "endPoint");
	writeDoubleArrayValue(m_fileEdges, 3, pEndPoint);
	writeArrayValueEnd(m_fileEdges);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveCircleCurveData(CComPtr<IDispatch> pCurve)
{
	HRESULT hr;

	// reinterpret curve
	CComQIPtr<Circle> pCircle(pCurve);

	// write curve type
	writeLongValue(m_fileEdges, "curveType", kCircleCurve);

	// get circle definition
	CComSafeArray<double> *pCenter;
	pCenter = new CComSafeArray < double > ;
	CComSafeArray<double> *pAxisVector;
	pAxisVector = new CComSafeArray < double > ;
	double dRadius = 0.0;
	hr = pCircle->GetCircleData(
		(*pCenter).GetSafeArrayPtr(),
		(*pAxisVector).GetSafeArrayPtr(), &dRadius);
	if (FAILED(hr)) return hr;

	// write circle center
	writeArrayValueBegin(m_fileEdges, "center");
	writeDoubleArrayValue(m_fileEdges, 3, pCenter);
	writeArrayValueEnd(m_fileEdges);

	// write circle axis vector
	writeArrayValueBegin(m_fileEdges, "axisVector");
	writeDoubleArrayValue(m_fileEdges, 3, pAxisVector);
	writeArrayValueEnd(m_fileEdges);

	// write circle radius
	writeDoubleValue(m_fileEdges, "radius", dRadius);
	
	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveCircularArcCurveData(CComPtr<IDispatch> pCurve)
{
	HRESULT hr;

	// reinterpret curve
	CComQIPtr<Arc3d> pArc3d(pCurve);

	// write curve type
	writeLongValue(m_fileEdges, "curveType", kCircularArcCurve);

	// get arc3d definition
	CComSafeArray<double> *pCenter;
	pCenter = new CComSafeArray<double>;
	CComSafeArray<double> *pAxisVector;
	pAxisVector = new CComSafeArray<double>;
	CComSafeArray<double> *pRefVector;
	pRefVector = new CComSafeArray<double>;
	double dRadius = 0.0, dStartAngle = 0.0, dSweepAngle = 0.0;
	hr = pArc3d->GetArcData(
		(*pCenter).GetSafeArrayPtr(),
		(*pAxisVector).GetSafeArrayPtr(),
		(*pRefVector).GetSafeArrayPtr(),
		&dRadius, &dStartAngle, &dSweepAngle);
	if (FAILED(hr)) return hr;

	// write arc3d center
	writeArrayValueBegin(m_fileEdges, "center");
	writeDoubleArrayValue(m_fileEdges, 3, pCenter);
	writeArrayValueEnd(m_fileEdges);

	// write arc3d axis vector
	writeArrayValueBegin(m_fileEdges, "axisVector");
	writeDoubleArrayValue(m_fileEdges, 3, pAxisVector);
	writeArrayValueEnd(m_fileEdges);

	// write arc3d ref vector
	writeArrayValueBegin(m_fileEdges, "refVector");
	writeDoubleArrayValue(m_fileEdges, 3, pRefVector);
	writeArrayValueEnd(m_fileEdges);

	// write arc3d radius
	writeDoubleValue(m_fileEdges, "radius", dRadius);

	// write arc3d start angle
	writeDoubleValue(m_fileEdges, "startAngle", dStartAngle);

	// write arc3d sweep angle
	writeDoubleValue(m_fileEdges, "sweepAngle", dSweepAngle);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveEllipseFullCurveData(CComPtr<IDispatch> pCurve)
{
	HRESULT hr;

	// reinterpret curve
	CComQIPtr<EllipseFull> pEllipseFull(pCurve);

	// write curve type
	writeLongValue(m_fileEdges, "curveType", kEllipseFullCurve);

	// get ellipse full definition
	CComSafeArray<double> *pCenter;
	pCenter = new CComSafeArray<double>;
	CComSafeArray<double> *pAxisVector;
	pAxisVector = new CComSafeArray<double>;
	CComSafeArray<double> *pMajorAxis;
	pMajorAxis = new CComSafeArray<double>;
	double dMinorMajorRatio = 0.0;
	hr = pEllipseFull->GetEllipseFullData(
		(*pCenter).GetSafeArrayPtr(),
		(*pAxisVector).GetSafeArrayPtr(),
		(*pMajorAxis).GetSafeArrayPtr(), &dMinorMajorRatio);
	if (FAILED(hr)) return hr;

	// write ellipse full center
	writeArrayValueBegin(m_fileEdges, "center");
	writeDoubleArrayValue(m_fileEdges, 3, pCenter);
	writeArrayValueEnd(m_fileEdges);

	// write ellipse full axis vector
	writeArrayValueBegin(m_fileEdges, "axisVector");
	writeDoubleArrayValue(m_fileEdges, 3, pAxisVector);
	writeArrayValueEnd(m_fileEdges);

	// write ellipse full major axis
	writeArrayValueBegin(m_fileEdges, "majorAxis");
	writeDoubleArrayValue(m_fileEdges, 3, pMajorAxis);
	writeArrayValueEnd(m_fileEdges);

	// write arc3d radius
	writeDoubleValue(m_fileEdges, "minorMajorRatio", dMinorMajorRatio);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveEllipticalArcCurveData(CComPtr<IDispatch> pCurve)
{
	HRESULT hr;

	// reinterpret curve
	CComQIPtr<EllipticalArc> pEllipticalArc(pCurve);

	// write curve type
	writeLongValue(m_fileEdges, "curveType", kEllipticalArcCurve);

	// get elliptical arc definition
	CComSafeArray<double> *pCenter;
	pCenter = new CComSafeArray<double>;
	CComSafeArray<double> *pMajorAxis;
	pMajorAxis = new CComSafeArray<double>;
	CComSafeArray<double> *pMinorAxis;
	pMinorAxis = new CComSafeArray<double>;
	double dMajorRadius = 0.0, dMinorRadius = 0.0;
	double dStartAngle = 0.0, dSweepAngle = 0.0;
	hr = pEllipticalArc->GetEllipticalArcData(
		(*pCenter).GetSafeArrayPtr(),
		(*pMajorAxis).GetSafeArrayPtr(),
		(*pMinorAxis).GetSafeArrayPtr(),
		&dMajorRadius, &dMinorRadius, &dStartAngle, &dSweepAngle);
	if (FAILED(hr)) return hr;

	// write elliptical arc center
	writeArrayValueBegin(m_fileEdges, "center");
	writeDoubleArrayValue(m_fileEdges, 3, pCenter);
	writeArrayValueEnd(m_fileEdges);

	// write elliptical arc major axis
	writeArrayValueBegin(m_fileEdges, "majorAxis");
	writeDoubleArrayValue(m_fileEdges, 3, pMajorAxis);
	writeArrayValueEnd(m_fileEdges);

	// write elliptical arc minor axis
	writeArrayValueBegin(m_fileEdges, "minorAxis");
	writeDoubleArrayValue(m_fileEdges, 3, pMinorAxis);
	writeArrayValueEnd(m_fileEdges);

	// write elliptical arc major radius
	writeDoubleValue(m_fileEdges, "majorRadius", dMajorRadius);

	// write elliptical arc minor radius
	writeDoubleValue(m_fileEdges, "minorRadius", dMinorRadius);

	// write elliptical arc start angle
	writeDoubleValue(m_fileEdges, "startAngle", dStartAngle);

	// write elliptical arc sweep angle
	writeDoubleValue(m_fileEdges, "sweepAngle", dSweepAngle);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveBSplineCurveData(CComPtr<IDispatch> pCurve)
{
	HRESULT hr;

	// reinterpret curve
	CComQIPtr<BSplineCurve> pBSplineCurve(pCurve);

	// write curve type
	writeLongValue(m_fileEdges, "curveType", kBSplineCurve);

	// get bspline curve definition
	long lOrder = 0, lNumPoles = 0, lNumKnots = 0;
	VARIANT_BOOL bIsRational, bIsPeriodic, bIsClosed, bIsPlanar;
	CComSafeArray<double> *pPlaneVector;
	pPlaneVector = new CComSafeArray<double>;
	hr = pBSplineCurve->GetBSplineInfo(
		&lOrder, &lNumPoles, &lNumKnots,
		&bIsRational, &bIsPeriodic, &bIsClosed, &bIsPlanar,
		(*pPlaneVector).GetSafeArrayPtr());
	if (FAILED(hr)) return hr;
	
	// get bspline curve data
	CComSafeArray<double> *pPoles;
	pPoles = new CComSafeArray<double>;
	CComSafeArray<double> *pKnots;
	pKnots = new CComSafeArray<double>;
	CComSafeArray<double> *pWeights;
	pWeights = new CComSafeArray<double>;
	hr = pBSplineCurve->GetBSplineData(
		(*pPoles).GetSafeArrayPtr(),
		(*pKnots).GetSafeArrayPtr(),
		(*pWeights).GetSafeArrayPtr());
	if (FAILED(hr)) return hr;

	// write bspline order
	writeLongValue(m_fileEdges, "order", lOrder);

	// write bspline number of poles
	writeLongValue(m_fileEdges, "numPoles", lNumPoles);

	// write bspline number of knots
	writeLongValue(m_fileEdges, "numKnots", lNumKnots);

	// write bspline rational
	writeBoolValue(m_fileEdges, "isRational", bIsRational);

	// write bspline periodic
	writeBoolValue(m_fileEdges, "isPeriodic", bIsPeriodic);

	// write bspline closed
	writeBoolValue(m_fileEdges, "isClosed", bIsClosed);

	// write bspline planar
	writeBoolValue(m_fileEdges, "isPlanar", bIsPlanar);

	// write the plane vector
	if (bIsPlanar == VARIANT_TRUE)
	{
		writeArrayValueBegin(m_fileEdges, "planeVector");
		writeDoubleArrayValue(m_fileEdges, 3, pPlaneVector);
		writeArrayValueEnd(m_fileEdges);
	}

	// write bspline surface poles
	writeArrayValueBegin(m_fileEdges, "poles");
	writeDoubleArrayValue(m_fileEdges, lNumPoles * 3, pPoles);
	writeArrayValueEnd(m_fileEdges);

	// write bspline surface knots
	writeArrayValueBegin(m_fileEdges, "knots");
	writeDoubleArrayValue(m_fileEdges, lNumKnots, pKnots);
	writeArrayValueEnd(m_fileEdges);

	// write bspline surface weights
	if (bIsRational == VARIANT_TRUE)
	{
		writeArrayValueBegin(m_fileEdges, "weights");
		writeDoubleArrayValue(m_fileEdges, lNumPoles, pWeights);
		writeArrayValueEnd(m_fileEdges);
	}

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SavePolylineCurveData(CComPtr<IDispatch> pCurve)
{
	HRESULT hr;

	// reinterpret curve
	CComQIPtr<Polyline3d> pPolyline3d(pCurve);

	// write curve type
	writeLongValue(m_fileEdges, "curveType", kPolylineCurve);

	// get polyline definition
	long lNumPoints = 0;
	hr = pPolyline3d->get_PointCount(&lNumPoints);
	if (FAILED(hr)) return hr;

	// get polyline data
	CComSafeArray<double> *pPoints;
	pPoints = new CComSafeArray<double>;
	hr = pPolyline3d->GetPoints((*pPoints).GetSafeArrayPtr());
	if (FAILED(hr)) return hr;

	// write polyline number of points
	writeLongValue(m_fileEdges, "numPoints", lNumPoints);

	// write polyline points
	writeArrayValueBegin(m_fileEdges, "points");
	writeDoubleArrayValue(m_fileEdges, lNumPoints * 3, pPoints);
	writeArrayValueEnd(m_fileEdges);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveEdgeTessellationData(CComPtr<Edge> pEdge)
{
	HRESULT hr;

	// get curve geometry
	CComPtr<IDispatch> pCurve;
	hr = pEdge->get_Geometry(&pCurve);
	if (FAILED(hr)) return hr;

	// get curve type
	CurveTypeEnum curveType;
	hr = pEdge->get_GeometryType(&curveType);
	if (FAILED(hr)) return hr;

	// get curve evaluator
	CComPtr<CurveEvaluator> pCurveEvaluator;
	if (curveType == kLineCurve) {
		CComQIPtr<Line> pLine(pCurve);
		hr = pLine->get_Evaluator(&pCurveEvaluator);
	}
	else if (curveType == kLineSegmentCurve) {
		CComQIPtr<LineSegment> pLineSegment(pCurve);
		hr = pLineSegment->get_Evaluator(&pCurveEvaluator);
	}
	else if (curveType == kCircleCurve) {
		CComQIPtr<Circle> pCircle(pCurve);
		hr = pCircle->get_Evaluator(&pCurveEvaluator);
	}
	else if (curveType == kCircularArcCurve) {
		CComQIPtr<Arc3d> pArc3d(pCurve);
		hr = pArc3d->get_Evaluator(&pCurveEvaluator);
	}
	else if (curveType == kEllipseFullCurve) {
		CComQIPtr<EllipseFull> pEllipseFull(pCurve);
		hr = pEllipseFull->get_Evaluator(&pCurveEvaluator);
	}
	else if (curveType == kEllipticalArcCurve) {
		CComQIPtr<EllipticalArc> pEllipticalArc(pCurve);
		hr = pEllipticalArc->get_Evaluator(&pCurveEvaluator);
	}
	else if (curveType == kBSplineCurve) {
		CComQIPtr<BSplineCurve> pBSplineCurve(pCurve);
		hr = pBSplineCurve->get_Evaluator(&pCurveEvaluator);
	}
	else if (curveType == kPolylineCurve) {
		CComQIPtr<Polyline3d> pPolyline3d(pCurve);
		hr = pPolyline3d->get_Evaluator(&pCurveEvaluator);
	}
	if (FAILED(hr)) return hr;

	// get number of tessellation points
	double dMin = 0.0, dMax = 0.0;
	pCurveEvaluator->GetParamExtents(&dMin, &dMax);
	long lVertexCount = 0;
	CComSafeArray<double> *pParams;
	pParams = new CComSafeArray<double>;	
	double dLength = 0.0;
	pCurveEvaluator->GetLengthAtParam(dMin, dMax, &dLength);
	lVertexCount = (long)(dLength / TOLERANCE_GEO);
	lVertexCount = lVertexCount < TESSLLATION_MIN ? TESSLLATION_MIN : lVertexCount;

	// write number of tessellation points
	writeLongValue(m_fileEdges, "vertexCount", lVertexCount, true);

	// sample parameters
	for (long i = 0; i < lVertexCount; i++) {
		(*pParams).Add(dMin + (dMax - dMin) * i / (lVertexCount - 1));
	}

	// calcualate points at params
	CComSafeArray<double> *pPoints;
	pPoints = new CComSafeArray<double>;
	pCurveEvaluator->GetPointAtParam((*pParams).GetSafeArrayPtr(), (*pPoints).GetSafeArrayPtr());

	// write tessellation points
	writeArrayValueBegin(m_fileEdges, "points");
	writeDoubleArrayValue(m_fileEdges, lVertexCount * 3, pPoints);
	writeArrayValueEnd(m_fileEdges);
	
	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveEdgeUseData(CComPtr<EdgeUse> pEdgeUse)
{
	HRESULT hr;

	// write edge use id
	long lKey = 0;
	pEdgeUse->get_TransientKey(&lKey);
	writeLongValue(m_fileTopology, "id", lKey, true);

	// write edge use type
	writeStringValue(m_fileTopology, "type", "edgeUse");
	
	// write edge use details
	if (!findInVector(m_alEdgeUseKeys, lKey))
	{
		// save key
		m_alEdgeUseKeys.push_back(lKey);

		// begin writting edge use detail
		writeObjectBegin(m_fileEdgeUses, m_alEdgeUseKeys.capacity() == 1);

		// write edge use id
		writeLongValue(m_fileEdgeUses, "id", lKey, true);

		// get curve type
		Curve2dTypeEnum curveType;
		hr = pEdgeUse->get_CurveType(&curveType);
		if (FAILED(hr)) return hr;

		// get curve geometry
		CComPtr<IDispatch> pCurve2d;
		hr = pEdgeUse->get_Geometry(&pCurve2d);
		if (FAILED(hr)) return hr;

		// write curve GEO_2D data
		if (curveType == kUnknownCurve2d) {
			SaveUnknownCurve2dData(pCurve2d);
		}
		else if (curveType == kLineCurve2d) {
			SaveLineCurve2dData(pCurve2d);
		}
		else if (curveType == kLineSegmentCurve2d) {
			SaveLineSegmentCurve2dData(pCurve2d);
		}
		else if (curveType == kCircularArcCurve2d) {
			SaveCircularArcCurve2dData(pCurve2d);
		}
		else if (curveType == kEllipseFullCurve2d) {
			SaveEllipseFullCurve2dData(pCurve2d);
		}
		else if (curveType == kEllipticalArcCurve2d) {
			SaveEllipticalArcCurve2dData(pCurve2d);
		}
		else if (curveType == kBSplineCurve2d) {
			SaveBSplineCurve2dData(pCurve2d);
		}
		else if (curveType == kPolylineCurve2d) {
			SavePolylineCurve2dData(pCurve2d);
		}

		// begin writting tessellation
		writeObjectValueBegin(m_fileEdgeUses, "tessellation");

		// write tessellation
		SaveEdgeUseTessellationData(pEdgeUse);

		// end writting tessellation
		writeObjectValueEnd(m_fileEdgeUses);

		// end writting edge use details
		writeObjectEnd(m_fileEdgeUses);
	}

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveUnknownCurve2dData(CComPtr<IDispatch> pCurve2d)
{
	HRESULT hr;

	// write curve type
	writeLongValue(m_fileEdgeUses, "curveType", kUnknownCurve2d);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveLineCurve2dData(CComPtr<IDispatch> pCurve2d)
{
	HRESULT hr;

	// reinterpret curve
	CComQIPtr<Line2d> pLine2d(pCurve2d);

	// write curve type
	writeLongValue(m_fileEdgeUses, "curveType", kLineCurve2d);

	// get line definition
	CComSafeArray<double> *pRootPoint;
	pRootPoint = new CComSafeArray<double>;
	CComSafeArray<double> *pDirection;
	pDirection = new CComSafeArray<double>;
	hr = pLine2d->GetLineData(
		(*pRootPoint).GetSafeArrayPtr(),
		(*pDirection).GetSafeArrayPtr());
	if (FAILED(hr)) return hr;

	// write line root point
	writeArrayValueBegin(m_fileEdgeUses, "rootPoint");
	writeDoubleArrayValue(m_fileEdgeUses, 2, pRootPoint);
	writeArrayValueEnd(m_fileEdgeUses);

	// write line direction
	writeArrayValueBegin(m_fileEdgeUses, "direction");
	writeDoubleArrayValue(m_fileEdgeUses, 2, pDirection);
	writeArrayValueEnd(m_fileEdgeUses);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveLineSegmentCurve2dData(CComPtr<IDispatch> pCurve2d)
{
	HRESULT hr;

	// reinterpret curve
	CComQIPtr<LineSegment2d> pLineSegment2d(pCurve2d);

	// write curve type
	writeLongValue(m_fileEdgeUses, "curveType", kLineSegmentCurve2d);

	// get line segment definition
	CComSafeArray<double> *pStartPoint;
	pStartPoint = new CComSafeArray<double>;
	CComSafeArray<double> *pEndPoint;
	pEndPoint = new CComSafeArray<double>;
	hr = pLineSegment2d->GetLineSegmentData(
		(*pStartPoint).GetSafeArrayPtr(),
		(*pEndPoint).GetSafeArrayPtr());
	if (FAILED(hr)) return hr;

	// write line segmentstart point
	writeArrayValueBegin(m_fileEdgeUses, "startPoint");
	writeDoubleArrayValue(m_fileEdgeUses, 2, pStartPoint);
	writeArrayValueEnd(m_fileEdgeUses);

	// write line segment end point
	writeArrayValueBegin(m_fileEdgeUses, "endPoint");
	writeDoubleArrayValue(m_fileEdgeUses, 2, pEndPoint);
	writeArrayValueEnd(m_fileEdgeUses);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveCircleCurve2dData(CComPtr<IDispatch> pCurve2d)
{
	HRESULT hr;

	// reinterpret curve
	CComQIPtr<Circle2d> pCircle2d(pCurve2d);

	// write curve type
	writeLongValue(m_fileEdgeUses, "curveType", kCircleCurve2d);

	// get circle definition
	CComSafeArray<double> *pCenter;
	pCenter = new CComSafeArray<double>;
	double dRadius = 0.0;
	hr = pCircle2d->GetCircleData((*pCenter).GetSafeArrayPtr(), &dRadius);
	if (FAILED(hr)) return hr;

	// write circle center
	writeArrayValueBegin(m_fileEdgeUses, "center");
	writeDoubleArrayValue(m_fileEdgeUses, 2, pCenter);
	writeArrayValueEnd(m_fileEdgeUses);

	// write circle radius
	writeDoubleValue(m_fileEdgeUses, "radius", dRadius);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveCircularArcCurve2dData(CComPtr<IDispatch> pCurve2d)
{
	HRESULT hr;

	// reinterpret curve
	CComQIPtr<Arc2d> pArc2d(pCurve2d);

	// write curve type
	writeLongValue(m_fileEdgeUses, "curveType", kCircularArcCurve2d);

	// get arc3d definition
	CComSafeArray<double> *pCenter;
	pCenter = new CComSafeArray<double>;
	double dRadius = 0.0, dStartAngle = 0.0, dSweepAngle = 0.0;
	hr = pArc2d->GetArcData(
		(*pCenter).GetSafeArrayPtr(),
		&dRadius, &dStartAngle, &dSweepAngle);
	if (FAILED(hr)) return hr;

	// write arc3d center
	writeArrayValueBegin(m_fileEdgeUses, "center");
	writeDoubleArrayValue(m_fileEdgeUses, 2, pCenter);
	writeArrayValueEnd(m_fileEdgeUses);

	// write arc3d radius
	writeDoubleValue(m_fileEdgeUses, "radius", dRadius);

	// write arc3d start angle
	writeDoubleValue(m_fileEdgeUses, "startAngle", dStartAngle);

	// write arc3d sweep angle
	writeDoubleValue(m_fileEdgeUses, "sweepAngle", dSweepAngle);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveEllipseFullCurve2dData(CComPtr<IDispatch> pCurve2d)
{
	HRESULT hr;

	// reinterpret curve
	CComQIPtr<EllipseFull2d> pEllipseFull2d(pCurve2d);

	// write curve type
	writeLongValue(m_fileEdgeUses, "curveType", kEllipseFullCurve2d);

	// get ellipse full definition
	CComSafeArray<double> *pCenter;
	pCenter = new CComSafeArray<double>;
	CComSafeArray<double> *pMajorAxis;
	pMajorAxis = new CComSafeArray<double>;
	double dMinorMajorRatio = 0.0;
	hr = pEllipseFull2d->GetEllipseFullData(
		(*pCenter).GetSafeArrayPtr(),
		(*pMajorAxis).GetSafeArrayPtr(), &dMinorMajorRatio);
	if (FAILED(hr)) return hr;

	// write ellipse full center
	writeArrayValueBegin(m_fileEdgeUses, "center");
	writeDoubleArrayValue(m_fileEdgeUses, 2, pCenter);
	writeArrayValueEnd(m_fileEdgeUses);

	// write ellipse full major axis
	writeArrayValueBegin(m_fileEdgeUses, "majorAxis");
	writeDoubleArrayValue(m_fileEdgeUses, 2, pMajorAxis);
	writeArrayValueEnd(m_fileEdgeUses);

	// write arc3d radius
	writeDoubleValue(m_fileEdgeUses, "minorMajorRatio", dMinorMajorRatio);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveEllipticalArcCurve2dData(CComPtr<IDispatch> pCurve2d)
{
	HRESULT hr;

	// reinterpret curve
	CComQIPtr<EllipticalArc2d> pEllipticalArc2d(pCurve2d);

	// write curve type
	writeLongValue(m_fileEdgeUses, "curveType", kEllipticalArcCurve2d);

	// get elliptical arc definition
	CComSafeArray<double> *pCenter;
	pCenter = new CComSafeArray<double>;
	CComSafeArray<double> *pMajorAxis;
	pMajorAxis = new CComSafeArray<double>;
	double dMajorRadius = 0.0, dMinorRadius = 0.0;
	double dStartAngle = 0.0, dSweepAngle = 0.0;
	hr = pEllipticalArc2d->GetEllipticalArcData(
		(*pCenter).GetSafeArrayPtr(),
		(*pMajorAxis).GetSafeArrayPtr(),
		&dMajorRadius, &dMinorRadius, &dStartAngle, &dSweepAngle);
	if (FAILED(hr)) return hr;

	// write elliptical arc center
	writeArrayValueBegin(m_fileEdgeUses, "center");
	writeDoubleArrayValue(m_fileEdgeUses, 2, pCenter);
	writeArrayValueEnd(m_fileEdgeUses);

	// write elliptical arc major axis
	writeArrayValueBegin(m_fileEdgeUses, "majorAxis");
	writeDoubleArrayValue(m_fileEdgeUses, 2, pMajorAxis);
	writeArrayValueEnd(m_fileEdgeUses);

	// write elliptical arc major radius
	writeDoubleValue(m_fileEdgeUses, "majorRadius", dMajorRadius);

	// write elliptical arc minor radius
	writeDoubleValue(m_fileEdgeUses, "minorRadius", dMinorRadius);

	// write elliptical arc start angle
	writeDoubleValue(m_fileEdgeUses, "startAngle", dStartAngle);

	// write elliptical arc sweep angle
	writeDoubleValue(m_fileEdgeUses, "sweepAngle", dSweepAngle);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveBSplineCurve2dData(CComPtr<IDispatch> pCurve2d)
{
	HRESULT hr;

	// reinterpret curve
	CComQIPtr<BSplineCurve2d> pBSplineCurve2d(pCurve2d);

	// write curve type
	writeLongValue(m_fileEdgeUses, "curveType", kBSplineCurve2d);

	// get bspline curve definition
	long lOrder = 0, lNumPoles = 0, lNumKnots = 0;
	VARIANT_BOOL bIsRational, bIsPeriodic, bIsClosed, bIsPlanar;
	CComSafeArray<double> *pPlaneVector;
	pPlaneVector = new CComSafeArray<double>;
	hr = pBSplineCurve2d->GetBSplineInfo(
		&lOrder, &lNumPoles, &lNumKnots,
		&bIsRational, &bIsPeriodic, &bIsClosed);
	if (FAILED(hr)) return hr;

	// get bspline curve data
	CComSafeArray<double> *pPoles;
	pPoles = new CComSafeArray<double>;
	CComSafeArray<double> *pKnots;
	pKnots = new CComSafeArray<double>;
	CComSafeArray<double> *pWeights;
	pWeights = new CComSafeArray<double>;
	hr = pBSplineCurve2d->GetBSplineData(
		(*pPoles).GetSafeArrayPtr(),
		(*pKnots).GetSafeArrayPtr(),
		(*pWeights).GetSafeArrayPtr());
	if (FAILED(hr)) return hr;

	// write bspline order
	writeLongValue(m_fileEdgeUses, "order", lOrder);

	// write bspline number of poles
	writeLongValue(m_fileEdgeUses, "numPoles", lNumPoles);

	// write bspline number of knots
	writeLongValue(m_fileEdgeUses, "numKnots", lNumKnots);

	// write bspline rational
	writeBoolValue(m_fileEdgeUses, "isRational", bIsRational);

	// write bspline periodic
	writeBoolValue(m_fileEdgeUses, "isPeriodic", bIsPeriodic);

	// write bspline closed
	writeBoolValue(m_fileEdgeUses, "isClosed", bIsClosed);

	// write bspline surface poles
	writeArrayValueBegin(m_fileEdgeUses, "poles");
	writeDoubleArrayValue(m_fileEdgeUses, lNumPoles * 2, pPoles);
	writeArrayValueEnd(m_fileEdgeUses);

	// write bspline surface knots
	writeArrayValueBegin(m_fileEdgeUses, "knots");
	writeDoubleArrayValue(m_fileEdgeUses, lNumKnots, pKnots);
	writeArrayValueEnd(m_fileEdgeUses);

	// write bspline surface weights
	if (bIsRational == VARIANT_TRUE)
	{
		writeArrayValueBegin(m_fileEdgeUses, "weights");
		writeDoubleArrayValue(m_fileEdgeUses, lNumPoles, pWeights);
		writeArrayValueEnd(m_fileEdgeUses);
	}

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SavePolylineCurve2dData(CComPtr<IDispatch> pCurve2d)
{
	HRESULT hr;

	// reinterpret curve
	CComQIPtr<Polyline2d> pPolyline2d(pCurve2d);

	// write curve type
	writeLongValue(m_fileEdgeUses, "curveType", kPolylineCurve2d);

	// get polyline definition
	long lNumPoints = 0;
	hr = pPolyline2d->get_PointCount(&lNumPoints);
	if (FAILED(hr)) return hr;

	// get polyline data
	CComSafeArray<double> *pPoints;
	pPoints = new CComSafeArray<double>;
	hr = pPolyline2d->GetPoints((*pPoints).GetSafeArrayPtr());
	if (FAILED(hr)) return hr;

	// write polyline number of points
	writeLongValue(m_fileEdgeUses, "numPoints", lNumPoints);

	// write polyline points
	writeArrayValueBegin(m_fileEdgeUses, "points");
	writeDoubleArrayValue(m_fileEdgeUses, lNumPoints * 2, pPoints);
	writeArrayValueEnd(m_fileEdgeUses);

	return S_OK;
}

STDMETHODIMP CExportPartCommandButton::SaveEdgeUseTessellationData(CComPtr<EdgeUse> pEdgeUse)
{
	HRESULT hr;

	// get curve geometry
	CComPtr<IDispatch> pCurve2d;
	hr = pEdgeUse->get_Geometry(&pCurve2d);
	if (FAILED(hr)) return hr;

	// get curve type
	Curve2dTypeEnum curveType;
	hr = pEdgeUse->get_CurveType(&curveType);
	if (FAILED(hr)) return hr;

	// get curve evaluator
	CComPtr<Curve2dEvaluator> pCurve2dEvaluator;
	if (curveType == kLineCurve2d) {
		CComQIPtr<Line2d> pLine2d(pCurve2d);
		hr = pLine2d->get_Evaluator(&pCurve2dEvaluator);
	}
	else if (curveType == kLineSegmentCurve2d) {
		CComQIPtr<LineSegment2d> pLineSegment2d(pCurve2d);
		hr = pLineSegment2d->get_Evaluator(&pCurve2dEvaluator);
	}
	else if (curveType == kCircleCurve2d) {
		CComQIPtr<Circle2d> pCircle2d(pCurve2d);
		hr = pCircle2d->get_Evaluator(&pCurve2dEvaluator);
	}
	else if (curveType == kCircularArcCurve2d) {
		CComQIPtr<Arc2d> pArc2d(pCurve2d);
		hr = pArc2d->get_Evaluator(&pCurve2dEvaluator);
	}
	else if (curveType == kEllipseFullCurve2d) {
		CComQIPtr<EllipseFull2d> pEllipseFull2d(pCurve2d);
		hr = pEllipseFull2d->get_Evaluator(&pCurve2dEvaluator);
	}
	else if (curveType == kEllipticalArcCurve2d) {
		CComQIPtr<EllipticalArc2d> pEllipticalArc2d(pCurve2d);
		hr = pEllipticalArc2d->get_Evaluator(&pCurve2dEvaluator);
	}
	else if (curveType == kBSplineCurve2d) {
		CComQIPtr<BSplineCurve2d> pBSplineCurve2d(pCurve2d);
		hr = pBSplineCurve2d->get_Evaluator(&pCurve2dEvaluator);
	}
	else if (curveType == kPolylineCurve2d) {
		CComQIPtr<Polyline2d> pPolyline2d(pCurve2d);
		hr = pPolyline2d->get_Evaluator(&pCurve2dEvaluator);
	}
	if (FAILED(hr)) return hr;

	// tessellate curve
	double dMin = 0.0, dMax = 0.0;
	pCurve2dEvaluator->GetParamExtents(&dMin, &dMax);
	long lVertexCount = 0;
	CComSafeArray<double> *pVertexCoordinates;
	pVertexCoordinates = new CComSafeArray<double>;
	pCurve2dEvaluator->GetStrokes(dMin, dMax, TOLERANCE_GEO, &lVertexCount, pVertexCoordinates->GetSafeArrayPtr());

	// write number of tessellation points
	writeLongValue(m_fileEdgeUses, "vertexCount", lVertexCount, true);

	// write tessellation points
	writeArrayValueBegin(m_fileEdgeUses, "vertexCoordinates");
	writeDoubleArrayValue(m_fileEdgeUses, lVertexCount * 2, pVertexCoordinates);
	writeArrayValueEnd(m_fileEdgeUses);

	return S_OK;

}

STDMETHODIMP CExportPartCommandButton::SaveVertexData(CComPtr<Vertex> pVertex)
{
	HRESULT hr;

	// write vertex id
	long lKey = 0;
	pVertex->get_TransientKey(&lKey);
	writeLongValue(m_fileTopology, "id", lKey, true);
	
	// write vertex type
	writeStringValue(m_fileTopology, "type", "vertex");
	
	// write vertex details
	if (!findInVector(m_alVertexKeys, lKey))
	{
		// save key
		m_alVertexKeys.push_back(lKey);

		// begin writting vertex detail
		writeObjectBegin(m_fileVertices, m_alVertexKeys.capacity() == 1);

		// write vertex id
		writeLongValue(m_fileVertices, "id", lKey, true);

		// get vertex coordinates
		CComSafeArray<double> *pPoint;
		pPoint = new CComSafeArray<double>;
		hr = pVertex->GetPoint((*pPoint).GetSafeArrayPtr());
		if (FAILED(hr)) return hr;

		// write vertex point
		writeArrayValueBegin(m_fileVertices, "point");
		writeDoubleArrayValue(m_fileVertices, 3, pPoint);
		writeArrayValueEnd(m_fileVertices);

		// end writting vertex detail
		writeObjectEnd(m_fileVertices);
	}

	return S_OK;
}