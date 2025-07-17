// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

let statusBarItem: vscode.StatusBarItem;
const compilationOptions: Map<string, { compileFlags: string; runCommand: string }> = new Map();

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Code Runner Extension is now active!');

	// Create status bar item
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'coderunner.runFile';
	statusBarItem.text = "$(play) Run";
	statusBarItem.tooltip = "Run current file";
	context.subscriptions.push(statusBarItem);

	// Register the run command
	const runCommand = vscode.commands.registerCommand('coderunner.runFile', () => {
		runCurrentFile();
	});

	// Register the create .Run file command
	const createRunFileCommand = vscode.commands.registerCommand('coderunner.createRunFile', () => {
		createRunFile();
	});

	// Register the open .Run file command
	const openRunFileCommand = vscode.commands.registerCommand('coderunner.openRunFile', () => {
		openRunFile();
	});

	// Register the create global .Run file command
	const createGlobalRunFileCommand = vscode.commands.registerCommand('coderunner.createGlobalRunFile', () => {
		createGlobalRunFile();
	});

	// Register the edit global .Run file command
	const editGlobalRunFileCommand = vscode.commands.registerCommand('coderunner.editGlobalRunFile', () => {
		editGlobalRunFile();
	});

	// Register event listener for active editor changes
	const activeEditorChange = vscode.window.onDidChangeActiveTextEditor(() => {
		updateStatusBarItem();
	});

	// Register event listener for document changes
	const documentChange = vscode.workspace.onDidOpenTextDocument(() => {
		updateStatusBarItem();
	});

	// Register completion provider for .Run files
	const runFileCompletionProvider = vscode.languages.registerCompletionItemProvider(
		[
			{ scheme: 'file', pattern: '**/.Run' },
			{ scheme: 'file', pattern: '**/global.Run' }
		],
		new RunFileCompletionProvider(),
		'{', '[', 'f', 'c', 'r', 's' // Trigger characters for different completions
	);

	context.subscriptions.push(runCommand, createRunFileCommand, openRunFileCommand, createGlobalRunFileCommand, editGlobalRunFileCommand, activeEditorChange, documentChange, runFileCompletionProvider);

	// Initial update
	updateStatusBarItem();
}

function updateStatusBarItem() {
	const editor = vscode.window.activeTextEditor;
	
	if (editor && isSupportedLanguage(editor.document.languageId)) {
		const langName = getLanguageDisplayName(editor.document.languageId);
		statusBarItem.text = `$(play) Run ${langName}`;
		statusBarItem.tooltip = `Run current ${langName} file`;
		statusBarItem.show();
		console.log(`Status bar updated for ${langName} file`);
	} else {
		statusBarItem.hide();
		console.log('Status bar hidden - unsupported file type or no active editor');
	}
}

function isSupportedLanguage(languageId: string): boolean {
	return ['c', 'cpp', 'python', 'java', 'javascript', 'typescript', 'go', 'rust', 'php', 'ruby', 'csharp', 'dart', 'latex'].includes(languageId);
}

function getLanguageDisplayName(languageId: string): string {
	const displayNames: { [key: string]: string } = {
		'c': 'C',
		'cpp': 'C++',
		'python': 'Python',
		'java': 'Java',
		'javascript': 'JavaScript',
		'typescript': 'TypeScript',
		'go': 'Go',
		'rust': 'Rust',
		'php': 'PHP',
		'ruby': 'Ruby',
		'csharp': 'C#',
		'dart': 'Dart',
		'latex': 'LaTeX'
	};
	return displayNames[languageId] || languageId;
}

async function getCustomRunConfig(filePath: string, languageId?: string): Promise<{ compileFlags?: string; runCommand?: string; fullCommand?: string; safeMode?: boolean }> {
	const folderPath = path.dirname(filePath);
	const runFilePath = path.join(folderPath, '.Run');
	const vscodeSettingsPath = path.join(folderPath, '.vscode', 'settings.json');

	console.log(`Looking for .Run file at: ${runFilePath}`);
	console.log(`Looking for .vscode/settings.json at: ${vscodeSettingsPath}`);

	// First try to find local .Run file
	if (fs.existsSync(runFilePath)) {
		console.log(`.Run file exists at: ${runFilePath}`);
		const config = await parseRunFileAtPath(runFilePath, languageId, filePath);
		if (config) {
			return config;
		}
	} else {
		console.log(`.Run file does not exist at: ${runFilePath}`);
	}

	// If no local .Run file found, try global .Run file
	const globalRunFilePath = await getGlobalRunFilePath();
	console.log(`Global .Run file path: ${globalRunFilePath}`);
	
	if (globalRunFilePath && fs.existsSync(globalRunFilePath)) {
		console.log(`Global .Run file exists at: ${globalRunFilePath}`);
		const config = await parseRunFileAtPath(globalRunFilePath, languageId, filePath);
		if (config) {
			console.log(`Using global .Run file configuration:`, config);
			return config;
		} else {
			console.log(`Global .Run file exists but no config found for language: ${languageId}`);
		}
	} else {
		console.log(`Global .Run file does not exist at: ${globalRunFilePath}`);
	}

	// Try .vscode/settings.json as fallback
	if (fs.existsSync(vscodeSettingsPath)) {
		console.log(`.vscode/settings.json exists at: ${vscodeSettingsPath}`);
		try {
			const content = fs.readFileSync(vscodeSettingsPath, 'utf-8');
			console.log(`.vscode/settings.json content: ${content}`);
			const settings = JSON.parse(content);
			return settings['runConfig'] || {};
		} catch (err) {
			vscode.window.showErrorMessage(`Failed to parse .vscode/settings.json: ${err}`);
			console.error(`Error parsing .vscode/settings.json: ${err}`);
		}
	} else {
		console.log(`.vscode/settings.json does not exist at: ${vscodeSettingsPath}`);
	}

	console.log('No custom run configuration found.');
	return {};
}

async function getCOptions(filePath: string): Promise<{ compileFlags: string; runCommand: string }> {
	const customConfig = await getCustomRunConfig(filePath, 'c');
	console.log(`Custom config for ${filePath}:`, customConfig);

	if (customConfig.compileFlags && customConfig.runCommand) {
		console.log(`Using custom compileFlags: ${customConfig.compileFlags}, runCommand: ${customConfig.runCommand}`);
		return {
			compileFlags: customConfig.compileFlags,
			runCommand: customConfig.runCommand
		};
	}

	if (compilationOptions.has(filePath)) {
		console.log(`Using cached options for ${filePath}:`, compilationOptions.get(filePath));
		return compilationOptions.get(filePath)!;
	}

	// Use default options without prompting the user
	const compileFlags = "";
	const execExt = getExecutableExtension();
	const executableName = `${path.basename(filePath, path.extname(filePath))}${execExt}`;
	const runCommand = isWindows() ? executableName : `./${executableName}`;

	const options = { compileFlags, runCommand };
	compilationOptions.set(filePath, options);
	console.log(`Cached default options for ${filePath}:`, options);
	return options;
}

async function runCurrentFile() {
	console.log('Run command triggered');
	const editor = vscode.window.activeTextEditor;

	if (!editor) {
		vscode.window.showErrorMessage('No active file to run');
		console.error('No active editor found.');
		return;
	}

	const document = editor.document;
	const languageId = document.languageId;
	console.log(`Current file language: ${languageId}`);

	if (!isSupportedLanguage(languageId)) {
		vscode.window.showErrorMessage(`Language ${languageId} is not supported`);
		console.error(`Unsupported language: ${languageId}`);
		return;
	}

	// Save the file before running
	await document.save();
	const filePath = document.fileName;
	const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
	const cwd = workspaceFolder ? workspaceFolder.uri.fsPath : path.dirname(filePath);

	let command = await getRunCommand(languageId, filePath);
	if (!command) {
		console.error('No command generated.');
		return;
	}

	console.log(`Generated command: ${command}`);

	// Create and show terminal
	const terminal = vscode.window.createTerminal({
		name: `Run ${getLanguageDisplayName(languageId)}`,
		cwd: cwd,
		iconPath: new vscode.ThemeIcon('play'),
		color: new vscode.ThemeColor('terminal.ansiGreen')
	});

	terminal.show();
	terminal.sendText(command);
	vscode.window.showInformationMessage(`Running ${getLanguageDisplayName(languageId)} file...`);
}

async function getRunCommand(languageId: string, filePath: string): Promise<string | null> {
	const fileName = path.basename(filePath);
	const fileNameWithoutExt = path.basename(filePath, path.extname(filePath));

	// Check for custom configuration for any language
	const customConfig = await getCustomRunConfig(filePath, languageId);
	if (customConfig.fullCommand) {
		console.log(`Using full custom command for ${languageId}: ${customConfig.fullCommand}`);
		return customConfig.fullCommand;
	}

	if (languageId === 'c') {
		try {
			const { compileFlags, runCommand } = await getCOptions(filePath);
			const safeMode = customConfig.safeMode !== undefined ? customConfig.safeMode : true;
			const execExt = getExecutableExtension();
			
			if (safeMode) {
				const timestamp = Date.now();
				const safeExecutableName = `${fileNameWithoutExt}_temp_${timestamp}${execExt}`;
				const runCmd = isWindows() ? safeExecutableName : `./${safeExecutableName}`;
				const compileCmd = `gcc ${compileFlags} "${fileName}" -o ${safeExecutableName}`;
				const cleanupCmd = isWindows() ? `del ${safeExecutableName}` : `rm ${safeExecutableName}`;
				return buildCommand(compileCmd, runCmd, cleanupCmd);
			} else {
				const executableName = `${fileNameWithoutExt}${execExt}`;
				const runCmd = isWindows() ? executableName : runCommand;
				const compileCmd = `gcc ${compileFlags} "${fileName}" -o ${executableName}`;
				return buildCommand(compileCmd, runCmd);
			}
		} catch (err) {
			vscode.window.showErrorMessage(String(err));
			return null;
		}
	}

	// Check for custom compile flags and run command for C++
	if (languageId === 'cpp') {
		const safeMode = customConfig.safeMode !== undefined ? customConfig.safeMode : true;
		const execExt = getExecutableExtension();
		
		if (customConfig.compileFlags && customConfig.runCommand) {
			console.log(`Using custom C++ config: ${customConfig.compileFlags}, ${customConfig.runCommand}`);
			if (safeMode) {
				const timestamp = Date.now();
				const safeExecutableName = `${fileNameWithoutExt}_temp_${timestamp}${execExt}`;
				const runCmd = isWindows() ? safeExecutableName : `./${safeExecutableName}`;
				const compileCmd = `g++ ${customConfig.compileFlags} "${fileName}" -o ${safeExecutableName}`;
				const cleanupCmd = isWindows() ? `del ${safeExecutableName}` : `rm ${safeExecutableName}`;
				return buildCommand(compileCmd, runCmd, cleanupCmd);
			} else {
				const executableName = `${fileNameWithoutExt}${execExt}`;
				const runCmd = isWindows() ? executableName : customConfig.runCommand;
				const compileCmd = `g++ ${customConfig.compileFlags} "${fileName}" -o ${executableName}`;
				return buildCommand(compileCmd, runCmd);
			}
		}
	}

	switch (languageId) {
		case 'python':
			const pythonCmd = isWindows() ? 'python' : 'python3';
			return `${pythonCmd} "${fileName}"`;
		case 'java':
			return `javac *.java && java ${fileNameWithoutExt}`;
		case 'cpp': {
			const safeMode = customConfig.safeMode !== undefined ? customConfig.safeMode : true;
			const execExt = getExecutableExtension();
			if (safeMode) {
				const timestamp = Date.now();
				const safeExecutableName = `${fileNameWithoutExt}_temp_${timestamp}${execExt}`;
				const runCmd = isWindows() ? safeExecutableName : `./${safeExecutableName}`;
				const compileCmd = `g++ "${fileName}" -o ${safeExecutableName}`;
				const cleanupCmd = isWindows() ? `del ${safeExecutableName}` : `rm ${safeExecutableName}`;
				return buildCommand(compileCmd, runCmd, cleanupCmd);
			} else {
				const executableName = `${fileNameWithoutExt}${execExt}`;
				const runCmd = isWindows() ? executableName : `./${executableName}`;
				const compileCmd = `g++ "${fileName}" -o ${executableName}`;
				return buildCommand(compileCmd, runCmd);
			}
		}
		case 'javascript':
			return `node "${fileName}"`;
		case 'typescript':
			return `npx ts-node "${fileName}"`;
		case 'go':
			return `go run "${fileName}"`;
		case 'rust': {
			const safeMode = customConfig.safeMode !== undefined ? customConfig.safeMode : true;
			const execExt = getExecutableExtension();
			if (safeMode) {
				const timestamp = Date.now();
				const safeExecutableName = `${fileNameWithoutExt}_temp_${timestamp}${execExt}`;
				const runCmd = isWindows() ? safeExecutableName : `./${safeExecutableName}`;
				const compileCmd = `rustc "${fileName}" -o ${safeExecutableName}`;
				const cleanupCmd = isWindows() ? `del ${safeExecutableName}` : `rm ${safeExecutableName}`;
				return buildCommand(compileCmd, runCmd, cleanupCmd);
			} else {
				const executableName = `${fileNameWithoutExt}${execExt}`;
				const runCmd = isWindows() ? executableName : `./${executableName}`;
				const compileCmd = `rustc "${fileName}" -o ${executableName}`;
				return buildCommand(compileCmd, runCmd);
			}
		}
		case 'php':
			return `php "${fileName}"`;
		case 'ruby':
			return `ruby "${fileName}"`;
		case 'csharp':
			return `dotnet run`;
		case 'dart':
			return `dart run "${fileName}"`;
		case 'latex':
			const openCmd = getOpenCommand();
			const compileCmd = `pdflatex "${fileName}"`;
			const openPdfCmd = `${openCmd} ${fileNameWithoutExt}.pdf`;
			return buildCommand(compileCmd, openPdfCmd);
		default:
			return null;
	}
}

function parseRunFileWithSections(content: string, languageId?: string): { compileFlags?: string; runCommand?: string; fullCommand?: string; safeMode?: boolean } | null {
	if (!languageId) {
		return null;
	}

	const lines = content.split('\n');
	let currentSection = '';
	let inTargetSection = false;
	const config: { compileFlags?: string; runCommand?: string; fullCommand?: string; safeMode?: boolean } = {};

	for (const line of lines) {
		const trimmedLine = line.trim();
		
		// Skip empty lines and comments
		if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) {
			continue;
		}

		// Check for section headers like [c], [cpp], [python]
		const sectionMatch = trimmedLine.match(/^\[([^\]]+)\]$/);
		if (sectionMatch) {
			currentSection = sectionMatch[1].toLowerCase();
			inTargetSection = currentSection === languageId.toLowerCase();
			continue;
		}

		// If we're in the target section, parse key-value pairs
		if (inTargetSection) {
			// Support both : and = separators
			const keyValueMatch = trimmedLine.match(/^([^:=]+)[:=]\s*(.+)$/);
			if (keyValueMatch) {
				const key = keyValueMatch[1].trim();
				const value = keyValueMatch[2].trim();
				
				if (key === 'compileFlags') {
					config.compileFlags = value;
				} else if (key === 'runCommand') {
					config.runCommand = value;
				} else if (key === 'fullCommand') {
					config.fullCommand = value;
				} else if (key === 'safeMode') {
					config.safeMode = value.toLowerCase() === 'true' || value === '1';
				}
			}
		}
		
		// Handle [safe] section for global safeMode setting
		if (currentSection === 'safe') {
			const keyValueMatch = trimmedLine.match(/^([^:=]+)[:=]\s*(.+)$/);
			if (keyValueMatch) {
				const key = keyValueMatch[1].trim();
				const value = keyValueMatch[2].trim();
				
				if (key === 'safeMode') {
					config.safeMode = value.toLowerCase() === 'true' || value === '1';
				}
			}
		}
	}

	// Return config if we found any values, otherwise null
	return Object.keys(config).length > 0 ? config : null;
}

// Helper functions for cross-platform compatibility
function isWindows(): boolean {
	return os.platform() === 'win32';
}

function getExecutableExtension(): string {
	return isWindows() ? '.exe' : '';
}

function getOpenCommand(): string {
	if (isWindows()) {
		return 'start';
	} else if (os.platform() === 'darwin') {
		return 'open';
	} else {
		return 'xdg-open';
	}
}

function formatCommand(command: string): string {
	// On Windows, replace && with proper PowerShell syntax
	if (isWindows()) {
		return command;
	}
	return command;
}

function buildCommand(compileCmd: string, runCmd: string, cleanupCmd?: string): string {
	if (isWindows()) {
		// Windows PowerShell syntax
		if (cleanupCmd) {
			return `${compileCmd}; if ($?) { ${runCmd}; ${cleanupCmd} }`;
		} else {
			return `${compileCmd}; if ($?) { ${runCmd} }`;
		}
	} else {
		// Linux/macOS bash syntax
		if (cleanupCmd) {
			return `${compileCmd} && ${runCmd} && ${cleanupCmd}`;
		} else {
			return `${compileCmd} && ${runCmd}`;
		}
	}
}

async function createRunFile() {
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	if (!workspaceFolder) {
		vscode.window.showErrorMessage('No workspace folder found. Open a folder first.');
		return;
	}

	// Show language selection quick pick
	const languages = [
		{ label: 'C', value: 'c' },
		{ label: 'C++', value: 'cpp' },
		{ label: 'Python', value: 'python' },
		{ label: 'Java', value: 'java' },
		{ label: 'JavaScript', value: 'javascript' },
		{ label: 'TypeScript', value: 'typescript' },
		{ label: 'Go', value: 'go' },
		{ label: 'Rust', value: 'rust' },
		{ label: 'PHP', value: 'php' },
		{ label: 'Ruby', value: 'ruby' },
		{ label: 'C#', value: 'csharp' },
		{ label: 'Dart', value: 'dart' },
		{ label: 'LaTeX', value: 'latex' },
		{ label: 'All Languages (Complete Template)', value: 'all' }
	];

	const selectedLanguages = await vscode.window.showQuickPick(languages, {
		placeHolder: 'Select languages to include in .Run file',
		canPickMany: true,
		title: 'Create .Run Configuration File'
	});

	if (!selectedLanguages || selectedLanguages.length === 0) {
		return;
	}

	// Generate .Run file content
	let content = '# Custom run configurations\n';
	content += '# Created by Run! extension\n';
	content += '# safeMode: true (default) - Creates temporary executables to avoid file conflicts\n';
	content += '# safeMode: false - Uses standard executable names (may overwrite existing files)\n\n';

	// Check if "All Languages" was selected
	const includeAll = selectedLanguages.some(lang => lang.value === 'all');
	const languagesToInclude = includeAll ? 
		languages.filter(lang => lang.value !== 'all') : 
		selectedLanguages;

	for (const lang of languagesToInclude) {
		content += generateLanguageSection(lang.value);
	}

	// Write to .Run file
	const runFilePath = path.join(workspaceFolder.uri.fsPath, '.Run');
	
	try {
		// Check if file already exists
		if (fs.existsSync(runFilePath)) {
			const overwrite = await vscode.window.showWarningMessage(
				'.Run file already exists. Do you want to overwrite it?',
				'Overwrite',
				'Cancel'
			);
			if (overwrite !== 'Overwrite') {
				return;
			}
		}

		fs.writeFileSync(runFilePath, content, 'utf-8');
		
		// Open the created file
		const document = await vscode.workspace.openTextDocument(runFilePath);
		await vscode.window.showTextDocument(document);
		
		vscode.window.showInformationMessage('✅ .Run file created successfully!');
	} catch (error) {
		vscode.window.showErrorMessage(`Failed to create .Run file: ${error}`);
	}
}

function generateLanguageSection(language: string): string {
	const templates: { [key: string]: string } = {
		c: `[c]
compileFlags: -Wall -Wextra -g -std=c99
runCommand: ./{filename}
# safeMode: true (default - creates temporary executables)
# For simple compilation without extra flags, omit compileFlags

`,
		cpp: `[cpp]
compileFlags: -Wall -Wextra -std=c++17 -O2
runCommand: ./{filename}
# safeMode: true (default)

`,
		python: `[python]
fullCommand: python3 {filenameWithExt}
# Alternative: fullCommand: python3 {filenameWithExt} --verbose

`,
		java: `[java]
compileFlags: -cp .
runCommand: java {filename}
# Java doesn't need safeMode (no executable files created)

`,
		javascript: `[javascript]
fullCommand: node {filenameWithExt}
# Alternative: fullCommand: node {filenameWithExt} --inspect

`,
		typescript: `[typescript]
fullCommand: npx ts-node {filenameWithExt}
# Alternative: fullCommand: npx ts-node {filenameWithExt} --transpile-only

`,
		go: `[go]
fullCommand: go run {filenameWithExt}
# Alternative: fullCommand: go run {filenameWithExt} -race

`,
		rust: `[rust]
compileFlags: --release
runCommand: ./{filename}
safeMode: false  # Disable safe mode for this project

`,
		php: `[php]
fullCommand: php {filenameWithExt}
# Alternative: fullCommand: php {filenameWithExt} -d display_errors=on

`,
		ruby: `[ruby]
fullCommand: ruby {filenameWithExt}
# Alternative: fullCommand: ruby {filenameWithExt} --verbose

`,
		csharp: `[csharp]
fullCommand: dotnet run
# C# projects use dotnet run in the project directory

`,
		dart: `[dart]
fullCommand: dart run {filenameWithExt}
# Alternative: fullCommand: dart run {filenameWithExt} --enable-asserts

`,
		latex: `[latex]
fullCommand: pdflatex {filenameWithExt} && xdg-open {filename}.pdf
# For complex LaTeX projects with bibliography:
# fullCommand: pdflatex {filenameWithExt} && bibtex {filename} && pdflatex {filenameWithExt} && xdg-open {filename}.pdf

`
	};

	return templates[language] || `[${language}]
# Add your custom configuration here

`;
}

// Auto-completion provider for .Run files
class RunFileCompletionProvider implements vscode.CompletionItemProvider {
	provideCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
		context: vscode.CompletionContext
	): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
		const completionItems: vscode.CompletionItem[] = [];
		const line = document.lineAt(position).text;
		const linePrefix = line.substring(0, position.character);

		// 1. Placeholder completions when typing inside {}
		if (linePrefix.includes('{')) {
			// Check if we're inside incomplete placeholder
			const lastOpenBrace = linePrefix.lastIndexOf('{');
			const lastCloseBrace = linePrefix.lastIndexOf('}');
			
			// We're inside a placeholder if the last { is after the last } (or no } exists)
			if (lastOpenBrace > lastCloseBrace || lastCloseBrace === -1) {
				const afterCursor = line.substring(position.character);
				const hasClosingBrace = afterCursor.includes('}');
				
				// Get the current partial text inside the braces
				const partialText = linePrefix.substring(lastOpenBrace + 1).toLowerCase();
				
				const placeholders = [
					{ name: 'filename', detail: 'File name without extension', doc: 'Expands to the filename without its extension (e.g., "main" for "main.c")' },
					{ name: 'filenameWithExt', detail: 'File name with extension', doc: 'Expands to the full filename with extension (e.g., "main.c")' }
				];

				placeholders.forEach(placeholder => {
					// Show completion if placeholder name starts with the partial text
					if (placeholder.name.toLowerCase().startsWith(partialText)) {
						const completion = new vscode.CompletionItem(placeholder.name, vscode.CompletionItemKind.Variable);
						completion.detail = placeholder.detail;
						completion.documentation = placeholder.doc;
						completion.insertText = hasClosingBrace ? placeholder.name : `${placeholder.name}}`;
						
						// Replace the partial text if it exists
						if (partialText) {
							completion.range = new vscode.Range(
								position.line,
								lastOpenBrace + 1,
								position.line,
								position.character
							);
						}
						
						completionItems.push(completion);
					}
				});

				return completionItems;
			}
		}

		// 2. Section completions when typing inside []
		if (linePrefix.includes('[') && !linePrefix.includes(']')) {
			const afterCursor = line.substring(position.character);
			const hasClosingBracket = afterCursor.includes(']');
			
			const languages = ['c', 'cpp', 'python', 'java', 'javascript', 'typescript', 'go', 'rust', 'php', 'ruby', 'csharp', 'dart', 'latex'];
			languages.forEach(lang => {
				const item = new vscode.CompletionItem(lang, vscode.CompletionItemKind.Module);
				item.detail = `Configuration section for ${lang}`;
				item.insertText = hasClosingBracket ? lang : `${lang}]`;
				item.documentation = `Creates a configuration section for ${lang} language`;
				completionItems.push(item);
			});
			return completionItems;
		}

		// 3. Property name completions (when typing property names)
		const isAtLineStart = linePrefix.trim() === '' || linePrefix.match(/^\s*$/);
		const isAfterSection = linePrefix.match(/^\s*\[.*\]\s*$/);
		const currentLineEmpty = line.trim() === '';

		// Language sections - only at beginning of line
		if (isAtLineStart || currentLineEmpty) {
			const languages = ['c', 'cpp', 'python', 'java', 'javascript', 'typescript', 'go', 'rust', 'php', 'ruby', 'csharp', 'dart', 'latex'];
			languages.forEach(lang => {
				const item = new vscode.CompletionItem(`[${lang}]`, vscode.CompletionItemKind.Module);
				item.detail = `Configuration section for ${lang}`;
				item.insertText = `[${lang}]`;
				completionItems.push(item);
			});
		}

		// Configuration keys - when we're likely in a section
		if (isAfterSection || (linePrefix.match(/^\s*$/) && !isAtLineStart)) {
			const configKeys = [
				{ key: 'compileFlags', detail: 'Compilation flags for compiled languages', example: ': -Wall -Wextra -g' },
				{ key: 'runCommand', detail: 'Command to run the compiled executable', example: ': ./{filename}' },
				{ key: 'fullCommand', detail: 'Complete custom command (overrides other settings)', example: ': gcc {filenameWithExt} -o {filename} && ./{filename}' },
				{ key: 'safeMode', detail: 'Create temporary executables (true/false)', example: ': true' }
			];

			configKeys.forEach(({ key, detail, example }) => {
				const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Property);
				item.detail = detail;
				item.insertText = `${key}${example}`;
				item.documentation = `Example: ${key}${example}`;
				completionItems.push(item);
			});
		}

		// 4. Word-based completions (when typing partial words)
		const wordAtCursor = this.getWordAtPosition(document, position);
		if (wordAtCursor) {
			const word = wordAtCursor.toLowerCase();
			
			// Auto-complete property names
			const propertyMatches = [
				{ match: 'full', complete: 'fullCommand', detail: 'Complete custom command' },
				{ match: 'comp', complete: 'compileFlags', detail: 'Compilation flags' },
				{ match: 'run', complete: 'runCommand', detail: 'Run command' },
				{ match: 'safe', complete: 'safeMode', detail: 'Safe mode setting' }
			];

			propertyMatches.forEach(({ match, complete, detail }) => {
				if (complete.toLowerCase().startsWith(word)) {
					const item = new vscode.CompletionItem(complete, vscode.CompletionItemKind.Property);
					item.detail = detail;
					item.insertText = `${complete}: `;
					item.documentation = `Property: ${detail}`;
					completionItems.push(item);
				}
			});

			// Auto-complete section names
			const languages = ['c', 'cpp', 'python', 'java', 'javascript', 'typescript', 'go', 'rust', 'php', 'ruby', 'csharp', 'dart', 'latex'];
			languages.forEach(lang => {
				if (lang.toLowerCase().startsWith(word)) {
					const item = new vscode.CompletionItem(`[${lang}]`, vscode.CompletionItemKind.Module);
					item.detail = `Configuration section for ${lang}`;
					item.insertText = `[${lang}]`;
					completionItems.push(item);
				}
			});
		}

		return completionItems;
	}

	private getWordAtPosition(document: vscode.TextDocument, position: vscode.Position): string | undefined {
		const range = document.getWordRangeAtPosition(position);
		return range ? document.getText(range) : undefined;
	}
}

// This method is called when your extension is deactivated
export function deactivate() {
	if (statusBarItem) {
		statusBarItem.dispose();
	}
}

async function getGlobalRunFilePath(): Promise<string | undefined> {
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	
	// Always try user home directory first for truly global configuration
	const homeDir = os.homedir();
	const userVscodeDir = path.join(homeDir, '.vscode');
	const userGlobalRunFile = path.join(userVscodeDir, 'global.Run');
	
	// Create user .vscode directory if it doesn't exist
	try {
		if (!fs.existsSync(userVscodeDir)) {
			await fs.promises.mkdir(userVscodeDir, { recursive: true });
		}
	} catch (error) {
		console.error('Error creating user .vscode directory:', error);
	}
	
	// Check if user global file exists
	if (fs.existsSync(userGlobalRunFile)) {
		return userGlobalRunFile;
	}
	
	// If we have a workspace, also check workspace .vscode folder as fallback
	if (workspaceFolder) {
		const vscodeDir = path.join(workspaceFolder.uri.fsPath, '.vscode');
		const workspaceGlobalRunFile = path.join(vscodeDir, 'global.Run');
		
		try {
			if (!fs.existsSync(vscodeDir)) {
				await fs.promises.mkdir(vscodeDir, { recursive: true });
			}
		} catch (error) {
			console.error('Error creating workspace .vscode directory:', error);
		}
		
		if (fs.existsSync(workspaceGlobalRunFile)) {
			return workspaceGlobalRunFile;
		}
	}
	
	// Return user global path for creation (even if it doesn't exist yet)
	return userGlobalRunFile;
}

async function createGlobalRunFile() {
	try {
		const globalRunFilePath = await getGlobalRunFilePath();
		if (!globalRunFilePath) {
			vscode.window.showErrorMessage('Could not determine global .Run file location');
			return;
		}

		if (fs.existsSync(globalRunFilePath)) {
			const choice = await vscode.window.showInformationMessage(
				'Global .Run file already exists. Do you want to open it?',
				'Yes', 'No'
			);
			if (choice === 'Yes') {
				const document = await vscode.workspace.openTextDocument(globalRunFilePath);
				await vscode.window.showTextDocument(document);
			}
			return;
		}

		// Create the default content
		const defaultContent = getDefaultRunFileContent();
		
		// Write to file
		await fs.promises.writeFile(globalRunFilePath, defaultContent);
		
		// Open the file
		const document = await vscode.workspace.openTextDocument(globalRunFilePath);
		await vscode.window.showTextDocument(document);
		
		vscode.window.showInformationMessage('Global .Run file created successfully!');
	} catch (error) {
		vscode.window.showErrorMessage(`Error creating global .Run file: ${error}`);
	}
}

async function editGlobalRunFile() {
	try {
		const globalRunFilePath = await getGlobalRunFilePath();
		if (!globalRunFilePath) {
			vscode.window.showErrorMessage('Could not determine global .Run file location');
			return;
		}

		if (!fs.existsSync(globalRunFilePath)) {
			const choice = await vscode.window.showInformationMessage(
				'Global .Run file does not exist. Do you want to create it?',
				'Yes', 'No'
			);
			if (choice === 'Yes') {
				await createGlobalRunFile();
			}
			return;
		}

		// Open the file
		const document = await vscode.workspace.openTextDocument(globalRunFilePath);
		await vscode.window.showTextDocument(document);
	} catch (error) {
		vscode.window.showErrorMessage(`Error opening global .Run file: ${error}`);
	}
}

function getDefaultRunFileContent(): string {
	const isWindows = os.platform() === 'win32';
	const isMac = os.platform() === 'darwin';
	
	// Platform-specific executable extension and PDF viewer
	const exeExt = isWindows ? '.exe' : '';
	const pdfViewer = isWindows ? 'start' : (isMac ? 'open' : 'xdg-open');
	const pythonCmd = isWindows ? 'python' : 'python3';
	
	return `# .Run configuration file
# This file defines custom build and run settings for the Run! extension
# Cross-platform compatible - automatically detects your operating system
# 
# Place this file in:
#   - Project root (.Run) for project-specific settings
#   - User home/.vscode folder (global.Run) for user-wide settings
#   - Workspace .vscode folder (global.Run) for workspace-wide settings

[safe]
# safeMode: true (default) - Creates temporary executables to avoid file conflicts
# safeMode: false - Uses standard executable names (may overwrite existing files)
safeMode = true

# Example configuration for C language
[c]
compileFlags = -Wall -Wextra -g -std=c99
runCommand = ./{filename}${exeExt}

# Example configuration for C++ language
[cpp]
compileFlags = -Wall -Wextra -std=c++17 -O2
runCommand = ./{filename}${exeExt}

# Example configuration for Python
[python]
runCommand = ${pythonCmd} {filenameWithExt}

# Example configuration for Java
[java]
compileFlags = -cp .
runCommand = java {filename}

# Example configuration for JavaScript
[javascript]
runCommand = node {filenameWithExt}

# Example configuration for TypeScript
[typescript]
runCommand = ts-node {filenameWithExt}

# Example configuration for Go
[go]
runCommand = go run {filenameWithExt}

# Example configuration for Rust
[rust]
compileFlags = --edition=2021
runCommand = ./{filename}${exeExt}

# Example configuration for PHP
[php]
runCommand = php {filenameWithExt}

# Example configuration for Ruby
[ruby]
runCommand = ruby {filenameWithExt}

# Example configuration for C#
[csharp]
runCommand = dotnet run

# Example configuration for Dart
[dart]
runCommand = dart {filenameWithExt}

# Example configuration for LaTeX
[latex]
compileFlags = -interaction=nonstopmode
runCommand = ${pdfViewer} {filename}.pdf

# Platform-specific notes:
# - Windows: Uses 'python' command, '.exe' extensions, 'start' for PDF
# - macOS: Uses 'python3' command, no extensions, 'open' for PDF
# - Linux: Uses 'python3' command, no extensions, 'xdg-open' for PDF

# Add your custom configurations below
`;
}

async function parseRunFileAtPath(runFilePath: string, languageId?: string, filePath?: string): Promise<{ compileFlags?: string; runCommand?: string; fullCommand?: string; safeMode?: boolean } | null> {
	try {
		const content = fs.readFileSync(runFilePath, 'utf-8');
		console.log(`.Run file content: ${content}`);
		
		// Try to parse as INI-style format first (with sections like [c], [cpp], etc.)
		let config = parseRunFileWithSections(content, languageId);
		
		// If no language-specific config found, try JSON format
		if (!config && content.trim().startsWith('{')) {
			config = JSON.parse(content);
		}

		if (config && filePath) {
			// Replace {filename} and {filenameWithExt} placeholders with the actual file names
			const fileNameWithoutExt = path.basename(filePath, path.extname(filePath));
			const fileNameWithExt = path.basename(filePath);

			const replacePlaceholders = (str: string) =>
				str.replaceAll('{filename}', fileNameWithoutExt)
				   .replaceAll('{filenameWithExt}', fileNameWithExt);

			if (config.runCommand) {
				config.runCommand = replacePlaceholders(config.runCommand);
			}
			if (config.fullCommand) {
				config.fullCommand = replacePlaceholders(config.fullCommand);
			}
			if (config.compileFlags) {
				config.compileFlags = replacePlaceholders(config.compileFlags);
			}
		}

		return config;
	} catch (err) {
		vscode.window.showErrorMessage(`Failed to parse .Run file: ${err}`);
		console.error(`Error parsing .Run file: ${err}`);
		return null;
	}
}

async function openRunFile() {
	try {
		const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			vscode.window.showErrorMessage('No active file open');
			return;
		}

		const currentFilePath = activeEditor.document.fileName;
		const folderPath = path.dirname(currentFilePath);
		const runFilePath = path.join(folderPath, '.Run');

		// Check if local .Run file exists
		if (fs.existsSync(runFilePath)) {
			const document = await vscode.workspace.openTextDocument(runFilePath);
			await vscode.window.showTextDocument(document);
			return;
		}

		// If no local .Run file, check for global .Run file
		const globalRunFilePath = await getGlobalRunFilePath();
		if (globalRunFilePath && fs.existsSync(globalRunFilePath)) {
			const document = await vscode.workspace.openTextDocument(globalRunFilePath);
			await vscode.window.showTextDocument(document);
			return;
		}

		// No .Run file found, ask user what to do
		const choice = await vscode.window.showInformationMessage(
			'No .Run file found. What would you like to do?',
			'Create Local .Run File',
			'Create Global .Run File',
			'Cancel'
		);

		if (choice === 'Create Local .Run File') {
			await createRunFile();
		} else if (choice === 'Create Global .Run File') {
			await createGlobalRunFile();
		}
	} catch (error) {
		vscode.window.showErrorMessage(`Error opening .Run file: ${error}`);
	}
}
