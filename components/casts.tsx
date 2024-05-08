"use client";

import { useEffect, useState } from "react";
import { Casts, getCasts } from "@/app/lib/data";
import Link from "next/link";

type CastListProps = {
	initialCasts: Casts;
	clusterId: string;
};

export default function CastList({ initialCasts, clusterId }: CastListProps) {
	const [casts, setCasts] = useState<Casts>(initialCasts);
	const [start, setStart] = useState(initialCasts?.casts?.length ?? 0);
	const [hasMore, setHasMore] = useState(true);

	useEffect(() => {
		const handleScroll = async () => {
			if (
				window.innerHeight + document.documentElement.scrollTop >=
				document.documentElement.offsetHeight
			) {
				try {
					const data = await getCasts(clusterId, start);
					setCasts((prevCasts) => ({
						...prevCasts,
						casts: [...prevCasts.casts, ...data.casts],
						casts_data: [...prevCasts.casts_data, ...data.casts_data],
						users_data: [...prevCasts.users_data, ...data.users_data],
					}));
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
			{casts?.casts?.map((cast, index) =>
				cast.hash && casts?.users_data?.[index]?.name ? (
					<Link
						key={cast.hash}
						href={`https://warpcast.com/${
							casts.users_data[index].name
						}/${`0x${cast.hash}`}`}
					>
						<div className="border-border border-[0.5px] hover:bg-hover p-4 cursor-pointer">
							<div className="flex items-center gap-3">
								<div className="bg-gray rounded-full w-10 h-10" />
								<div className="flex-1">
									<div className="font-bold text-gray-200">
										@{casts.users_data[index].name ?? "username"}
									</div>{" "}
									<div className="text-gray-400 text-sm">
										{new Date(cast.timestamp).toLocaleTimeString()}
									</div>
								</div>
							</div>
							<div className="mt-2">{cast.text}</div>
							<div className="flex gap-4 mt-3">
								<span className="cursor-pointer hover:text-gray-300">🔁</span>
								<span className="cursor-pointer hover:text-red-500">❤️</span>
								<span className="cursor-pointer hover:text-blue-400">📢</span>
							</div>
						</div>
					</Link>
				) : null,
			)}
			{hasMore && <div>Loading more...</div>}
		</div>
	);
}
