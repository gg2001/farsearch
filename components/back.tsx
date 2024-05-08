"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
	const router = useRouter();

	const handleGoBack = () => {
		if (window.history.length > 1) {
			router.back();
		} else {
			router.push("/");
		}
	};

	return (
		<button onClick={handleGoBack} type="button">
			<h2 className="text-xl text-white font-bold">&larr; Back</h2>
		</button>
	);
}
