

/* this ALWAYS GENERATED file contains the definitions for the interfaces */


 /* File created by MIDL compiler version 8.00.0603 */
/* at Mon Mar 09 22:29:12 2015
 */
/* Compiler settings for visPlayerAddIn.idl:
    Oicf, W1, Zp8, env=Win64 (32b run), target_arch=AMD64 8.00.0603 
    protocol : dce , ms_ext, c_ext, robust
    error checks: allocation ref bounds_check enum stub_data 
    VC __declspec() decoration level: 
         __declspec(uuid()), __declspec(selectany), __declspec(novtable)
         DECLSPEC_UUID(), MIDL_INTERFACE()
*/
/* @@MIDL_FILE_HEADING(  ) */

#pragma warning( disable: 4049 )  /* more than 64k source lines */


/* verify that the <rpcndr.h> version is high enough to compile this file*/
#ifndef __REQUIRED_RPCNDR_H_VERSION__
#define __REQUIRED_RPCNDR_H_VERSION__ 475
#endif

#include "rpc.h"
#include "rpcndr.h"

#ifndef __RPCNDR_H_VERSION__
#error this stub requires an updated version of <rpcndr.h>
#endif // __RPCNDR_H_VERSION__

#ifndef COM_NO_WINDOWS_H
#include "windows.h"
#include "ole2.h"
#endif /*COM_NO_WINDOWS_H*/

#ifndef __visPlayerAddIn_h__
#define __visPlayerAddIn_h__

#if defined(_MSC_VER) && (_MSC_VER >= 1020)
#pragma once
#endif

/* Forward Declarations */ 

#ifndef __IvisPlayerAddInServer_FWD_DEFINED__
#define __IvisPlayerAddInServer_FWD_DEFINED__
typedef interface IvisPlayerAddInServer IvisPlayerAddInServer;

#endif 	/* __IvisPlayerAddInServer_FWD_DEFINED__ */


#ifndef __visPlayerAddInServer_FWD_DEFINED__
#define __visPlayerAddInServer_FWD_DEFINED__

#ifdef __cplusplus
typedef class visPlayerAddInServer visPlayerAddInServer;
#else
typedef struct visPlayerAddInServer visPlayerAddInServer;
#endif /* __cplusplus */

#endif 	/* __visPlayerAddInServer_FWD_DEFINED__ */


/* header files for imported files */
#include "oaidl.h"
#include "ocidl.h"

#ifdef __cplusplus
extern "C"{
#endif 


#ifndef __IvisPlayerAddInServer_INTERFACE_DEFINED__
#define __IvisPlayerAddInServer_INTERFACE_DEFINED__

/* interface IvisPlayerAddInServer */
/* [unique][helpstring][dual][uuid][object] */ 


EXTERN_C const IID IID_IvisPlayerAddInServer;

#if defined(__cplusplus) && !defined(CINTERFACE)
    
    MIDL_INTERFACE("44AEB2E5-3077-4560-B202-234A4DCE9EB5")
    IvisPlayerAddInServer : public IDispatch
    {
    public:
        virtual /* [helpstring][id] */ HRESULT STDMETHODCALLTYPE Activate( 
            /* [in] */ IDispatch *pDisp,
            /* [in] */ VARIANT_BOOL FirstTime) = 0;
        
        virtual /* [helpstring][id] */ HRESULT STDMETHODCALLTYPE Deactivate( void) = 0;
        
        virtual /* [helpstring][id] */ HRESULT STDMETHODCALLTYPE ExecuteCommand( 
            /* [in] */ long CommandId) = 0;
        
        virtual /* [helpstring][id][propget] */ HRESULT STDMETHODCALLTYPE get_Automation( 
            /* [retval][out] */ IDispatch **ppResult) = 0;
        
    };
    
    
#else 	/* C style interface */

    typedef struct IvisPlayerAddInServerVtbl
    {
        BEGIN_INTERFACE
        
        HRESULT ( STDMETHODCALLTYPE *QueryInterface )( 
            IvisPlayerAddInServer * This,
            /* [in] */ REFIID riid,
            /* [annotation][iid_is][out] */ 
            _COM_Outptr_  void **ppvObject);
        
        ULONG ( STDMETHODCALLTYPE *AddRef )( 
            IvisPlayerAddInServer * This);
        
        ULONG ( STDMETHODCALLTYPE *Release )( 
            IvisPlayerAddInServer * This);
        
        HRESULT ( STDMETHODCALLTYPE *GetTypeInfoCount )( 
            IvisPlayerAddInServer * This,
            /* [out] */ UINT *pctinfo);
        
        HRESULT ( STDMETHODCALLTYPE *GetTypeInfo )( 
            IvisPlayerAddInServer * This,
            /* [in] */ UINT iTInfo,
            /* [in] */ LCID lcid,
            /* [out] */ ITypeInfo **ppTInfo);
        
        HRESULT ( STDMETHODCALLTYPE *GetIDsOfNames )( 
            IvisPlayerAddInServer * This,
            /* [in] */ REFIID riid,
            /* [size_is][in] */ LPOLESTR *rgszNames,
            /* [range][in] */ UINT cNames,
            /* [in] */ LCID lcid,
            /* [size_is][out] */ DISPID *rgDispId);
        
        /* [local] */ HRESULT ( STDMETHODCALLTYPE *Invoke )( 
            IvisPlayerAddInServer * This,
            /* [annotation][in] */ 
            _In_  DISPID dispIdMember,
            /* [annotation][in] */ 
            _In_  REFIID riid,
            /* [annotation][in] */ 
            _In_  LCID lcid,
            /* [annotation][in] */ 
            _In_  WORD wFlags,
            /* [annotation][out][in] */ 
            _In_  DISPPARAMS *pDispParams,
            /* [annotation][out] */ 
            _Out_opt_  VARIANT *pVarResult,
            /* [annotation][out] */ 
            _Out_opt_  EXCEPINFO *pExcepInfo,
            /* [annotation][out] */ 
            _Out_opt_  UINT *puArgErr);
        
        /* [helpstring][id] */ HRESULT ( STDMETHODCALLTYPE *Activate )( 
            IvisPlayerAddInServer * This,
            /* [in] */ IDispatch *pDisp,
            /* [in] */ VARIANT_BOOL FirstTime);
        
        /* [helpstring][id] */ HRESULT ( STDMETHODCALLTYPE *Deactivate )( 
            IvisPlayerAddInServer * This);
        
        /* [helpstring][id] */ HRESULT ( STDMETHODCALLTYPE *ExecuteCommand )( 
            IvisPlayerAddInServer * This,
            /* [in] */ long CommandId);
        
        /* [helpstring][id][propget] */ HRESULT ( STDMETHODCALLTYPE *get_Automation )( 
            IvisPlayerAddInServer * This,
            /* [retval][out] */ IDispatch **ppResult);
        
        END_INTERFACE
    } IvisPlayerAddInServerVtbl;

    interface IvisPlayerAddInServer
    {
        CONST_VTBL struct IvisPlayerAddInServerVtbl *lpVtbl;
    };

    

#ifdef COBJMACROS


#define IvisPlayerAddInServer_QueryInterface(This,riid,ppvObject)	\
    ( (This)->lpVtbl -> QueryInterface(This,riid,ppvObject) ) 

#define IvisPlayerAddInServer_AddRef(This)	\
    ( (This)->lpVtbl -> AddRef(This) ) 

#define IvisPlayerAddInServer_Release(This)	\
    ( (This)->lpVtbl -> Release(This) ) 


#define IvisPlayerAddInServer_GetTypeInfoCount(This,pctinfo)	\
    ( (This)->lpVtbl -> GetTypeInfoCount(This,pctinfo) ) 

#define IvisPlayerAddInServer_GetTypeInfo(This,iTInfo,lcid,ppTInfo)	\
    ( (This)->lpVtbl -> GetTypeInfo(This,iTInfo,lcid,ppTInfo) ) 

#define IvisPlayerAddInServer_GetIDsOfNames(This,riid,rgszNames,cNames,lcid,rgDispId)	\
    ( (This)->lpVtbl -> GetIDsOfNames(This,riid,rgszNames,cNames,lcid,rgDispId) ) 

#define IvisPlayerAddInServer_Invoke(This,dispIdMember,riid,lcid,wFlags,pDispParams,pVarResult,pExcepInfo,puArgErr)	\
    ( (This)->lpVtbl -> Invoke(This,dispIdMember,riid,lcid,wFlags,pDispParams,pVarResult,pExcepInfo,puArgErr) ) 


#define IvisPlayerAddInServer_Activate(This,pDisp,FirstTime)	\
    ( (This)->lpVtbl -> Activate(This,pDisp,FirstTime) ) 

#define IvisPlayerAddInServer_Deactivate(This)	\
    ( (This)->lpVtbl -> Deactivate(This) ) 

#define IvisPlayerAddInServer_ExecuteCommand(This,CommandId)	\
    ( (This)->lpVtbl -> ExecuteCommand(This,CommandId) ) 

#define IvisPlayerAddInServer_get_Automation(This,ppResult)	\
    ( (This)->lpVtbl -> get_Automation(This,ppResult) ) 

#endif /* COBJMACROS */


#endif 	/* C style interface */




#endif 	/* __IvisPlayerAddInServer_INTERFACE_DEFINED__ */



#ifndef __visPlayerAddInLib_LIBRARY_DEFINED__
#define __visPlayerAddInLib_LIBRARY_DEFINED__

/* library visPlayerAddInLib */
/* [helpstring][version][uuid] */ 


EXTERN_C const IID LIBID_visPlayerAddInLib;

EXTERN_C const CLSID CLSID_visPlayerAddInServer;

#ifdef __cplusplus

class DECLSPEC_UUID("4C9D1FBB-6E63-4437-9643-15C94A5DB053")
visPlayerAddInServer;
#endif
#endif /* __visPlayerAddInLib_LIBRARY_DEFINED__ */

/* Additional Prototypes for ALL interfaces */

/* end of Additional Prototypes */

#ifdef __cplusplus
}
#endif

#endif


