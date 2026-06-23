from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")


def generate_embedding(text: str) -> list[float]:
    text = text.strip()
    if not text:
        raise ValueError("Cannot generate embedding for empty text")

    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def generate_embeddings_batch(texts: list[str]) -> list[list[float]]:
    texts = [t.strip() for t in texts if t.strip()]
    if not texts:
        return []

    embeddings = model.encode(texts, normalize_embeddings=True)
    return embeddings.tolist()


def build_job_text(title: str, company: str, description: str, skills: list[str]) -> str:
    parts = [
        f"Job Title: {title}",
        f"Company: {company}",
        f"Description: {description}",
    ]
    if skills:
        parts.append(f"Required Skills: {', '.join(skills)}")
    return "\n".join(parts)


def build_resume_text(raw_text: str, skills: list[str]) -> str:
    parts = [raw_text]
    if skills:
        parts.append(f"Key Skills: {', '.join(skills)}")
    return "\n".join(parts)