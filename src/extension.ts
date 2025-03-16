import * as vscode from 'vscode';
import axios from 'axios';

let statusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;
let refreshInterval: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
    // Create output channel
    outputChannel = vscode.window.createOutputChannel('OpenRouter Balance');
    outputChannel.appendLine('Extension activated.');
    // Create status bar item with menu
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = '$(loading~spin) Loading balance...';
    statusBarItem.command = 'openrouterBalance.showMenu';
    statusBarItem.show();

    // Add status bar item to subscriptions to ensure proper cleanup
    context.subscriptions.push(statusBarItem);

    // Register menu command
    let menuDisposable = vscode.commands.registerCommand('openrouterBalance.showMenu', () => {
        vscode.window.showQuickPick([
            {
                label: '$(sync) Refresh Balance',
                description: 'Manually refresh the current balance',
                command: 'openrouterBalance.refreshBalance'
            },
            {
                label: '$(gear) Open Settings',
                description: 'Open extension settings',
                command: 'openrouterBalance.openSettings'
            },
            {
                label: '$(credit-card) Top Up Balance',
                description: 'Open OpenRouter credits page',
                command: 'openrouterBalance.openTopUpPage'
            },
            {
                label: '$(output) Show Output',
                description: 'Show OpenRouter Balance extension output',
                command: 'openrouterBalance.showOutput'
            }
        ]).then(selection => {
            if (selection?.command) {
                vscode.commands.executeCommand(selection.command);
            }
        });
    });

    context.subscriptions.push(menuDisposable);

    // Register refresh command
    let disposable = vscode.commands.registerCommand('openrouterBalance.refreshBalance', async () => {
        await refreshBalance(true, 'manual refresh');
    });

    context.subscriptions.push(statusBarItem);
    context.subscriptions.push(disposable);

    // Register top-up page command
    let topUpDisposable = vscode.commands.registerCommand('openrouterBalance.openTopUpPage', () => {
        vscode.env.openExternal(vscode.Uri.parse('https://openrouter.ai/settings/credits'));
    });
    context.subscriptions.push(topUpDisposable);

    // Register settings command
    let settingsDisposable = vscode.commands.registerCommand('openrouterBalance.openSettings', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', '@ext:javawizard.openrouterBalance');
    });
    context.subscriptions.push(settingsDisposable);

    // Initial refresh with retry
    const tryRefresh = async (attempt = 1) => {
        try {
            await refreshBalance(false, 'initial refresh');
        } catch (error) {
            if (attempt < 3) {
                setTimeout(() => tryRefresh(attempt + 1), 1000 * attempt);
            }
        }
    };

    // Check if API key is available before refreshing
    const config = vscode.workspace.getConfiguration('openrouterBalance');
    if (config.get<string>('apiKey')) {
        tryRefresh();
    } else {
        statusBarItem.text = '$(error) API key not set';
    }

    // Set up automatic refresh
    const setupRefreshInterval = () => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
        const refreshIntervalSeconds = vscode.workspace.getConfiguration('openrouterBalance').get<number>('refreshInterval', 300);
        if (refreshIntervalSeconds > 0) {
            refreshInterval = setInterval(() => {
                refreshBalance(false, 'automatic refresh').catch(err => {
                    console.error('Error during automatic refresh:', err);
                });
            }, refreshIntervalSeconds * 1000);
        }
    };

    // Initial setup
    setupRefreshInterval();

    // Listen for configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('openrouterBalance.refreshInterval')) {
            setupRefreshInterval();
        }
        if (e.affectsConfiguration('openrouterBalance.apiKey')) {
            refreshBalance(true, 'API key change');
        }
    }));

    // Refresh balance whenever any file is saved
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(() => {
        outputChannel.appendLine('OpenRouter balance refreshed due to file save.');
        refreshBalance(false, 'file save');
    }));
}

async function refreshBalance(isManualRefresh = true, reason: string) {
    if (isManualRefresh) {
        statusBarItem.text = '$(loading~spin) Loading balance...';
    }
    // Log the refresh to the output channel
    if (reason) {
        outputChannel.appendLine(`Balance refreshed. Reason: ${reason}`);
    } else if (isManualRefresh) {
        outputChannel.appendLine('Balance refreshed manually.');
    } else {
        outputChannel.appendLine('Balance refreshed automatically.');
    }
    try {
        const apiKey = vscode.workspace.getConfiguration('openrouterBalance').get<string>('apiKey');
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
        statusBarItem.text = '$(error) Balance: $-.--';

        let errorMessage = 'Failed to fetch OpenRouter balance. ';

        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                errorMessage += 'Invalid API key. Please check your settings.';
            } else if (error.response?.status === 429) {
                errorMessage += 'Too many requests. Please try again later.';
            } else {
                errorMessage += 'Check the console for details.';
            }
        } else if (error instanceof Error && 'code' in error && error.code === 'ECONNABORTED') {
            errorMessage += 'Request timed out. Please check your internet connection.';
        } else {
            errorMessage += 'An unexpected error occurred. Check the console for details.';
        }

        vscode.window.showErrorMessage(errorMessage);
    }
}
// Command to show the output channel
let showOutputDisposable = vscode.commands.registerCommand('openrouterBalance.showOutput', () => {
    outputChannel.show(true);
});

export function deactivate() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
}
