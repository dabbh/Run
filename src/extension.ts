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
	return ['c', 'cpp', 'python', 'java', 'javascript', 'typescript', 'go', 'rust', 'php', 'ruby', 'csharp', 'dart'].includes(languageId);
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
		'dart': 'Dart'
	};
	return displayNames[languageId] || languageId;
}

async function getCustomRunConfig(filePath: string): Promise<{ compileFlags?: string; runCommand?: string }> {
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
			return JSON.parse(content);
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
	const customConfig = await getCustomRunConfig(filePath);
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

	const compileFlags = await vscode.window.showInputBox({
		prompt: 'Enter compilation flags for C (e.g., -Wall -Wextra)',
		value: '-Wall -Wextra'
	});

	if (!compileFlags) {
		throw new Error('Compilation flags are required');
	}

	const runCommand = await vscode.window.showInputBox({
		prompt: 'Enter run command for C (e.g., valgrind ./output)',
		value: './output'
	});

	if (!runCommand) {
		throw new Error('Run command is required');
	}

	const options = { compileFlags, runCommand };
	compilationOptions.set(filePath, options);
	console.log(`Cached options for ${filePath}:`, options);
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

	if (languageId === 'c') {
		try {
			const { compileFlags, runCommand } = await getCOptions(filePath);
			return `gcc ${compileFlags} "${fileName}" -o ${fileNameWithoutExt} && ${runCommand}`;
		} catch (err) {
			vscode.window.showErrorMessage(String(err));
			return null;
		}
	}

	switch (languageId) {
		case 'python':
			return `python3 "${fileName}"`;
		
		case 'java':
			return `javac *.java && java ${fileNameWithoutExt}`;
		
		case 'cpp':
			return `g++ "${fileName}" -o ${fileNameWithoutExt} && ./${fileNameWithoutExt}`;
		
		case 'javascript':
			return `node "${fileName}"`;
		
		case 'typescript':
			return `npx ts-node "${fileName}"`;
		
		case 'go':
			return `go run "${fileName}"`;
		
		case 'rust':
			return `rustc "${fileName}" -o ${fileNameWithoutExt} && ./${fileNameWithoutExt}`;
		
		case 'php':
			return `php "${fileName}"`;
		
		case 'ruby':
			return `ruby "${fileName}"`;
		
		case 'csharp':
			return `dotnet run`;
		
		case 'dart':
			return `dart run "${fileName}"`;
		
		default:
			return null;
	}
}

// This method is called when your extension is deactivated
export function deactivate() {
	if (statusBarItem) {
		statusBarItem.dispose();
	}
}
