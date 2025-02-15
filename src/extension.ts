import * as vscode from 'vscode';
import * as path from 'path';
import { spawn } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('python-parallel-runner.runParallel', async () => {
        // ファイル選択ダイアログを表示
        const files = await vscode.window.showOpenDialog({
            canSelectMany: true,
            filters: {
                'Python Files': ['py']
            }
        });

        if (!files) {
            return;
        }

        // 選択された各ファイルに対して処理を実行
        files.forEach(file => {
            const fileName = path.basename(file.fsPath);
            // 新しい出力チャンネルを作成
            const outputChannel = vscode.window.createOutputChannel(`Python - ${fileName}`);
            outputChannel.show(true);

            // Pythonプロセスを開始
            const pythonProcess = spawn('python', [file.fsPath], {
                cwd: path.dirname(file.fsPath)
            });

            // 標準出力の処理
            pythonProcess.stdout.on('data', (data) => {
                outputChannel.append(data.toString());
            });

            // 標準エラー出力の処理
            pythonProcess.stderr.on('data', (data) => {
                outputChannel.append(`Error: ${data.toString()}`);
            });

            // プロセス終了時の処理
            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    outputChannel.appendLine(`\n[Process completed successfully]`);
                } else {
                    outputChannel.appendLine(`\n[Process exited with code ${code}]`);
                }
            });

            // エラーハンドリング
            pythonProcess.on('error', (err) => {
                outputChannel.appendLine(`\n[Error starting process: ${err.message}]`);
            });
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
