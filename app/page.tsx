import Event from "@/components/event";

interface Cluster {
	cluster: number;
	summary: string;
	headline: string;
}

async function getClusters(): Promise<Cluster[]> {
	const res = await fetch("http://127.0.0.1:8000/clusters/");

	if (!res.ok) {
		throw new Error("Failed to fetch data");
	}

	return res.json();
}

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
						<Event
							key={cluster.cluster}
							title={cluster.summary}
							description={cluster.headline}
							time="2 hours ago"
							category="Technology"
						/>
					))}
				</div>
			</div>
		</main>
	);
}
