# VSCode OpenRouter Balance Extension

This Visual Studio Code extension displays your remaining OpenRouter credit balance in the status bar.

## Summer Vibes

**This extension was 95% vibe coded with Roo Code using DeepSeek V3** with a sprinkling of Claude 3.7 when things were getting a little unfocused. This was mostly intended to be an experiment in how well vibe coding would work on DeepSeek V3.

I'm honestly impressed; it's totally functional and DeepSeek V3 actually did quite a good job at writing it without a ton of intervention. Every now and then I'd have to give it hints; it took a while for it to realize that there isn't a "title" property on VSCode settings contribution definitions, for example - and Claude proved to be quite a bit better at keeping extension-progress.md organized. But DeepSeek did the majority of the work.

2025 is going to be an exciting year.

**UPDATE 3/15/2025: I've been experimenting with Gemini 2.0 Flash.** Cheaper than DeepSeek V3, *way* faster, and the code quality seems roughly similar. Not anywhere near Claude 3.7 but at 1/30th the price it's *well* worth the cost.

The rest of the README is maintained by DeepSeek and Claude.

## Features

- Shows current OpenRouter balance in the status bar
- Automatically refreshes balance on activation
- Manual refresh via command palette
- Secure API key storage in settings

## Installation

1. Install the extension from the Marketplace
2. Set your OpenRouter API key in settings
3. The balance will appear in the status bar

## Usage

- The balance is automatically displayed in the status bar
- Click the status bar item to manually refresh
- Set your API key in File > Preferences > Settings > Extensions > OpenRouter Balance

## Requirements

- OpenRouter API key
- Visual Studio Code 1.98.0 or higher

## Extension Settings

This extension contributes the following settings:

* `openrouter.apiKey`: Your OpenRouter API key

## Known Issues

None currently

## Release Notes

### 0.0.1

Initial release of OpenRouter Balance extension
