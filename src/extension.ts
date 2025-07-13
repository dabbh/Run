// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

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

	// Register event listener for active editor changes
	const activeEditorChange = vscode.window.onDidChangeActiveTextEditor(() => {
		updateStatusBarItem();
	});

	// Register event listener for document changes
	const documentChange = vscode.workspace.onDidOpenTextDocument(() => {
		updateStatusBarItem();
	});

	context.subscriptions.push(runCommand, activeEditorChange, documentChange);

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

	if (fs.existsSync(runFilePath)) {
		console.log(`.Run file exists at: ${runFilePath}`);
		try {
			const content = fs.readFileSync(runFilePath, 'utf-8');
			console.log(`.Run file content: ${content}`);
			
			// Try to parse as INI-style format first (with sections like [c], [cpp], etc.)
			let config = parseRunFileWithSections(content, languageId);
			
			// If no language-specific config found, try JSON format
			if (!config && content.trim().startsWith('{')) {
				config = JSON.parse(content);
			}

			if (config) {
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

				return config;
			}
		} catch (err) {
			vscode.window.showErrorMessage(`Failed to parse .Run file: ${err}`);
			console.error(`Error parsing .Run file: ${err}`);
		}
	} else {
		console.log(`.Run file does not exist at: ${runFilePath}`);
	}

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
	const runCommand = `./${path.basename(filePath, path.extname(filePath))}`;

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
		cwd: cwd
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
			
			if (safeMode) {
				const timestamp = Date.now();
				const safeExecutableName = `${fileNameWithoutExt}_temp_${timestamp}`;
				return `gcc ${compileFlags} "${fileName}" -o ${safeExecutableName} && ./${safeExecutableName} && rm ${safeExecutableName}`;
			} else {
				return `gcc ${compileFlags} "${fileName}" -o ${fileNameWithoutExt} && ${runCommand}`;
			}
		} catch (err) {
			vscode.window.showErrorMessage(String(err));
			return null;
		}
	}

	// Check for custom compile flags and run command for C++
	if (languageId === 'cpp') {
		const safeMode = customConfig.safeMode !== undefined ? customConfig.safeMode : true;
		
		if (customConfig.compileFlags && customConfig.runCommand) {
			console.log(`Using custom C++ config: ${customConfig.compileFlags}, ${customConfig.runCommand}`);
			if (safeMode) {
				const timestamp = Date.now();
				const safeExecutableName = `${fileNameWithoutExt}_temp_${timestamp}`;
				return `g++ ${customConfig.compileFlags} "${fileName}" -o ${safeExecutableName} && ./${safeExecutableName} && rm ${safeExecutableName}`;
			} else {
				return `g++ ${customConfig.compileFlags} "${fileName}" -o ${fileNameWithoutExt} && ${customConfig.runCommand}`;
			}
		}
	}

	switch (languageId) {
		case 'python':
			return `python3 "${fileName}"`;
		case 'java':
			return `javac *.java && java ${fileNameWithoutExt}`;
		case 'cpp': {
			const safeMode = customConfig.safeMode !== undefined ? customConfig.safeMode : true;
			if (safeMode) {
				const timestamp = Date.now();
				const safeExecutableName = `${fileNameWithoutExt}_temp_${timestamp}`;
				return `g++ "${fileName}" -o ${safeExecutableName} && ./${safeExecutableName} && rm ${safeExecutableName}`;
			} else {
				return `g++ "${fileName}" -o ${fileNameWithoutExt} && ./${fileNameWithoutExt}`;
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
			if (safeMode) {
				const timestamp = Date.now();
				const safeExecutableName = `${fileNameWithoutExt}_temp_${timestamp}`;
				return `rustc "${fileName}" -o ${safeExecutableName} && ./${safeExecutableName} && rm ${safeExecutableName}`;
			} else {
				return `rustc "${fileName}" -o ${fileNameWithoutExt} && ./${fileNameWithoutExt}`;
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
			return `pdflatex "${fileName}" && xdg-open ${fileNameWithoutExt}.pdf`;
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
			const keyValueMatch = trimmedLine.match(/^([^:]+):\s*(.+)$/);
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
	}

	// Return config if we found any values, otherwise null
	return Object.keys(config).length > 0 ? config : null;
}

// This method is called when your extension is deactivated
export function deactivate() {
	if (statusBarItem) {
		statusBarItem.dispose();
	}
}
