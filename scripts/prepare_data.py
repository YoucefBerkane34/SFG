import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import pandas as pd

from backend.config import Config
from backend.utils.logger import logger

SENSOR_FIELDS = Config.SENSOR_FIELDS


def load_raw():
    path = Config.CSV_PATH
    df = pd.read_csv(path)
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    logger.info(f"Loaded {len(df)} rows from {path}")
    return df


def generate_warning_samples(df, n_warning=None):
    normal = df[df["failure_status"] == 0].copy()
    failure = df[df["failure_status"] == 1].copy()
    n = n_warning or len(normal)

    warnings = []
    for _ in range(n):
        n_row = normal.sample(1).iloc[0]
        f_row = failure.sample(1).iloc[0]
        alpha = np.random.uniform(0.3, 0.7)
        warn = {}
        for col in SENSOR_FIELDS:
            warn[col] = (1 - alpha) * n_row[col] + alpha * f_row[col]
        warn["failure_status"] = 1
        warn["machine_id"] = n_row.get("machine_id", "M001")
        warn["timestamp"] = pd.Timestamp.now() - pd.Timedelta(
            seconds=np.random.randint(0, 10000)
        )
        warnings.append(warn)

    warn_df = pd.DataFrame(warnings)
    warn_df["failure_status"] = 1

    df_mapped = df.copy()
    df_mapped["failure_status"] = df_mapped["failure_status"].map({0: 0, 1: 2})

    result = pd.concat([df_mapped, warn_df], ignore_index=True)
    result = result.drop_duplicates(subset=SENSOR_FIELDS + ["failure_status"])

    failure_mask = result["failure_status"] == 2
    warning_mask = result["failure_status"] == 1

    logger.info(
        f"Final distribution — Normal: {(result['failure_status']==0).sum()}, "
        f"Warning: {warning_mask.sum()}, "
        f"Failure: {failure_mask.sum()}"
    )
    return result


def save_prepared(df):
    out_path = os.path.join(
        os.path.dirname(Config.CSV_PATH),
        "machine_failure_3class.csv",
    )
    df.to_csv(out_path, index=False)
    logger.info(f"Saved prepared dataset to {out_path}")
    return out_path


if __name__ == "__main__":
    df = load_raw()
    logger.info(f"Original failure distribution:\n{df['failure_status'].value_counts()}")
    df_prepared = generate_warning_samples(df)
    save_prepared(df_prepared)
