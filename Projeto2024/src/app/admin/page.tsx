import Layout from "../layout";

import WithRoleProtection from "../_components/withRoleProtection";
import Navbar from "../_components/Navbar";


export default async function Home() {

  return (
    <WithRoleProtection role="admin">
        <Layout>
          <main className="flex h-screen flex-col items-center justify-center bg-white text-black">
            <div className='z-50'>
              <Navbar/>
            </div>
            <div className='flex h-full w-full pt-24 pr-6 pl-6 pb-6 rounded-xl z-0'>
              <h1 className="text-4xl font-bold">Admin</h1>
              
            </div>
          </main>
        </Layout>
    </WithRoleProtection>
  );
}
