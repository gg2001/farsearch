import os
import time
import argparse
import numpy as np
from sklearn.cluster import KMeans
import pandas as pd
from utils import client, vlite_embed, fetch_casts, casts_df


FETCH_DAYS = 14  # How far back we want to index the casts
CLUSTERS = 10  # How many clusters to group the casts into
SAMPLE_PER_CLUSTER = 10  # The number of casts to sample per cluster
RANDOM_STATE = 42  # Random state for reproducibility
REFRESH_INTERVAL = 24 * (60 * 60)  # How often to refresh the index in seconds
DATA_FOLDER = "data"  # Folder to store the indexed data


def embed_casts(df: pd.DataFrame):
    # Filter out rows where text is null and directly modify the DataFrame
    df.dropna(subset=["text"], inplace=True)

    # Apply embedding to the 'text' column and store it in a new 'embedding' column
    df.loc[:, "embedding"] = df["text"].apply(vlite_embed)


def fit_clusters(df: pd.DataFrame):
    # Fit the embeddings to a K-Means model and group the casts into clusters
    kmeans = KMeans(n_clusters=CLUSTERS, init="k-means++", random_state=RANDOM_STATE)
    matrix = np.vstack(df["embedding"].values)
    kmeans.fit(matrix)
    labels = kmeans.labels_

    # Assign cluster labels to the 'cluster' column
    df.loc[:, "cluster"] = labels


def latest_index() -> int:
    if not os.path.exists(DATA_FOLDER):
        os.makedirs(DATA_FOLDER)

    files = os.listdir(DATA_FOLDER)
    integers = [int(file.split(".")[0]) for file in files if file.endswith(".csv")]

    return max(integers) if len(integers) > 0 else 0


def write_index(df: pd.DataFrame, timestamp: int):
    df.to_csv(f"{DATA_FOLDER}/{timestamp}.csv")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process embedding option.")
    parser.add_argument(
        "--embed",
        action="store_true",
        help="Trigger embedding if not present in DataFrame",
    )
    parser.add_argument(
        "--clusters",
        action="store_true",
        help="Trigger clustering if not present in DataFrame",
    )
    args = parser.parse_args()

    timestamp = latest_index()
    now = int(time.time())

    df: pd.DataFrame = None
    if timestamp == 0 or now - timestamp > REFRESH_INTERVAL:
        # Load the casts from the database
        print("Fetching casts...")
        casts = fetch_casts(FETCH_DAYS)
        df = casts_df(casts)
        write_index(df, now)
        print(f"Wrote {DATA_FOLDER}/{now}.csv with {len(df)} casts.")
        timestamp = now
    else:
        print(
            f"Loading data from {DATA_FOLDER}/{timestamp}.csv ({now - timestamp}s ago)."
        )
        df = pd.read_csv(f"{DATA_FOLDER}/{timestamp}.csv")

    # Embed the casts
    if args.embed or "embedding" not in df.columns:
        print(f"Embedding {len(df)} casts...")
        embed_casts(df)
        write_index(df, timestamp)
        print(f"Wrote embeddings to {DATA_FOLDER}/{timestamp}.csv.")

    # Group the casts into clusters
    if args.clusters or "cluster" not in df.columns:
        print(f"Fitting {len(df)} casts into {CLUSTERS} clusters...")
        fit_clusters(df)
        write_index(df, timestamp)
        print(f"Wrote clusters to {DATA_FOLDER}/{timestamp}.csv.")

    print(df.head())

    for i in range(CLUSTERS):
        print(f"Cluster {i} Theme:", end=" ")

        cluster_df = df[df.cluster == i]
        sample_size = min(len(cluster_df), SAMPLE_PER_CLUSTER)
        reviews = "\n".join(
            cluster_df.text.sample(
                sample_size, replace=False, random_state=RANDOM_STATE
            ).values
        )

        messages = [
            {
                "role": "user",
                "content": f'What do the following tweets have in common? Try to be as specific as possible.\n\nUser tweets:\n"""\n{reviews}\n"""\n\nTheme:',
            }
        ]

        response = client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            temperature=0,
            max_tokens=64,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0,
        )
        print(response.choices[0].message.content.replace("\n", ""))

        sample_cluster_rows = df[df.cluster == i].sample(
            SAMPLE_PER_CLUSTER, replace=True, random_state=42
        )
        for j in range(SAMPLE_PER_CLUSTER):
            print(sample_cluster_rows.text.str[:70].values[j])

        print("-" * 100)
