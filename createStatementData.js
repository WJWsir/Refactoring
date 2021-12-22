module.exports = createStatementData;

function createStatementData(invoice, plays){

    const statementData = {};
    statementData.customer = invoice.customer;
    statementData.performances = invoice.performances.map(enrichPerformance);
	statementData.totalAmount = totalAmount(statementData);
	statementData.totalVolumeCredits = totalVolumeCredits(statementData);
	return statementData;

    function enrichPerformance(aPerformance) {
		const calculator = new PerformanceCalculator(aPerformance, playFor(aPerformance));
        const result = Object.assign({}, aPerformance);
        result.play = calculator.Play;
        result.amount = amountFor(result);
        result.volumeCredits = volumeCreditsFor(result);
        return result;
    }

    function playFor(perf){

        return plays[perf.playID];
    }

	function amountFor(aPerformance) {
		return new PerformanceCalculator(aPerformance, playFor(aPerformance)).amount;
	}

    function volumeCreditsFor(aPerformance){
        let result = 0;
		result += Math.max(aPerformance.audience - 30, 0);
		if ("comedy" == aPerformance.play.type)
			result += Math.floor(aPerformance.audience / 5);
        return result;
    }

    function totalVolumeCredits(data) {
		return data.performances
			.reduce((total, p) => total + p.volumeCredits, 0);
    }

    function totalAmount(data) {
		return data.performances
			.reduce((total, p) => total + p.amount, 0);
    }
}

class PerformanceCalculator {
	constructor(aPerformance, aPlay) {
		this.Performance = aPerformance;
		this.Play = aPlay;
	}

	get amount() {
		let result = 0;

		switch (this.Performance.play.type) {
			case "tragedy":
				result = 40000;
				if (this.Performance.audience > 30) {
					result += 1000 * (this.Performance.audience - 30);
				}
				break;
			case "comedy":
				result = 30000;
				if (this.Performance.audience > 20) {
					result += 10000 + 500 * (this.Performance.audience - 20);
				}
				result += 300 * this.Performance.audience;
				break;
			default:
				throw new Error(`unknown type: ${this.play.type}`);
		}

		return result;
    }
}