import numpy as np


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    a = np.array(vec_a)
    b = np.array(vec_b)

    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return float(dot / (norm_a * norm_b))


def compute_skill_overlap(
    resume_skills: list[str], job_skills: list[str]
) -> dict:
    resume_set = {s.lower() for s in resume_skills}
    job_set = {s.lower() for s in job_skills}

    matched = resume_set & job_set
    missing = job_set - resume_set

    overlap_score = len(matched) / len(job_set) if job_set else 0.0

    return {
        "matched_skills": sorted(matched),
        "missing_skills": sorted(missing),
        "overlap_score": round(overlap_score, 3),
        "matched_count": len(matched),
        "total_required": len(job_set),
    }


def compute_match_score(
    semantic_score: float,
    skill_overlap: dict,
    semantic_weight: float = 0.6,
    skill_weight: float = 0.4,
) -> dict:
    combined = (
        semantic_score * semantic_weight
        + skill_overlap["overlap_score"] * skill_weight
    )

    return {
        "total_score": round(combined, 3),
        "semantic_score": round(semantic_score, 3),
        "skill_overlap": skill_overlap,
        "weights": {
            "semantic": semantic_weight,
            "skill": skill_weight,
        },
    }