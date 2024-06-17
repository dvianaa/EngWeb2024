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
          <div className="flex items-center justify-center">
            <Search
              size="large"
              placeholder="Pesquisar..." 
              allowClear
              enterButton
              className="w-96 border border-[hsl(215,100%,55%)] rounded-lg m-8"
            />
          </div>
        </div>
      </main>
    </Layout>
  );
}
