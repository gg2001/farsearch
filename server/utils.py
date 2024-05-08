import os
import psycopg2
import pandas as pd
from openai import OpenAI
from vlite import EmbeddingModel
from dotenv import load_dotenv

load_dotenv()

HUB_URL = os.environ.get("HUB_URL")

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
model = EmbeddingModel(log_enabled=False)


def openai_embed(text: str, model="text-embedding-3-small", **kwargs) -> list[float]:
    text = text.replace("\n", " ")

    response = client.embeddings.create(input=[text], model=model, **kwargs)

    return response.data[0].embedding


def vlite_embed(text: str) -> list[float]:
    text = text.replace("\n", " ")

    return model.embed(text)[0].tolist()


def fetch_casts(days: int) -> list[tuple]:
    conn = psycopg2.connect(os.environ.get("PSYCOPG_URL"))
    cur = conn.cursor()

    cur.execute(
        f"SELECT * FROM casts WHERE timestamp >= NOW() - INTERVAL '{days} day'"
        if days > 0
        else "SELECT * FROM casts"
    )

    records = cur.fetchall()
    return records


def casts_df(casts: list[tuple]) -> pd.DataFrame:
    return pd.DataFrame(
        [(c[0], bytes(c[7]).hex(), c[5], c[3], c[12]) for c in casts],
        columns=["id", "hash", "fid", "timestamp", "text"],
    )
