// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const request = require('request');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Extension "test-inline-api" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.testApi', function () {

		// Display a message box to the user
		const editor = vscode.window.activeTextEditor;
		const selection = editor.selection;
		let url = editor.document.getText(selection);
		
		//removed wrapped quotes if any
		url = url.replace(/"/g, "");
		url = url.replace(/'/g, "");

		if(!url.length) {
			vscode.window.showWarningMessage('No API selected');
			return
		}

		if (!isUrlValid(url)) {
			
			vscode.window.showWarningMessage('API is not valid');
			return
		}


		if (isUrlValid(url)) {
			request(url, { json: true }, (error, response, body) => {
				console.error('error:', error); // Print the error if one occurred
				console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
				console.log('body:', body); // Print the HTML for the Google homepage.

				if (!isJsonValid(body)) {
					vscode.window.showErrorMessage('The response is not a valid JSON');
					return
				}

				const panel = vscode.window.createWebviewPanel(
					'testAPI', // Identifies the type of the webview. Used internally
					'API Result', // Title of the panel displayed to the user
					vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
					{} // Webview options. More on these later.
				);

				 panel.webview.html = getWebviewContent(body);
			});
		}
	});

	context.subscriptions.push(disposable);
}

/**
 * Process the web view of the API test result
 * @param {Object} body JSON Result
 */
function getWebviewContent(body) {
	let content = JSON.stringify(body, undefined, 2);
	return `<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<title>Cat Coding</title>
				</head>
				<body style="background-color:black; color:#33FF33">
					<pre>${content}</pre>
				</body>
			</html>`;
}


/**
 * Verify if the selected text is a valid URL
 * @param {String} str URL selected
 */
function isUrlValid(str) {
	let pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
		'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
	return !!pattern.test(str);
}

/**
 * Verify if the result is a valid JSON
 * @param {String} str JSON string
 */
function isJsonValid(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
