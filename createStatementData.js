module.exports = createStatementData;

function createStatementData(invoice, plays){

    const statementData = {};
    statementData.customer = invoice.customer;
    statementData.performances = invoice.performances.map(enrichPerformance);
	statementData.totalAmount = totalAmount(statementData);
	statementData.totalVolumeCredits = totalVolumeCredits(statementData);
	return statementData;

    function enrichPerformance(aPerformance) {
		const calculator = createPerformanceCalculator(aPerformance, playFor(aPerformance));
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
		throw new Error("subClass responsibility");
    }

    get volumeCredits(){
        let result = 0;
		result += Math.max(this.Performance.audience - 30, 0);
        return result;
    }
}

function createPerformanceCalculator(aPerformance, aPlay) {
	switch(aPlay.type) {
		case "tragedy": return new TragedyCalculator(aPerformance, aPlay);
		case "comedy": return new ComedyCalculator(aPerformance, aPlay);
		default:
			throw new Error(`unkown type: ${aPlay.type}`);
	}
}

class TragedyCalculator extends PerformanceCalculator {
	get amount() {
		let result = 40000;
		if (this.Performance.audience > 30) {
			result += 1000 * (this.Performance.audience - 30);
		}
		return result;
	}
}

class ComedyCalculator extends PerformanceCalculator {
	get amount() {
		let result = 30000;
		if (this.Performance.audience > 20) {
			result += 10000 + 500 * (this.Performance.audience - 20);
		}
		result += 300 * this.Performance.audience;
		return result;
	}

	get volumeCredits() {
		return super.volumeCredits + Math.floor(this.Performance.audience / 5);
	}
}