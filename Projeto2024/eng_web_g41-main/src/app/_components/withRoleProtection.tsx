"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type WithRoleProtectionProps = {
  role: string;
  children: React.ReactNode;
};

const WithRoleProtection: React.FC<WithRoleProtectionProps> = ({ role, children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
    } else if (session?.user?.role !== role) {
      router.push("/");
    }
  }, [session, status]);

  return <>{children}</>;
};

export default WithRoleProtection;