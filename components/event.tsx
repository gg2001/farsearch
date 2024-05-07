export default function Event({
	title,
	description,
	time,
	category,
}: { title: string; description: string; time: string; category: string }) {
	return (
		<div className="p-4 border-border border-y-[0.5px] hover:bg-hover">
			<h2 className="text-lg font-bold text-white">{title}</h2>
			<p className="mt-2 text-sm text-gray">{description}</p>
			<div className="mt-4">
				<span className="text-xs font-semibold text-gray">{time}</span>
				<span className="text-xs font-semibold text-gray ml-1 mr-1">·</span>
				<span className="text-xs font-semibold text-gray">{category}</span>
			</div>
		</div>
	);
}
