"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from 'antd';
import { api } from '../../trpc/react';
import { useSession } from 'next-auth/react';

const Register = () => {


    const session = useSession();
    const router = useRouter();

    if (session.data) {
        router.push('/');
    }

    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [surname, setSurname] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const registerMutation = api.user.register.useMutation({
            onError: (error) => {
                if (error.data?.zodError) {
                    const zodErrors = error.data.zodError.fieldErrors;
                    if (zodErrors.password) {
                        setError(zodErrors.password[1] || null);
                    }
                }
            },
            onSuccess: () => {
                setError(null);
                router.push('/');
            }
        });
    
      const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
    
        registerMutation.mutate({
          username,
          password,
          email,
          name,
          surname,
        });
      };

  return (
    <div className="flex flex-col items-center justify-center">
        <div className='text-3xl font-bold mt-6 text-white'>REGISTO</div>
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
            <Input
                placeholder="Email" 
                className='w-60 m-2'
                onChange={(e) => setEmail(e.target.value)}
            />
            <Input
                placeholder="Nome" 
                className='w-60 m-2'
                onChange={(e) => setName(e.target.value)}
            />
            <Input
                placeholder="Apelido"
                className='w-60 m-2'
                onChange={(e) => setSurname(e.target.value)}
            />
            <Button type="primary" htmlType='submit' className='w-36 m-2'>Registar</Button>
        </form>
    </div>
  );
}

export default Register;