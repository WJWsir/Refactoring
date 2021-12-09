let plays = require('./plays.json');
let invoices = require('./invoices.json');
//console.log(plays);
//console.log(invoices);

let invoiceOfBigCo = invoices.find(invoice => invoice.customer == "BigCo");
//console.log(invoiceOfBigCo);

testFunction();

function testFunction(){
    statement(invoiceOfBigCo, plays);
}

function statement(invoice, plays) {
    console.log(invoice);
    console.log(plays);
}