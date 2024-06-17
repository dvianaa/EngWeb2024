"use client";

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import { join } from 'path';
import unzipper from 'unzipper';

const UPLOAD_DIR = '../../public/uploads';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Método ${req.method} não permitido`);
    return;
  }

  try {
    const { file } = req.body;

    if (!file) {
      res.status(400).json({ error: 'Nenhum arquivo encontrado.' });
      return;
    }

    const zipFilePath = join(UPLOAD_DIR, `${Date.now()}.zip`);

    fs.writeFileSync(zipFilePath, Buffer.from(file, 'base64'));

    const extractDir = join(UPLOAD_DIR, `${Date.now()}`);
    await fs.createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: extractDir }))
      .promise();

    const requiredFolders = ['texto', 'atual', 'imagem'];
    const zipContents = fs.readdirSync(extractDir);
    const hasRequiredFolders = requiredFolders.every(folder => zipContents.includes(folder));

    if (!hasRequiredFolders) {
      throw new Error('O arquivo zip não contém as pastas necessárias.');
    }

    // Executa o script Python
   {/*} const { spawn } = require('child_process');
    const pythonProcess = spawn('python', ['path/to/script.py', zipFilePath]);

    pythonProcess.on('exit', (code: number) => {
      if (code === 0) {
        res.status(200).json({ message: 'Arquivo enviado e processado com sucesso.' });
      } else {
        throw new Error('Erro ao processar o arquivo com o script Python.');
      }
    });

    pythonProcess.on('error', (err: any) => {
      throw new Error(`Erro ao executar o script Python: ${err}`);
    }); */}

  } catch (error) {
    console.error('Erro ao processar o arquivo:', error);
    res.status(500).json({ error: 'Erro ao processar o arquivo.' });
  } finally {
  }
}
