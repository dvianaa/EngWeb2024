"use client";

import React from 'react';
import { useState, FormEvent } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

import { Button, Input } from 'antd';

const LoginPopup = ({ isOpen, onClose} : { isOpen: boolean, onClose: () => void }) => {

    if (!isOpen) return (<></>);

    const session = useSession();
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    console.log(session)

    const handleSignOut = async () => {
        await signOut();
        window.location.reload();
    }

    if (session.data) {
        return (
            <div className='relative'>
                <div className='flex flex-col items-center justify-center text-white h-72 w-96 absolute right-9 bg-[hsl(206,87%,15%)] rounded-l-3xl rounded-b-3xl'>
                    <div className='text-xl font-bold mt-6 mb-12'>Bem vindo, {session.data?.user.name}</div>
                    <Button type="primary" onClick={handleSignOut}>Logout</Button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: FormEvent) => {
            e.preventDefault();
            const result = await signIn('credentials', {
                username,
                password,
                redirect: false,
            });
            if (result && result.error) {
                console.error('Login failed:', result?.error);
            }
            window.location.reload();
        };
    
    return (
        <div className='relative'>
            <div className='flex flex-col items-center text-white h-72 w-96 absolute right-9 bg-[hsl(206,87%,15%)] rounded-l-3xl rounded-b-3xl'>
                <div className='text-xl font-bold mt-6'>LOGIN</div>
                <form onSubmit={handleSubmit} className='flex flex-col items-center'>
                    <Input 
                        placeholder="Username" 
                        className='w-60 mt-6 mb-2'
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input.Password 
                        placeholder="Password" 
                        className='w-60 m-2'
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button type="primary" htmlType='submit' className='w-36 mb-8 mt-2'>Login</Button>
                    <Button type="primary" href='/registo' className=' text-white'>Regista-te aqui</Button>
                </form>
            </div>
        </div>
      );
  }
  
  export default LoginPopup;