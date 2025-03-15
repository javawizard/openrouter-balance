import * as vscode from 'vscode';
import axios from 'axios';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = '$(loading~spin) Loading balance...';
    statusBarItem.command = 'openrouter-balance.refreshBalance';
    statusBarItem.show();

    // Register refresh command
    let disposable = vscode.commands.registerCommand('openrouter-balance.refreshBalance', async () => {
        await refreshBalance();
    });

    context.subscriptions.push(statusBarItem);
    context.subscriptions.push(disposable);

    // Initial refresh
    refreshBalance();
}

async function refreshBalance() {
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

export function deactivate() {}
