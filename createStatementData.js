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
        result.amount = calculator.amount;
        result.volumeCredits = calculator.volumeCredits;
        return result;
    }

    function playFor(perf){

        return plays[perf.playID];
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

		switch (this.Play.type) {
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
				throw new Error(`unknown type: ${this.Play.type}`);
		}

		return result;
    }

    get volumeCredits(){
        let result = 0;
		result += Math.max(this.Performance.audience - 30, 0);
		if ("comedy" == this.Play.type)
			result += Math.floor(this.Performance.audience / 5);
        return result;
    }
}