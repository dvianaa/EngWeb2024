"use client";

import Layout from "../layout";
import Navbar from "../_components/Navbar";
import Image from 'next/image';

export default function Home() {
  return (
    <Layout>
      <main className="flex h-screen flex-col items-center justify-center bg-white text-black">
        <Navbar />
        <div className='flex h-full w-full pt-24'>
          <div className='w-1/2 bg-[hsl(206,87%,15%)] rounded-tl-3xl p-8 content-center'>
            <div className="mb-8 mt-8">
              <div className="flex flex-col items-center mb-4 text-white justify-center">
                <img className="h-[50px] mb-6 invert" src="imgs/companhia.png"/>
                <span className="text-xl font-bold">Empresa:</span>
              </div>
              <div className="flex items-center justify-center mb-[40px]">
                <div className="bg-white p-4 rounded-lg text-black w-[500px] text-center">
                    <p>BragaCity</p>
                    <p>Fax: 123-456-7890</p>
                </div>
              </div>
            </div>
            <div className="mb-8 mt-8">
              <div className="flex flex-col items-center mb-4 text-white justify-center">
                <img className="h-[50px] mb-6 invert" src="imgs/localizacao.png"/>
                <span className="text-xl font-bold">Visite-nos em:</span>
              </div>
              <div className="flex items-center justify-center mb-[40px]">
                <div className="bg-white p-4 rounded-lg text-black w-[500px] text-center">
                    <p>Rua das Águas 300, 4910-234 Braga, Portugal</p>
                </div>
              </div>
            </div>
            <div className="mb-8 mt-8">
              <div className="flex flex-col items-center mb-4 text-white justify-center">
                <img className="h-[50px] mb-6 invert" src="imgs/telefone-fixo.png"/>
                <span className="text-xl font-bold">Contacte-nos através de:</span>
              </div>
              <div className="flex items-center justify-center mb-[40px]">
                <div className="bg-white p-4 rounded-lg text-black w-[500px] text-center">
                    <p>Telemóvel: +351 938122523</p>
                    <p>Email: suporte@bragacity.com</p>
                </div>
              </div>
            </div>
          </div>
          <div className='flex relative w-1/2 items-center justify-center'>
            <Image
              src="/imgs/braga.jpg"
              objectFit='cover'
              layout='fill'
              alt="Cidade de Braga"
              className='opacity-95'
            />
            <div className="absolute inset-0 bg-white flex flex-col items-center justify-center rounded-2xl m-52 mx-80">
              <Image src="/imgs/cmbraga.jpg" width={200} height={200} alt="Logo CM Braga" />
              <div className="text-4xl font-bold">
                Braga<span className="text-[hsl(216,88%,48%)]">City</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
