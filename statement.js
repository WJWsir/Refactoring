let plays = require("./plays.json");
let invoices = require("./invoices.json");
let createStatementData = require("./createStatementData.js");

testFunction();

function testFunction() {
	testsuite_statement();
}

function testsuite_statement() {
	testcase_statement();
}

function testcase_statement() {
	let invoiceOfBigCo = invoices.find(
		(invoice) => invoice.customer == "BigCo"
	);
	let result = htmlStatement(invoiceOfBigCo, plays);
	console.log(result);
}

function statement(invoice, plays){
    return renderPlainText(createStatementData(invoice, plays));
}

function renderPlainText(data, plays) {
	//console.log(invoice);
	//console.log(plays);
	let result = `Statement for ${data.customer}\n`;
	for (let perf of data.performances) {

		// print line for this order
		result += ` ${perf.play.name}: ${usd(perf.amount / 100)} (${
			perf.audience
		} seats)\n`;
	}
	result += `Amount owed is ${usd(data.totalAmount / 100)}\n`;
	result += `You earned ${data.totalVolumeCredits} credits\n`;
	return result;

}

function htmlStatement(invoice, plays) {
	return renderHtml(createStatementData(invoice, plays));
}

function renderHtml(data) {
	let result = `<h1>Statement for ${data.customer}</h1>\n`;
	result += "<table>\n";
	result += "<tr><th>play</th><th>seats</th><th>cost</th></tr>";
	for (let perf of data.performances) {
		result += ` <tr><td>${perf.play.name}</td><td>${perf.audience}</td>`;
		result += ` <td>${usd( perf.amount / 100 )}</td></tr>\n`;
	}
	result += "</table>\n";
	result += `<p>Amount owed is <em> ${usd(data.totalAmount / 100)}</em></p>\n`;
	result += `<p>You earned <em>${data.totalVolumeCredits}</em> credits</p>\n`;
	return result;
}

function usd(aNumber){
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
	}).format(aNumber);
}
