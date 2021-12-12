let plays = require('./plays.json');
let invoices = require('./invoices.json');
//console.log(plays);
//console.log(invoices);

var readline = require("readline");

// 用于不结束程序
function pending() {

    let rl = readline.createInterface(process.stdin, process.stdout);

    rl.setPrompt('press any key to shut down\n');

    rl.prompt();

    rl.on("line", function (line) {
        this.close();
    });
    // close事件监听
    rl.on("close", function () {
        // 结束程序
        console.log("bye bye");
        process.exit(0);
    });
}

main();

function main() {

    testFunction();

    let invoiceOfBigCo = invoices.find(invoice => invoice.customer == "BigCo");
    let result = statement(invoiceOfBigCo, plays);
    console.log(result);

    pending();
}

function statement(invoice, plays) {
    return formatStatement(calculateStatement(invoice, plays));
}


function Statement(customerID, statementAmountDetails, volumeCredits) {
    this.CustomerID = customerID;
    this.StatementAmountDetails = statementAmountDetails;
    this.VolumeCredits = volumeCredits;
}


function StatementAmountDetails(totalAmount, amountDetailOfPerformances) {
    this.TotalAmount = totalAmount;
    this.AmountDetailOfPerformances = amountDetailOfPerformances;
}

function PerformanceAmountDetail(performanceName, amount, seats) {
    this.PerformanceName = performanceName;
    this.Amount = amount;
    this.Seats = seats;
}

function calculateStatement(invoice, plays) {
    let customerID = invoice.customer;
    let statementAmountDetails = calculateAmount(invoice, plays);
    let volumeCredits = calculateVolumeCredits(invoice, plays);
    return new Statement(customerID, statementAmountDetails, volumeCredits)
}

function calculateAmount(invoice, plays) {

    let TotalAmount = 0;
    let AmountDetailOfPerformances = [];

    for (let perf of invoice.performances) {
        const play = plays[perf.playID];
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

        TotalAmount += thisAmount;

        AmountDetailOfPerformances.push(new PerformanceAmountDetail(play.name, thisAmount, perf.audience));
    }
    return new StatementAmountDetails(TotalAmount, AmountDetailOfPerformances);
}

function calculateVolumeCredits(invoice, plays) {
    let volumeCredits = 0;
    for (let perf of invoice.performances) {
        const play = plays[perf.playID];

        volumeCredits += Math.max(perf.audience - 30, 0);
        // add extra credit for every ten comedy attendees
        if ("comedy" == play.type)
            volumeCredits += Math.floor(perf.audience / 5);

    }

    return volumeCredits;
}

function formatStatement(statement) {
    let result = "";
    result += `Statement for ${statement.CustomerID}\n`;
    for (let performanceAmountDetail of statement.StatementAmountDetails.AmountDetailOfPerformances) {
        result += ` ${performanceAmountDetail.PerformanceName}: ${formatUSD()(performanceAmountDetail.Amount / 100)} (${performanceAmountDetail.Seats} seats)\n`;
    }
    result += `Amount owed is ${formatUSD()(statement.StatementAmountDetails.TotalAmount / 100)}\n`;
    result += `You earned ${statement.VolumeCredits} credits\n`;
    return result;
}

function formatUSD() {
    const format_US = new Intl.NumberFormat("en-US",
        { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format;
    return format_US;
}

function formatCNY() {
    const format_CN = new Intl.NumberFormat("zh-Hans-CN",
        { style: "currency", currency: "CNY", minimumFractionDigits: 2 }).format;
}



function testFunction() {

    test_calculateAmount();
    test_calculateVolumeCredits();
    test_formatStatement();
    test_calculateStatement();

}


// test function

function test_calculateAmount() {
    /* BUILD */
    let input = {
        invoice: {
            "customer": "BigCo",
            "performances": [
                {
                    "playID": "hamlet",
                    "audience": 55
                },
                {
                    "playID": "as-like",
                    "audience": 35
                },
                {
                    "playID": "othello",
                    "audience": 40
                }
            ]
        },
        plays:
        {
            "hamlet": { "name": "Hamlet", "type": "tragedy" },
            "as-like": { "name": "As You Like It", "type": "comedy" },
            "othello": { "name": "Othello", "type": "tragedy" }
        }
    };

    /* OPETATE */
    let output = calculateAmount(input.invoice, input.plays);

    /* CHECK */
    let expected = {
        TotalAmount: 173000,
        AmountDetailOfPerformances: [
            {
                PerformanceName: "Hamlet", Amount: 65000, Seats: 55
            },
            {
                PerformanceName: "As You Like It", Amount: 58000, Seats: 35
            },
            {
                PerformanceName: "Othello", Amount: 50000, Seats: 40
            }

        ]
    };
    console.assert(JSON.stringify(output) == JSON.stringify(expected), { expected: JSON.stringify(expected), actual: JSON.stringify(output), errMsg: "Wrong function -- calculateAmount" });
}

function test_calculateVolumeCredits() {
    /* BUILD */
    let input = {
        invoice: {
            "customer": "BigCo",
            "performances": [
                {
                    "playID": "hamlet",
                    "audience": 55
                },
                {
                    "playID": "as-like",
                    "audience": 35
                },
                {
                    "playID": "othello",
                    "audience": 40
                }
            ]
        },
        plays:
        {
            "hamlet": { "name": "Hamlet", "type": "tragedy" },
            "as-like": { "name": "As You Like It", "type": "comedy" },
            "othello": { "name": "Othello", "type": "tragedy" }
        }
    };

    /* OPETATE */
    let output = calculateVolumeCredits(input.invoice, input.plays);

    /* CHECK */
    let expected = 47;
    console.assert(output == expected, { errMsg: "Wrong function -- calculateVolumeCredits" });
}

function test_formatStatement() {
    let input = {
        CustomerID: "BigCo",
        StatementAmountDetails: {
            TotalAmount: 173000,
            AmountDetailOfPerformances: [
                { PerformanceName: "Hamlet", Amount: "65000", Seats: "55" },
                { PerformanceName: "As You Like It", Amount: "58000", Seats: "35" },
                { PerformanceName: "Othello", Amount: "50000", Seats: "40" }
            ]
        },
        VolumeCredits: 47
    }

    let output = formatStatement(new Statement(input.CustomerID, input.StatementAmountDetails, input.VolumeCredits));
    let expected = "Statement for BigCo\n Hamlet: $650.00 (55 seats)\n As You Like It: $580.00 (35 seats)\n Othello: $500.00 (40 seats)\nAmount owed is $1,730.00\nYou earned 47 credits\n";
    console.assert(output == expected, { expected: expected, actual: output, errMsg: "Wrong function -- formatStatement" });
}

function test_calculateStatement() {
    let input = {
        invoice: {
            "customer": "BigCo",
            "performances": [
                {
                    "playID": "hamlet",
                    "audience": 55
                },
                {
                    "playID": "as-like",
                    "audience": 35
                },
                {
                    "playID": "othello",
                    "audience": 40
                }
            ]
        },
        plays:
        {
            "hamlet": { "name": "Hamlet", "type": "tragedy" },
            "as-like": { "name": "As You Like It", "type": "comedy" },
            "othello": { "name": "Othello", "type": "tragedy" }
        }
    };

    let output = calculateStatement(input.invoice, input.plays);
    let expected = {
        CustomerID: "BigCo",
        StatementAmountDetails: {
            TotalAmount: 173000,
            AmountDetailOfPerformances: [
                { PerformanceName: "Hamlet", Amount: 65000, Seats: 55 },
                { PerformanceName: "As You Like It", Amount: 58000, Seats: 35 },
                { PerformanceName: "Othello", Amount: 50000, Seats: 40 }
            ]
        },
        VolumeCredits: 47
    };
    console.assert(JSON.stringify(output) == JSON.stringify(expected), { expected: JSON.stringify(expected), actual: JSON.stringify(output), errMsg: "Wrong function -- calculateStatement" });
}