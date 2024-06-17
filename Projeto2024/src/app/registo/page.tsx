import Layout from "../layout";

import Navbar from "../_components/Navbar";
import Regiser_form from "../_components/Register_form";
import Image from 'next/image';

export default async function Home() {

  return (
    <Layout>
      <main className="flex h-screen flex-col items-center justify-center bg-white text-black">
        <Navbar/>
        <div className='flex h-full w-full pt-24'>
            <div className='flex justify-center w-1/2 bg-[hsl(206,87%,15%)] rounded-tl-3xl content-center'>
                <Regiser_form/>
            </div>
            <div className=' flex relative w-1/2 items-center justify-center'>
                <Image src="/imgs/braga.jpg" objectFit='cover' layout='fill' alt="Cidade de Braga" className='opacity-95'/>
                <div className="absolute inset-0 bg-white flex flex-col items-center justify-center rounded-2xl my-52 mx-80">
                    <Image src="/imgs/cmbraga.jpg" width={200} height={200} alt="Logo CM Braga"/>
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