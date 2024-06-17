import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import {Providers} from "./provider";

const metadata = {
  title: "BragaCity",
  description: "Exploring Braga's streets has never been easier!",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className={`${GeistSans.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
