import json
import re
from functools import lru_cache

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL_NAME = "HuggingFaceTB/SmolLM2-360M-Instruct"


def get_device():
    return "cuda" if torch.cuda.is_available() else "cpu"


@lru_cache(maxsize=1)
def load_model():
    device = get_device()

    print("Loading SmolLM2...")

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        torch_dtype="auto"
    ).to(device)

    print("SmolLM2 loaded.")

    return tokenizer, model, device


def expand_fashion_intent(
    prompt: str,
    rag_context: str = ""
):

    tokenizer, model, device = load_model()
    if rag_context.strip():
        user_prompt = f"""
User Event:
{prompt}

Retrieved Fashion Knowledge:
{rag_context}

Using ONLY the retrieved knowledge, expand this into related fashion concepts.

Return ONLY short fashion concepts.
One per line.

Do not explain.
Do not answer the user.
Do not recommend specific products.
"""
    else:
        user_prompt = prompt

    messages = [
        {
            "role": "system",
        "content": (
            "You are an expert fashion stylist.\n"
            "Expand the user's fashion request into related fashion concepts.\n"
            "Return ONLY short phrases, one per line.\n"
            "Do not answer the user.\n"
            "Do not recommend products.\n"
            "Do not use bullets or numbering."
        ),
    },
    {
        "role": "user",
        "content": user_prompt,
    },
]

   
   

    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )

    inputs = tokenizer(
        text,
        return_tensors="pt"
    ).to(device)

    output = model.generate(
        **inputs,
        max_new_tokens=80,
        do_sample=False,
    )

    generated = output[0][inputs["input_ids"].shape[1]:]

    result = tokenizer.decode(
        generated,
        skip_special_tokens=True,
    ).strip()

    return result