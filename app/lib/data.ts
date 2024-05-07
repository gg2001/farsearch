export interface Cluster {
	cluster: number;
	summary: string;
	headline: string;
}

export async function getClusters(): Promise<Cluster[]> {
	const res = await fetch("http://127.0.0.1:8000/clusters/");

	if (!res.ok) {
		throw new Error("Failed to fetch data");
	}

	return res.json();
}

export interface Cast {
	hash: string;
	fid: number;
	timestamp: string;
	text: string;
}

export async function getCasts(id: string, start: number): Promise<Cast[]> {
	const res = await fetch(`http://127.0.0.1:8000/cluster/${id}?start=${start}`);

	if (!res.ok) {
		throw new Error("Failed to fetch data");
	}

	return res.json();
}
