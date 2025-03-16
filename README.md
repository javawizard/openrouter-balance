# VSCode OpenRouter Balance Extension

This Visual Studio Code extension displays your remaining OpenRouter credit balance in the status bar.

## Summer Vibes

**This extension was 95% vibe coded with Roo Code using DeepSeek V3** with a sprinkling of Claude 3.7 when things were getting a little unfocused. This was originally intended to be an experiment in how well vibe coding would work on DeepSeek V3.

I'm honestly impressed; it's totally functional and DeepSeek V3 actually did quite a good job at writing it without a ton of intervention. Every now and then I'd have to give it hints; it took a while for it to realize that there isn't a "title" property on VSCode settings contribution definitions, for example - and Claude proved to be quite a bit better at keeping extension-progress.md organized. But DeepSeek did the majority of the work.

2025 is going to be an exciting year.

**UPDATE 3/15/2025: I've been experimenting with Gemini 2.0 Flash.** Cheaper than DeepSeek V3, *way* faster, and the code quality seems roughly similar. Not anywhere near Claude 3.7 but at 1/30th the price it's *well* worth the cost.

## Installation

I haven't published this extension to the marketplace yet, so in the mean time you'll want to do a quick:

```
git clone git@github.com:javawizard/openrouter-balance
cd openrouter-balance && npm i && npm run install:local
```

Then reload all of your Visual Studio Code windows and you're off to the races.

That command will package the extension as `openrouterBalance-*.vsix` as well; you can use that file directly to install it into Cursor or any other VSCode-derived IDE.

