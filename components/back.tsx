"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
	const router = useRouter();

	const handleGoBack = () => {
		router.back();
	};

	return (
		<button onClick={handleGoBack} type="button">
			<h2 className="text-xl text-white font-bold">&larr; Back</h2>
		</button>
	);
}
