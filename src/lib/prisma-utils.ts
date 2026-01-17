
/**
 * Executes a Promise-returning function with retry logic for specific error conditions.
 * Targeted for handling transient database errors like:
 * - MaxScale "Unknown prepared statement handler" (Code 1243)
 * - Deadlocks (Code 1213)
 * - Concurrency issues (Code 1020, Prisma P2034)
 * 
 * @param operation The async operation to execute
 * @param maxRetries Maximum number of retries (default: 3)
 * @returns The result of the operation
 */
export async function executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error: any) {
            const isRetryable =
                // MaxScale / MariaDB specific
                error?.message?.includes('Unknown prepared statement handler') ||
                error?.meta?.code === 1243 ||

                // Deadlocks
                error?.message?.includes('Deadlock found') ||
                error?.meta?.code === 1213 ||

                // Concurrency / Race Conditions
                error?.message?.includes('Record has changed since last read') ||
                error?.code === 'P2034' ||
                error?.meta?.code === 1020;

            if (isRetryable && i < maxRetries - 1) {
                // Exponential backoff: 50ms, 100ms, 200ms
                const delay = 50 * Math.pow(2, i);
                // console.warn(`Retrying database operation due to transient error (Attempt ${i + 1}/${maxRetries}). Delay: ${delay}ms`, error.message);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            throw error;
        }
    }
    throw new Error('Max retries reached'); // Should be unreachable given the throw in loop
}
