const cron = require('node-cron');
const transactionRepo = require('../repositories/transaction.repository');
// We need to notify user via Socket updates if we create transactions in background.
// But cron job does not have `res` object. We can use SocketManager to emit to specific account.
const { SocketManager } = require('../sockets/socket.manager');
const SocketEvent = require('../sockets/socket.events');
const transactionService = require('../services/transaction.service'); // For getTransactionSummary...
const walletRepository = require('../repositories/wallet.repository');

const runRecurringJob = async () => {
    console.log('[Cron] Running recurring transactions job...');
    const now = new Date(); // local server time

    try {
        const dueRecurrings = await transactionRepo.getDueRecurringTransactions();
        console.log(`[Cron] Found ${dueRecurrings.length} due recurring transactions.`);

        for (const recurring of dueRecurrings) {
            try {
                // Determine the run date (it should be equal to recurring.next_run_date)
                // But we must convert JS Date to string 'YYYY-MM-DD' for DB
                const runDateObj = new Date(recurring.next_run_date);
                const runDateStr = runDateObj.toISOString().split('T')[0];

                console.log(`[Cron] Processing recurring ${recurring.id} for date ${runDateStr}`);

                // 1. Attempt to create transaction
                // created_from='RECURRING'
                await transactionRepo.createTransactionFromRecurring({
                    account_id: recurring.account_id,
                    wallet_id: recurring.wallet_id, // Could be null if wallet deleted? Assuming FK constraint checks or existing logic handles it.
                    type: recurring.type,
                    category: recurring.category,
                    amount: recurring.amount,
                    note: recurring.note ? recurring.note + ' (Recurring)' : 'Recurring Transaction',
                    source_recurring_id: recurring.id,
                    run_date: runDateStr
                });

                console.log(`[Cron] Created transaction for recurring ${recurring.id}`);

                // 2. Notify User via Socket (Optional but good UX)
                // We construct a pseudo-transaction object or just fetch the newly created one to emit 'created' event?
                // For simplicity, we just trigger a generic update notification so client refreshes data.
                // Or skip it. Background updates often don't need immediate push if user is not online.
                // If user IS online, they might see data appear.

                // Let's emit sync events
                try {
                    const account_id = recurring.account_id;
                    const [balance, chart, wallets] = await Promise.all([
                        transactionService.getTransactionSummaryBalance({ account_id }),
                        transactionService.getTransactionsMonthlyChart({ account_id }),
                        walletRepository.getAllWalletsByAccountId({ account_id })
                    ]);
                    SocketManager.emitToUser(account_id, SocketEvent.BALANCE_UPDATED, balance);
                    SocketManager.emitToUser(account_id, SocketEvent.CHART_UPDATED, chart);
                    SocketManager.emitToUser(account_id, SocketEvent.WALLETS_UPDATED, wallets);
                } catch (socketErr) {
                    console.error('[Cron] Socket notify failed:', socketErr.message);
                }

                // 3. Update next_run_date
                let nextDate = new Date(runDateObj);
                const startDay = recurring.start_day; // stored start day (1-31)

                if (recurring.frequency === 'DAILY') {
                    nextDate.setDate(nextDate.getDate() + 1);
                } else if (recurring.frequency === 'WEEKLY') {
                    nextDate.setDate(nextDate.getDate() + 7);
                } else if (recurring.frequency === 'MONTHLY') {
                    // Similar logic to Controller
                    // Next month
                    const targetMonth = (nextDate.getMonth() + 1) % 12;

                    // Set to 1st of next month + startDay - 1? No.
                    // Create new date for next month with desired startDay
                    // Check validity

                    // Current: Jan 31. Next: Feb...
                    // Let's increment Month of the 'nextDate' object
                    // But 'nextDate' here varies if we just +1 month on a shifted date.
                    // Best way: maintain the 'base' month and increment it?
                    // Actually, just taking current `next_run_date` and adding a month is correct for cycle.

                    // Warning: If next_run_date was Feb 28 (due to correction), and we just add 1 month -> Mar 28.
                    // But original start_day might be 31. So we should effectively be aiming for Mar 31.
                    // So we should ALWAYS use `start_day` to construct the target date in the new month.

                    const currentYear = nextDate.getFullYear();
                    const currentMonth = nextDate.getMonth();

                    // Next Candidate Month/Year
                    let targetYear = currentYear;
                    let targetNextMonth = currentMonth + 1;
                    if (targetNextMonth > 11) {
                        targetNextMonth = 0;
                        targetYear++;
                    }

                    // Construct strict date: YYYY-MM-startDay
                    // Check if valid
                    const potentialDate = new Date(targetYear, targetNextMonth, startDay);

                    if (potentialDate.getMonth() !== targetNextMonth) {
                        // Overflow occurred (e.g. asking for Feb 30, got Mar 2)
                        // Fallback to last day of targetNextMonth
                        potentialDate.setDate(0);
                    }
                    nextDate = potentialDate;
                }

                const nextDateStr = nextDate.toISOString().split('T')[0];
                await transactionRepo.updateNextRunDate(recurring.id, nextDateStr);
                console.log(`[Cron] Updated next_run_date to ${nextDateStr}`);

            } catch (err) {
                // If duplicate entry error (code ER_DUP_ENTRY for key uniq_recurring_run), it means we already processed this.
                // We should probably STILL update the next_run_date to move forward?
                // Or maybe the job crashed after insert but before update last time?
                // If we don't update next_run_date, we will loop forever on this error daily.

                if (err.code === 'ER_DUP_ENTRY') {
                    console.warn(`[Cron] Duplicate transaction for recurring ${recurring.id} on date. Checking if we need to advance date...`);
                    // Logic: If the transaction exists for this date, we MUST have failed to update the date last time.
                    // So we basically re-execute step 3 (Update Date).

                    // Re-calculate next date (same logic as above)
                    // ... DRY ... (Copy paste logic for now or extract function)
                    let nextDate = new Date(recurring.next_run_date);
                    const startDay = recurring.start_day;
                    if (recurring.frequency === 'DAILY') {
                        nextDate.setDate(nextDate.getDate() + 1);
                    } else if (recurring.frequency === 'WEEKLY') {
                        nextDate.setDate(nextDate.getDate() + 7);
                    } else if (recurring.frequency === 'MONTHLY') {
                        const targetMonth = (nextDate.getMonth() + 1) % 12;
                        let targetYear = nextDate.getFullYear();
                        if (nextDate.getMonth() + 1 > 11) targetYear++;

                        const potentialDate = new Date(targetYear, targetMonth, startDay);
                        if (potentialDate.getMonth() !== targetMonth) {
                            potentialDate.setDate(0);
                        }
                        nextDate = potentialDate;
                    }
                    const nextDateStr = nextDate.toISOString().split('T')[0];
                    await transactionRepo.updateNextRunDate(recurring.id, nextDateStr);
                    console.log(`[Cron] Recovered: Updated next_run_date to ${nextDateStr}`);
                } else {
                    console.error(`[Cron] Error processing recurring ${recurring.id}:`, err);
                }
            }
        }
    } catch (error) {
        console.error('[Cron] Fatal error in job:', error);
    }
};

// Test trigger function (optional, for manual testing via API)
const testTrigger = async () => {
    console.log('[Cron] Manual Trigger...');
    await runRecurringJob();
};

module.exports = {
    start: () => {
        // Run daily at 00:00
        cron.schedule('0 0 * * *', runRecurringJob, {
            timezone: "Asia/Ho_Chi_Minh" // Or system default
        });
        console.log('[Cron] Recurring transaction job scheduled (00:00 Daily).');
    },
    runRecurringJob // Export for manual trigger
};
