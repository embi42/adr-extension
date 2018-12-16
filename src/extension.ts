'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';

const AdrDefaultDirectoryPath = "doc/adr";

function checkAdrFolder(): Promise<any> {
    return new Promise((resolve, reject) => {
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            var rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
            var adrPath = path.join(rootPath, AdrDefaultDirectoryPath);
            fs.exists(adrPath, function(exists) {
                if (!exists) {
                    mkdirp(adrPath, function(err) {
                        if (!err) {
                            resolve(adrPath);
                        }
                    });
                } else {
                    resolve(adrPath);
                }
            });
        } else {
            reject();
        }
    });
}

function getMaxAdrIndexInFolder(adrPath:string): Promise<any> {
    return new Promise((resolve, reject) => {
        var maxAdrIndex = 0;
        fs.readdir(adrPath, function(err, files) {
            files.forEach(file => {
                var prefix = Number(file.substring(0,4));
                if (prefix > maxAdrIndex) {
                    maxAdrIndex = prefix;
                }
            });
            resolve(maxAdrIndex);
        });
    });
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

function createNextAdrEntry(adrPath:string, maxAdrIndex: number, text: string): Promise<any> {
    return new Promise(function(resolve, reject) {
        var nextIndex = maxAdrIndex+1;
        var filenameText = text.replace(/\s/g, '-').toLowerCase();
        var fileName = padStartWithZero(nextIndex.toString(), 4)+"-"+filenameText+".md";
        var fullPath = adrPath+"/"+fileName;
        var adrContent = createAdrFileContent(nextIndex, text);
        fs.appendFile(fullPath, adrContent, function (err) {
            if (err) {reject();}
            else {resolve(fullPath);}
        });
    });
}

function openAdrEntry(entryPath:string): void {
    vscode.workspace.openTextDocument(entryPath)
        .then(textDocument => vscode.window.showTextDocument(textDocument));
}

// function createSnippetItem(): vscode.CompletionItem {
//     return {
//         label: 'adr',
//         documentation: 'Architecture Decision Records Markdown template',
//         kind: vscode.CompletionItemKind.Snippet,
//         insertText: `
//   # teszt
  
//   ## masik teszt
//   `
//       };

//     // let item = new vscode.CompletionItem('Good part of the day', vscode.CompletionItemKind.Snippet);
//     // item.insertText = new vscode.SnippetString("Good ${1|morning,afternoon,evening|}. It is ${1}, right?");
//     // item.documentation = new vscode.MarkdownString("Inserts a snippet that lets you select the _appropriate_ part of the day for your greeting.");

//     // return item;
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
            checkAdrFolder()
                .then(adrPath => {
                    getMaxAdrIndexInFolder(adrPath)
                        .then(maxAdrIndex => {
                            createNextAdrEntry(adrPath, maxAdrIndex, <string>entry)
                                .then(adrFilePath => {
                                    openAdrEntry(adrFilePath);
                                });
                        }
                    );
                }
            );
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}