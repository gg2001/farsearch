import os
import time
import argparse
import numpy as np
from sklearn.cluster import KMeans
import pandas as pd
from utils import client, vlite_embed, fetch_casts, casts_df


FETCH_DAYS = 14  # How far back we want to index the casts
CLUSTERS = 10  # How many clusters to group the casts into
KMEANS_RANDOM_STATE = 42  # Random state for reproducibility
REFRESH_INTERVAL = 24 * (60 * 60)  # How often to refresh the index in seconds
DATA_FOLDER = "data"  # Folder to store the indexed data


def embed_casts(df: pd.DataFrame):
    # Embed all texts in the DataFrame
    df = df[df["text"].notnull()]
    df["embedding"] = df["text"].apply(vlite_embed)

    # Fit the embeddings to a K-Means model and group the casts into clusters
    kmeans = KMeans(
        n_clusters=CLUSTERS, init="k-means++", random_state=KMEANS_RANDOM_STATE
    )
    matrix = np.vstack(df.embedding.values)
    kmeans.fit(matrix)
    labels = kmeans.labels_
    df["cluster"] = labels


def latest_index() -> int:
    if not os.path.exists(DATA_FOLDER):
        os.makedirs(DATA_FOLDER)

    files = os.listdir(DATA_FOLDER)
    integers = [int(file.split(".")[0]) for file in files if file.endswith(".csv")]

    return max(integers) if len(integers) > 0 else 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process embedding option.")
    parser.add_argument(
        "--embed",
        action="store_true",
        help="Trigger embedding if not present in DataFrame",
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
        df.to_csv(f"{DATA_FOLDER}/{now}.csv")
        print(f"Wrote {DATA_FOLDER}/{now}.csv with {len(df)} casts.")
        timestamp = now
    else:
        print(
            f"Loading data from {DATA_FOLDER}/{timestamp}.csv ({now - timestamp}s ago)."
        )
        df = pd.read_csv(f"{DATA_FOLDER}/{timestamp}.csv")

    # Embed the casts and group them into clusters
    if args.embed or "embedding" not in df.columns:
        print(f"Embedding {len(df)} casts...")
        embed_casts(df)
        df.to_csv(f"{DATA_FOLDER}/{timestamp}.csv")
        print(f"Wrote embeddings to {DATA_FOLDER}/{timestamp}.csv.")

    print(df.head())

    # Categorizing the clusters into events
    rev_per_cluster = 10

    for i in range(CLUSTERS):
        print(f"Cluster {i} Theme:", end=" ")

        reviews = "\n".join(
            df[df.cluster == i]
            .text.sample(rev_per_cluster, replace=True, random_state=42)
            .values
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
            rev_per_cluster, replace=True, random_state=42
        )
        for j in range(rev_per_cluster):
            print(sample_cluster_rows.text.str[:70].values[j])

        print("-" * 100)
