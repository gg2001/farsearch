import Image from "next/image";

export default function Event({
	title,
	description,
	time,
	category,
	image,
}: {
	title: string;
	description: string;
	time: string;
	category: string;
	image?: string;
}) {
	return (
		<div className="p-4 border-border border-b-[0.5px] hover:bg-hover flex items-start">
			<div className="pr-4">
				<h2 className="text-lg font-bold text-white">{title}</h2>
				<p className="mt-2 text-sm text-gray">{description}</p>
				<div className="mt-4">
					<span className="text-xs font-semibold text-gray">{time}</span>
					<span className="text-xs font-semibold text-gray ml-1 mr-1">·</span>
					<span className="text-xs font-semibold text-gray">{category}</span>
				</div>
			</div>
			{image && (
				<Image
					src={image}
					alt="Image"
					width={80}
					height={80}
					className="object-cover rounded"
				/>
			)}
		</div>
	);
}
