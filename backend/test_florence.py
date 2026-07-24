import torch
from transformers import AutoProcessor, AutoModelForCausalLM
from PIL import Image

MODEL_ID = "microsoft/Florence-2-base"

print("Loading processor...")
processor = AutoProcessor.from_pretrained(MODEL_ID, trust_remote_code=True)

print("Loading model...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    trust_remote_code=True,
)

model.eval()

print("\n✅ Florence-2 loaded successfully!")

print(f"PyTorch version: {torch.__version__}")
print(f"Running on: {'CUDA' if torch.cuda.is_available() else 'CPU'}")