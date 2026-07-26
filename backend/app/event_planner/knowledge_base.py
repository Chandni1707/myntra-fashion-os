from pathlib import Path

def load_documents():
    docs = []

    knowledge_dir = Path(__file__).parent / "knowledge"

    for md in knowledge_dir.rglob("*.md"):
        docs.append({
            "title": md.stem,
            "content": md.read_text(encoding="utf-8")
        })

    return docs