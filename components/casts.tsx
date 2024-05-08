"use client";

import { useEffect, useState } from "react";
import { Casts, getCasts } from "@/app/lib/data";

type CastListProps = {
	initialCasts: Casts["casts"];
	clusterId: string;
};

export default function CastList({ initialCasts, clusterId }: CastListProps) {
	const [casts, setCasts] = useState<Casts["casts"]>(initialCasts);
	const [start, setStart] = useState(initialCasts.length);
	const [hasMore, setHasMore] = useState(true);

	useEffect(() => {
		const handleScroll = async () => {
			if (
				window.innerHeight + document.documentElement.scrollTop >=
				document.documentElement.offsetHeight
			) {
				try {
					const data = await getCasts(clusterId, start);
					setCasts((prevCasts) => [...prevCasts, ...data.casts]);
					setStart((prevStart) => prevStart + data.casts.length);
					setHasMore(data.casts.length > 0);
				} catch (error) {
					console.error("Failed to fetch data:", error);
				}
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [clusterId, start]);

	return (
		<div className="text-white">
			{casts.map((cast) => cast.hash && <div key={cast.hash}>{cast.text}</div>)}
			{hasMore && <div>Loading more...</div>}
		</div>
	);
}
