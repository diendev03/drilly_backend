require('dotenv').config();
const transactionRepo = require('./src/repositories/transaction.repository');

async function run() {
    try {
        console.log("--- DEBUG START ---");
        console.log("Checking for Transaction ID: 401");

        // 1. Check specifically for Account 33
        const myTx = await transactionRepo.getTransactionById({ id: 401, account_id: 33 });
        console.log("Result for Account 33:", myTx ? "FOUND" : "NOT FOUND");
        if (myTx) console.log(JSON.stringify(myTx, null, 2));

        // 2. Check globally (to see if it exists at all)
        const globalTx = await transactionRepo.getTransactionById({ id: 401, account_id: null });
        console.log("Result Global Search:", globalTx ? "FOUND" : "NOT FOUND");
        if (globalTx) {
            console.log(`Global Tx Owner: ${globalTx.account_id}`);
            console.log(JSON.stringify(globalTx, null, 2));
        }

        console.log("--- DEBUG END ---");
        process.exit(0);
    } catch (error) {
        console.error("Debug Error:", error);
        process.exit(1);
    }
}

run();
