import { FarcasterEmbed } from "react-farcaster-embed";
import "react-farcaster-embed/dist/styles.css";
import { getCasts } from "@/app/lib/data";

export default async function Page({ params }: { params: { id: string } }) {
	const data = await getCasts(params.id, 0);

	return (
		<main className="flex min-h-screen flex-col items-center justify-between">
			<div className="flex flex-col min-h-screen max-w-xl overflow-y-auto border-border border-[0.5px]">
				<div className="px-4 h-14 flex flex-row items-center justify-between border-border border-b-[0.5px]">
					<h2 className="text-xl text-white font-bold">Explore</h2>
				</div>

				<div className="text-white">
					{data.map((cast) => (
						<FarcasterEmbed key={cast.hash} username="dwr" hash="0x48d47343" />
					))}
				</div>
			</div>
		</main>
	);
}
