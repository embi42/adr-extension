'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';

function checkAdrFolder(): string | undefined {
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        var rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
        var adrPath = path.join(rootPath, "doc/adr");
        if (!fs.existsSync(adrPath)) {
            mkdirp.sync(adrPath);
        }
        return adrPath;
    }
    else {
        return undefined;
    }
}

function getMaxAdrIndexInFolder(adrPath:string): number {
    var maxAdrIndex = 0;
    fs.readdirSync(adrPath).forEach(file => {
        var prefix = Number(file.substring(0,4));
        if (prefix > maxAdrIndex) {
            maxAdrIndex = prefix;
        }
    });
    return maxAdrIndex;
}

function padStartWithZero( text: string, width: number )
{
  width -= text.toString().length;
  if ( width > 0 )
  {
    return new Array( width + (/\./.test( text ) ? 2 : 1) ).join( '0' ) + text;
  }
  return text + "";
}

function getToday():string {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) {month = '0' + month;}
    if (day.length < 2) {day = '0' + day;}

    return [year, month, day].join('-');
}

function createAdrFileContent(index: number, text: string): string {
    return "# " + index + ". "+ text + "\r\n\r\n" +
    "Datum: "+ getToday() +"\r\n\r\n"+
    "## Status\r\n\r\n"+
    "## Kontext\r\n\r\n"+
    "## Entscheidung\r\n\r\n"+
    "## Konsequenzen\r\n\r\n";
}

function createNextAdrEntry(adrPath:string, maxAdrIndex: number, text: string): string {
    var nextIndex = maxAdrIndex+1;
    var filenameText = text.replace(/\s/g, '-').toLowerCase();
    var fileName = padStartWithZero(nextIndex.toString(), 4)+"-"+filenameText+".md";
    var fullPath = adrPath+"/"+fileName;
    var adrContent = createAdrFileContent(nextIndex, text);
    fs.appendFileSync(fullPath, adrContent);
    vscode.workspace.openTextDocument(fullPath)
        .then(textDocument => vscode.window.showTextDocument(textDocument));
    return fileName;
}

// function createSnippetItem(): vscode.CompletionItem {
//     let item = new vscode.CompletionItem('Good part of the day', vscode.CompletionItemKind.Snippet);
//     item.insertText = new vscode.SnippetString("Good ${1|morning,afternoon,evening|}. It is ${1}, right?");
//     item.documentation = new vscode.MarkdownString("Inserts a snippet that lets you select the _appropriate_ part of the day for your greeting.");

//     return item;
// }

export function activate(context: vscode.ExtensionContext) {
    // vscode.languages.registerCompletionItemProvider('markdown', {
	// 	provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
	// 		return [
	// 			new vscode.CompletionItem('Hello World!'),
	// 			createSnippetItem()
	// 		];
	// 	}
	// });

    let disposable = vscode.commands.registerCommand('extension.createAdrEntry', async () => {
        let entry = await vscode.window.showInputBox({prompt: "Title of ADR Entry:"});
        if (entry) {
            vscode.window.showInformationMessage(entry);
            var adrFolder = checkAdrFolder();
            if (adrFolder) {
                var maxAdrIndex = getMaxAdrIndexInFolder(adrFolder);
                createNextAdrEntry(adrFolder, maxAdrIndex, entry);
            }
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}