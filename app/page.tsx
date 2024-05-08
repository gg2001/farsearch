import Event from "@/components/event";
import { getClusters } from "@/app/lib/data";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const images: Record<number, string> = {
	1: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/b5233fe1-1724-4f7a-abfb-93d88e278600/original",
	7: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/250980bd-752a-4300-523e-b8271e029100/original",
	25: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/36d2a3aa-8c3d-4e93-ef75-c3a0fb67b200/original",
};

export default async function Home() {
	const data = await getClusters();

	return (
		<main className="flex min-h-screen flex-col items-center justify-between">
			<div className="flex flex-col min-h-screen max-w-xl overflow-y-auto border-border border-[0.5px]">
				<div className="px-4 h-14 flex flex-row items-center justify-between border-border border-b-[0.5px]">
					<h2 className="text-xl text-white font-bold">Explore</h2>
				</div>

				<div>
					{data.map((cluster) => (
						<Link key={cluster.cluster} href={`/cluster/${cluster.cluster}`}>
							<Event
								title={cluster.summary}
								description={cluster.headline}
								time={
									cluster.median_timestamp
										? formatDistanceToNow(new Date(cluster.median_timestamp), {
												addSuffix: true,
										  })
										: ""
								}
								category={cluster.category}
								image={images[cluster.cluster]}
							/>
						</Link>
					))}
				</div>
			</div>
		</main>
	);
}
