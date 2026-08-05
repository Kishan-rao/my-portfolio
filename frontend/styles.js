$(function(){
$('#printResume').on('click', function(){
window.print();
});


$('#downloadVCard').on('click', function(){
// create a simple vCard and trigger download
const vcard = [
'BEGIN:VCARD',
'VERSION:3.0',
'N:Rao;Y Kishan',
'FN:Y Kishan Rao',
'TEL;TYPE=CELL:8095233582',
'ADR:;;340, Sanjeevini Nivas;;;;',
'ORG:JSSATEB;CSE',
'END:VCARD'
].join('\r\n');


const blob = new Blob([vcard], {type: 'text/vcard'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'Y_Kishan_Rao.vcf';
document.body.appendChild(a);
a.click();
a.remove();
URL.revokeObjectURL(url);
});
});