from fastapi import FastAPI
from events import latest_index, load_index, load_clusters

app = FastAPI()

# Load the data
timestamp = latest_index()
df = load_index(timestamp)
clusters_df = load_clusters()


@app.get("/clusters/")
async def read_clusters():
    return clusters_df.to_dict(orient="records")


@app.get("/cluster/{cluster_id}")
def read_cluster(cluster_id: int, start: int = 0):
    cluster_df = df[df.cluster == cluster_id]
    filtered_cluster_df = cluster_df[["hash", "fid", "timestamp", "text"]]
    return filtered_cluster_df.iloc[start : start + 20].to_dict(orient="records")
