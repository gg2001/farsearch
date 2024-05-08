const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export interface Cluster {
	cluster: number;
	summary: string;
	headline: string;
}

export async function getClusters(): Promise<Cluster[]> {
	console.log(`${API_URL}/clusters/`);
	const res = await fetch(`${API_URL}/clusters/`);

	if (!res.ok) {
		throw new Error("Failed to fetch data");
	}

	return res.json();
}

export interface Casts {
	cluster?: Cluster;
	casts: Cast[];
	casts_data: CastData[];
	users_data: UserData[];
}

export interface Cast {
	hash: string;
	fid: number;
	timestamp: string;
	text: string;
}

interface CastData {
	type: string;
	fid: number;
	timestamp: number;
	network: string;
	castAddBody: {
		parentUrl?: string;
		text: string;
		embeds?: { url: string }[];
	};
	hash: string;
	hashScheme: string;
	signature: string;
	signatureScheme: string;
	signer: string;
}

interface UserData {
	timestamp: number;
	name: string;
	owner: string;
	signature: string;
	fid: number;
	type: string;
}

export async function getCasts(id: string, start: number): Promise<Casts> {
	const res = await fetch(`${API_URL}/cluster/${id}?start=${start}`);

	if (!res.ok) {
		throw new Error("Failed to fetch data");
	}

	const data: Casts = await res.json();

	return data;
}
