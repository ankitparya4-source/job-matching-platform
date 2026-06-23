import re
import spacy
import pdfplumber
from pathlib import Path
from app.data.skills import TECH_SKILLS, SOFT_SKILLS, EDUCATION_KEYWORDS

nlp = spacy.load("en_core_web_sm")


def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


def extract_email(text: str) -> str | None:
    pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    match = re.search(pattern, text)
    return match.group(0) if match else None


def extract_phone(text: str) -> str | None:
    pattern = r"[\+]?[\d\s\-\(\)]{10,15}"
    match = re.search(pattern, text)
    if match:
        cleaned = re.sub(r"[^\d+]", "", match.group(0))
        if len(cleaned) >= 10:
            return cleaned
    return None


def extract_skills(text: str) -> dict:
    text_lower = text.lower()
    doc = nlp(text_lower)

    tokens = set()
    for token in doc:
        tokens.add(token.text)
        tokens.add(token.lemma_)

    # Also check bigrams and trigrams for multi-word skills
    words = text_lower.split()
    for i in range(len(words)):
        for n in range(2, 4):
            if i + n <= len(words):
                phrase = " ".join(words[i:i + n])
                tokens.add(phrase)

    found_tech = []
    for skill in TECH_SKILLS:
        if skill in tokens or skill in text_lower:
            found_tech.append(skill)

    found_soft = []
    for skill in SOFT_SKILLS:
        if skill in tokens or skill in text_lower:
            found_soft.append(skill)

    return {
        "technical": sorted(set(found_tech)),
        "soft": sorted(set(found_soft)),
    }


def extract_education(text: str) -> list[dict]:
    entries = []
    lines = text.split("\n")

    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        if not line_lower:
            continue

        matched_keywords = [kw for kw in EDUCATION_KEYWORDS if kw in line_lower]
        if len(matched_keywords) >= 1:
            context = line.strip()
            # Grab the next line for additional context
            if i + 1 < len(lines) and lines[i + 1].strip():
                context += " | " + lines[i + 1].strip()

            entries.append({
                "text": context[:200],
                "keywords": matched_keywords,
            })

    return entries[:5]


def extract_experience_years(text: str) -> float | None:
    patterns = [
        r"(\d+)\+?\s*years?\s*(?:of\s+)?experience",
        r"experience\s*(?:of\s+)?(\d+)\+?\s*years?",
        r"(\d+)\+?\s*years?\s*(?:in|of|working)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text.lower())
        if match:
            return float(match.group(1))
    return None


def parse_resume(file_path: str) -> dict:
    raw_text = extract_text_from_pdf(file_path)

    if not raw_text or len(raw_text) < 50:
        raise ValueError("Could not extract meaningful text from the PDF")

    skills = extract_skills(raw_text)
    education = extract_education(raw_text)
    experience_years = extract_experience_years(raw_text)
    email = extract_email(raw_text)
    phone = extract_phone(raw_text)

    return {
        "raw_text": raw_text,
        "skills": skills,
        "education": education,
        "experience_years": experience_years,
        "contact": {
            "email": email,
            "phone": phone,
        },
        "word_count": len(raw_text.split()),
    }