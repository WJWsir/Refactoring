let plays = require("./plays.json");
let invoices = require("./invoices.json");
//console.log(plays);
//console.log(invoices);

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
	let result = statement(invoiceOfBigCo, plays);
	console.log(result);
}

function statement(invoice, plays) {
	//console.log(invoice);
	//console.log(plays);
	let totalAmout = 0;
	let volumeCredits = 0;
	let result = `Statement for ${invoice.customer}\n`;
	const format = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
	}).format;
	for (let perf of invoice.performances) {
		const play = plays[perf.playID];
		let thisAmount = amountFor(perf, play);
		// add volume credits
		volumeCredits += Math.max(perf.audience - 30, 0);
		// add extra credit for every ten comedy attendees
		if ("comedy" == play.type)
			volumeCredits += Math.floor(perf.audience / 5);

		// print line for this order
		result += ` ${play.name}: ${format(thisAmount / 100)} (${
			perf.audience
		} seats)\n`;
		totalAmout += thisAmount;
	}
	result += `Amount owed is ${format(totalAmout / 100)}\n`;
	result += `You earned ${volumeCredits} credits\n`;
	return result;

	function amountFor(perf, play) {
		let thisAmount = 0;

		switch (play.type) {
			case "tragedy":
				thisAmount = 40000;
				if (perf.audience > 30) {
					thisAmount += 1000 * (perf.audience - 30);
				}
				break;
			case "comedy":
				thisAmount = 30000;
				if (perf.audience > 20) {
					thisAmount += 10000 + 500 * (perf.audience - 20);
				}
				thisAmount += 300 * perf.audience;
				break;
			default:
				throw new Error(`unknown type: ${play.type}`);
		}

		return thisAmount;
	}
}
