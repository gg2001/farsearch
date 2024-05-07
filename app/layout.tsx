import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Farsearch",
	description: "Farsearch",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={"font-system bg-background"}>{children}</body>
		</html>
	);
}
