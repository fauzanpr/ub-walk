import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { source_id, destination_id } = body;

    if (!source_id || !destination_id) {
      return NextResponse.json(
        { message: 'source_id dan destination_id wajib dikirim' },
        { status: 400 }
      );
    }

    const dijkstraDir = path.join(process.cwd(), '..', '..', 'dijkstra');
    const pythonFile = path.join(dijkstraDir, 'main_json.py');
    const outputFile = path.join(dijkstraDir, 'output.json');

    await runPythonScript(
      pythonFile,
      [String(source_id), String(destination_id)],
      dijkstraDir
    );

    const output = await fs.readFile(outputFile, 'utf-8');
    const jsonOutput = JSON.parse(output);

    return NextResponse.json({
      message: 'Shortest path berhasil dihitung',
      data: jsonOutput,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Terjadi error saat menjalankan Dijkstra',
        error: String(error),
      },
      { status: 500 }
    );
  }
}

function runPythonScript(
  scriptPath: string,
  args: string[],
  cwd: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [scriptPath, ...args], {
      cwd,
    });

    let stderr = '';
    let stdout = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        console.log(stdout);
        resolve();
      } else {
        reject(`Python script gagal dengan kode ${code}: ${stderr}`);
      }
    });
  });
}