import * as vscode from 'vscode';
import axios from 'axios';

let statusBarItem: vscode.StatusBarItem;
let refreshInterval: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
    // Create status bar item with menu
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = '$(loading~spin) Loading balance...';
    statusBarItem.command = 'openrouter-balance.showMenu';
    statusBarItem.show();

    // Register menu command
    let menuDisposable = vscode.commands.registerCommand('openrouter-balance.showMenu', () => {
        vscode.window.showQuickPick([
            {
                label: '$(sync) Refresh Balance',
                description: 'Manually refresh the current balance',
                command: 'openrouter-balance.refreshBalance'
            }
        ]).then(selection => {
            if (selection?.command) {
                vscode.commands.executeCommand(selection.command);
            }
        });
    });

    context.subscriptions.push(menuDisposable);

    // Register refresh command
    let disposable = vscode.commands.registerCommand('openrouter-balance.refreshBalance', async () => {
        await refreshBalance();
    });

    context.subscriptions.push(statusBarItem);
    context.subscriptions.push(disposable);

    // Initial refresh with retry
    const tryRefresh = async (attempt = 1) => {
        try {
            await refreshBalance();
        } catch (error) {
            if (attempt < 3) {
                setTimeout(() => tryRefresh(attempt + 1), 1000 * attempt);
            }
        }
    };

    // Check if API key is available before refreshing
    const config = vscode.workspace.getConfiguration('openrouter');
    if (config.get<string>('apiKey')) {
        tryRefresh();
    } else {
        statusBarItem.text = '$(error) API key not set';
    }

    // Set up automatic refresh
    const refreshIntervalMs = vscode.workspace.getConfiguration('openrouter').get<number>('refreshInterval', 300000);
    if (refreshIntervalMs > 0) {
        refreshInterval = setInterval(() => {
            refreshBalance().catch(err => {
                console.error('Error during automatic refresh:', err);
            });
        }, refreshIntervalMs);
    }
}

async function refreshBalance() {
    statusBarItem.text = '$(loading~spin) Loading balance...';
    try {
        const apiKey = vscode.workspace.getConfiguration('openrouter').get<string>('apiKey');
        if (!apiKey) {
            statusBarItem.text = '$(error) API key not set';
            vscode.window.showErrorMessage('OpenRouter API key is not configured. Please set it in settings.');
            return;
        }

        const response = await axios.get('https://openrouter.ai/api/v1/credits', {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        const totalCredits = response.data?.data?.total_credits;
        const totalUsage = response.data?.data?.total_usage;

        if (totalCredits === undefined || totalUsage === undefined) {
            throw new Error('Credits data not found in response');
        }

        const balance = totalCredits - totalUsage;
        statusBarItem.text = `$(credit-card) Balance: $${balance.toFixed(2)}`;
    } catch (error) {
        console.error('Error fetching balance:', error);
        statusBarItem.text = '$(error) Failed to load balance';
        vscode.window.showErrorMessage('Failed to fetch OpenRouter balance. Check the console for details.');
    }
}

export function deactivate() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
}
