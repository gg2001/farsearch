import aiohttp
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from events import latest_index, load_index, load_clusters
from utils import HUB_URL

CAST_LIMIT = 20  # Max amount of casts to return

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the data
timestamp = latest_index()
df = load_index(timestamp)
clusters_df = load_clusters()


@app.get("/clusters/")
async def read_clusters():
    return clusters_df.to_dict(orient="records")


@app.get("/cluster/{cluster_id}")
async def read_cluster(cluster_id: int, start: int = 0):
    cluster = clusters_df[clusters_df.cluster == cluster_id]

    cluster_df = df[df.cluster == cluster_id]
    filtered_cluster_df = cluster_df[["hash", "fid", "timestamp", "text"]].iloc[
        start : start + CAST_LIMIT
    ]
    casts = filtered_cluster_df.to_dict(orient="records")

    async def fetch_cast_data(session, fid, hash):
        async with session.get(
            f"{HUB_URL}/v1/castById?fid={fid}&hash={hash}"
        ) as response:
            if response.status == 200:
                return await response.json()
            else:
                return None

    async def fetch_all_casts():
        async with aiohttp.ClientSession() as session:
            tasks = [
                fetch_cast_data(session, row["fid"], row["hash"])
                for index, row in filtered_cluster_df.iterrows()
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            return results  # This maintains the order of tasks as they were initiated

    casts_data = await fetch_all_casts()

    return {
        "cluster": cluster.to_dict(orient="records")[0] if not cluster.empty else {},
        "casts": casts,
        "casts_data": casts_data,
    }
