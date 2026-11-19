import React,{memo} from 'react';

// Keep the decoded notebook element isolated from focus clocks and sync updates.
// Changing the source (explicit refresh/date change) still updates immediately.
const NotebookMedia=memo(function NotebookMedia({source,label,pdfHeight='70vh'}:{source:string;label:string;pdfHeight?:string}){
 return source.startsWith('data:application/pdf')
  ? <iframe title={`${label} PDF`} src={source} style={{width:'100%',height:pdfHeight,border:0,display:'block',background:'#071e2d'}}/>
  : <img src={source} alt={label} style={{width:'100%',height:'auto',display:'block',background:'#071e2d'}}/>;
});
export default NotebookMedia;
