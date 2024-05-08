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

interface Proof {
	timestamp: number;
	name: string;
	owner: string;
	signature: string;
	fid: number;
	type: string;
}

interface ProofsContainer {
	proofs: Proof[];
}

export async function getProofs(fid: number): Promise<ProofsContainer> {
	const res = await fetch(
		`http://143.198.229.42:2281/v1/userNameProofsByFid?fid=${fid}`,
	);

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
	username?: string;
}

export interface Casts {
	cluster?: Cluster;
	casts: Cast[];
}

export async function getCasts(id: string, start: number): Promise<Casts> {
	const res = await fetch(`http://127.0.0.1:8000/cluster/${id}?start=${start}`);

	if (!res.ok) {
		throw new Error("Failed to fetch data");
	}

	const data: Casts = await res.json();

	return data;
}
