import Image from "next/image";
import Layout from "./layout";

import Search from 'antd/es/input/Search';
import Navbar from "./_components/Navbar";

export default async function Home() {

  return (
    <Layout>
      <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">
        <Navbar />
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 ">
          <Image src="/imgs/cmbraga.jpg" width={200} height={200} alt="Logo CM Braga"/>
          <div className="text-4xl font-bold">
          Braga<span className="text-[hsl(216,88%,48%)]">City</span>
          </div>
          <div className="m-12 text-3xl text-white p-6 bg-[hsl(216,88%,48%)] rounded-[20px]">
            Bem vindo às ruas de Braga!
          </div>
        </div>
      </main>
    </Layout>
  );
}
