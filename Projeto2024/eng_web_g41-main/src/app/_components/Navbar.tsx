"use client";

import Link from "next/link";
import { Button } from "antd";
import Image from "next/image";
import { SearchOutlined } from "@ant-design/icons";
import { useState } from "react";

import LoginPopup from "../_components/LoginPopup";
import { useSession } from "next-auth/react";

const Navbar = () => {

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const session = useSession();
  console.log(session?.data?.user);


  return (
      <div id="navbar" className="fixed top-0 left-0 right-0 z-10 bg-white/90">
        <div className="flex items-center justify-between p-2">
            <Link href="/" className="text-2xl font-bold flex items-center">
              <div className=" pr-2">
              <Image src="/imgs/cmbraga.jpg" width={50} height={50} alt="Logo CM Braga"/>
              </div>
              Braga <span className="text-[hsl(216,88%,48%)]">City</span>
            </Link>
            <div className="flex gap-12">
              { (session.data) ? (
                <Link href="/posts" className="text-lg">
                  Posts
                </Link>
              ) : null
              }
              <Link href="/freguesias" className="text-lg">
                Freguesias
              </Link>
              <Link href="/ruas" className="text-lg">
                Ruas
              </Link>
              <Link href="/contactos" className="text-lg">
                Contactos
              </Link>
            {
              (session.data && (session.data.user.role === "admin")) ? (
                <Link href="/admin" className="text-lg">
                  Admin
                </Link>
              ) : null
            }
            {
              (session.data && (session.data.user.role === "user")) ? (
                <Link href="/perfil" className="text-lg">
                  Perfil
                </Link>
              ) : null
            }
            </div>
            <div className="flex gap-4">
              <Button type="text" shape="circle" icon={<SearchOutlined />} size="large" />
              <Button type="text" shape="circle" icon={<Image src="/imgs/defaultavatar.png" width={20} height={45} alt="Avatar" />} className="mr-4" size="large" onClick={togglePopup}/>
            </div>
        </div>
        <LoginPopup isOpen={isPopupOpen} onClose={togglePopup} />
      </div>
    );
}

export default Navbar;