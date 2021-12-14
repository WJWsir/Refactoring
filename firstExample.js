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
	let result = `Statement for ${invoice.customer}\n`;
	for (let perf of invoice.performances) {

		// print line for this order
		result += ` ${playFor(perf).name}: ${usd(amountFor(perf) / 100)} (${
			perf.audience
		} seats)\n`;
	}
	result += `Amount owed is ${usd(totalAmount() / 100)}\n`;
	result += `You earned ${totalVolumeCredits()} credits\n`;
	return result;

	function amountFor(aPerformance) {
		let result = 0;

		switch (playFor(aPerformance).type) {
			case "tragedy":
				result = 40000;
				if (aPerformance.audience > 30) {
					result += 1000 * (aPerformance.audience - 30);
				}
				break;
			case "comedy":
				result = 30000;
				if (aPerformance.audience > 20) {
					result += 10000 + 500 * (aPerformance.audience - 20);
				}
				result += 300 * aPerformance.audience;
				break;
			default:
				throw new Error(`unknown type: ${playFor(aPerformance).type}`);
		}

		return result;
	}

    function playFor(perf){

        return plays[perf.playID];
    }

    function volumeCreditsFor(aPerformance){
        let result = 0;
		result += Math.max(aPerformance.audience - 30, 0);
		if ("comedy" == playFor(aPerformance).type)
			result += Math.floor(aPerformance.audience / 5);
        return result;
    }

    function usd(aNumber){
        
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
        }).format(aNumber);
    }

    function totalVolumeCredits() {
        let result = 0;
        for (let perf of invoice.performances) {
            result += volumeCreditsFor(perf);
        }

        return result;
    }

    function totalAmount() {
        let result = 0;
        for (let perf of invoice.performances) {
            result += amountFor(perf);
        }
        return result;
    }
}
