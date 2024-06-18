"use client";

import { useState } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import Layout from "../layout";
import Navbar from "../_components/Navbar";
import { message, Upload } from 'antd';
import type { UploadProps } from 'antd';
import WithRoleProtection from '../_components/withRoleProtection';

const { Dragger } = Upload;

const AdicionarRuaPage = () => {
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const props: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.zip',
    action: '/api/upload',
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
          message.success(`${info.file.name} file uploaded successfully.`);
        setUploadStatus('Sucesso: Arquivo enviado.');
      } else if (status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
        setUploadStatus('Erro: Falha ao enviar o arquivo.');
      }
    },
  };

  const downloadXSD = () => {
    const xsdUrl = '~/../MRB-rua.xsd'; 
    const link = document.createElement('a');
    link.href = xsdUrl;
    link.setAttribute('download', 'MRB-rua.xsd');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <WithRoleProtection role="admin">
    <Layout>
      <main className="flex h-screen w-full bg-white text-black">
        <Navbar />
        <div className="flex h-screen w-full pt-24">
          <div className="w-1/2 p-6 bg-[hsl(206,87%,15%)] text-white">
          <div className='h-[700px]'>
            <h2 className="text-xl font-bold">Inserir ficheiro .zip:</h2>
            <Dragger {...props} className="mt-4 invert">
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Clique ou arraste o arquivo para esta área para fazer o upload</p>
            </Dragger>
            
            {uploadStatus && <div className="mt-4">{uploadStatus}</div>}
          </div>
          </div>
          <div className="w-1/2 bg-[hsl(206,87%,15%)] text-white justify-center content-center">
          <div className='w-[98%] bg-white rounded-[20px] px-6 py-20'>
            <h2 className="text-xl font-bold text-[hsl(206,87%,15%)]">Para submeter uma nova rua é necessário submeter uma pasta .zip com o seguinte formato:</h2>
            <div className="mt-4 bg-white text-black rounded">
              <pre className="bg-[hsl(206,87%,15%)] rounded-[20px] text-white p-4">
                .zip
                <br /> ├── texto/
                <br /> ├── imagem/
                <br /> └── atual/
              </pre>
            </div>
            <h3 className="mt-4 text-xl font-bold text-[hsl(206,87%,15%)]">A pasta texto deve conter ficheiros XML sobre cada rua no seguinte formato:</h3>
            <div className="mt-4 bg-white text-black rounded">
                <pre className="bg-[hsl(206,87%,15%)] rounded-[20px] text-white p-4">
                    {'<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" elementFormDefault="qualified">\n   ...   \n</xs:schema>'}
                    <br></br>
                    <button className="mt-4 bg-white rounded-[20px] text-[hsl(206,87%,15%)]  py-2 px-4 hover:bg-[hsl(206,87%,25%)]" onClick={downloadXSD}>
                    Baixar XSD  ↓
                    </button>
                </pre>
            </div>
            <h3 className="mt-4 text-lg font-bold text-[hsl(206,87%,15%)]">A pasta atual deve conter as fotos atuais da rua no formato:</h3>
            <div className="mt-4 bg-white text-black rounded">
              <pre className="bg-[hsl(206,87%,15%)] rounded-[20px] text-white p-4">{'<Número da rua>-<Nome da Rua>-Vista<n>.(jpg|png|jpeg)'}</pre>
            </div>
            <h3 className="mt-4 text-lg font-bold text-[hsl(206,87%,15%)]">A pasta imagem deve conter as imagens das figuras presentes nos respetivos XML da rua no formato:</h3>
            <div className="mt-4 bg-white text-black rounded">
              <pre className="bg-[hsl(206,87%,15%)] rounded-[20px] text-white p-4">{'MRB-<Número da rua>-<Nome da Rua>.(jpg|png|jpeg)'}</pre>
            </div>
          </div>
          </div>
        </div>
      </main>
    </Layout>
    </WithRoleProtection>
  );
};

export default AdicionarRuaPage;
