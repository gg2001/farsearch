import Event from "@/components/event";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between">
			<div className="flex flex-col min-h-screen max-w-xl overflow-y-auto border-border border-x-[0.5px]">
				<div className="px-4 h-14 flex flex-row items-center justify-between border-border border-b-[0.5px]">
					<h2 className="text-xl text-white font-bold">Explore</h2>
				</div>

				<Event
					title="OpenAI's 'im-a-good-gpt2-chatbot' & 'im-also-a-good-gpt2-chatbot' Debut"
					time="2 hours ago"
					description="In a surprising move, OpenAI unveiled two new GPT-2 chatbot models, sparking excitement and speculation in the AI community ..."
					category="Technology"
				/>
			</div>
		</main>
	);
}
