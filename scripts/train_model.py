import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.ai.model_manager import ModelManager
from backend.preprocessing.pipeline import PreprocessingPipeline
from backend.utils.logger import logger


def main():
    logger.info("=" * 50)
    logger.info("SmartFactory Guardian - Model Training")
    logger.info("=" * 50)

    pipeline = PreprocessingPipeline()
    df = pipeline.load_csv()
    logger.info(f"Dataset shape: {df.shape}")
    logger.info(f"Columns: {list(df.columns)}")
    logger.info(f"Failure distribution:\n{df['failure_status'].value_counts()}")
    logger.info(f"Unique classes: {sorted(df['failure_status'].unique())}")

    mgr = ModelManager()
    mgr.load_or_train(df)
    logger.info("Training complete!")


if __name__ == "__main__":
    main()
