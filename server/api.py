from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from events import latest_index, load_index, load_clusters

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
def read_cluster(cluster_id: int, start: int = 0):
    cluster = clusters_df[clusters_df.cluster == cluster_id]

    cluster_df = df[df.cluster == cluster_id]
    filtered_cluster_df = cluster_df[["hash", "fid", "timestamp", "text"]]
    return {
        "cluster": cluster.to_dict(orient="records")[0] if not cluster.empty else {},
        "casts": filtered_cluster_df.iloc[start : start + 20].to_dict(orient="records"),
    }
