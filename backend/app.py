from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, db
import pandas as pd
import numpy as np
from datetime import datetime
from flask_cors import CORS
import logging
import os
import re
from math import radians, sin, cos, sqrt, atan2
from sentence_transformers import SentenceTransformer, util

# Firebase Initialization
if not firebase_admin._apps:
    cred = credentials.Certificate("hireme-5716f-firebase-adminsdk-fbsvc-787a3ccebb.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://hireme-5716f-default-rtdb.firebaseio.com'
    })

# Flask App Setup
app = Flask(__name__)
CORS(app)

# Sentence-BERT model
model = SentenceTransformer('all-MiniLM-L6-v2')

@app.route('/')
def home():
    return "🚀 Hybrid Job Recommendation API is Running!"

@app.route('/health')
def health_check():
    try:
        db.reference("jobs").get()
        return jsonify({"status": "✅ Firebase connected."})
    except Exception as e:
        return jsonify({"status": f"❌ Firebase error: {str(e)}"}), 500

# -----------------------------
# Data Utilities
# -----------------------------

def parse_budget(budget_str):
    if isinstance(budget_str, (int, float)):
        return float(budget_str)
    if not isinstance(budget_str, str):
        return 0.0
    numbers = re.findall(r'\d+', budget_str.replace(',', ''))
    numbers = list(map(int, numbers))
    if not numbers:
        return 0.0
    return sum(numbers) / len(numbers)

def parse_experience_level(level_str):
    if not level_str or not isinstance(level_str, str):
        return [0, 0]
    level_str = level_str.lower().replace("to", "-")
    range_match = re.findall(r'(\d+)\s*[-–]\s*(\d+)', level_str)
    if range_match:
        start, end = map(int, range_match[0])
        return [start / 12, end / 12] if "month" in level_str else [start, end]
    value_match = re.findall(r'(\d+)', level_str)
    if value_match:
        value = int(value_match[0])
        return [value / 12, value / 12] if "month" in level_str else [value, value]
    return [0, 0]

def fetch_jobs(use_local=False):
    if use_local:
        try:
            print("📂 Loading jobs from local dataset.")
            df = pd.read_csv(r"C:\Users\desai\OneDrive\Desktop\MP\HIRE.me\backend\job_descriptions_15000.csv")
            df["experienceLevel"] = df["experienceLevel"].apply(parse_experience_level)
            df["budgetRange"] = df["budgetRange"].apply(parse_budget)
            return df
        except Exception as e:
            logging.error("Failed to load local dataset: %s", e)
            return pd.DataFrame()

    jobs_ref = db.reference("jobs/current")
    jobs_data = jobs_ref.get()
    if not jobs_data:
        return pd.DataFrame()
    job_list = [
        {
            "job_id": job_id,
            "jobTitle": job.get("jobTitle", ""),
            "categories": job.get("categories", ""),
            "description": job.get("description", ""),
            "jobType": job.get("jobType", ""),
            "location": job.get("location", ""),
            "latitude": float(job.get("latitude", 0)),
            "longitude": float(job.get("longitude", 0)),
            "skillsRequired": (
                job.get("skillsRequired") if isinstance(job.get("skillsRequired"), str)
                else " ".join(job.get("skillsRequired", []))
            ),
            "budgetRange": parse_budget(job.get("budgetRange", 0)),
            "experienceLevel": parse_experience_level(job.get("experienceLevel", "")),
            "jobDate": job.get("jobDate", "")
        }
        for job_id, job in jobs_data.items()
    ]
    return pd.DataFrame(job_list)

def fetch_user_activity(user_email):
    email_safe = user_email.replace(".", ",")
    ref_path = f"user-metadata/seeker/{email_safe}/seeker-activity"
    user_activities = db.reference(ref_path).get()

    activity_dict = {}
    if user_activities:
        for record in user_activities.values():
            job_id = record.get("jobId")
            time_spent = record.get("timeSpent", 0)
            if job_id:
                activity_dict[job_id] = activity_dict.get(job_id, 0) + time_spent
    return activity_dict

# -----------------------------
# Distance & Embedding
# -----------------------------

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(min(1, max(0, a))), sqrt(1 - min(1, max(0, a))))
    return R * c

def embed_text(text):
    return model.encode(text, convert_to_tensor=True)

# Hybrid Recommendation Logic
# -----------------------------

from sklearn.preprocessing import MinMaxScaler

def normalize_series(series):
    scaler = MinMaxScaler()
    return scaler.fit_transform(series.values.reshape(-1, 1)).flatten()

def compute_title_score(title, skills):
    score = 0
    for skill in skills:
        if skill.lower() in title.lower():
            score += 1
    return score

def compute_skill_match(job_skills, user_skills):
    if isinstance(job_skills, str):
        job_skills = job_skills.lower().split(",")
    job_skills_set = set([skill.strip().lower() for skill in job_skills])
    user_skills_set = set([skill.strip().lower() for skill in user_skills])
    return len(job_skills_set & user_skills_set)

def hybrid_recommend_jobs(user_email, user_skills, user_lat, user_lon, user_exp, user_budget):
    jobs_df = fetch_jobs()
    if jobs_df.empty:
        return []

    jobs_df = jobs_df[
        jobs_df["latitude"].notna() & jobs_df["longitude"].notna() &
        (jobs_df["latitude"] != 0) & (jobs_df["longitude"] != 0)
    ].copy()

    jobs_df["distance_km"] = jobs_df.apply(
        lambda row: haversine(user_lat, user_lon, row["latitude"], row["longitude"]),
        axis=1
    )

    def build_job_text(row):
        row = {k.lower(): v for k, v in row.items()}
        return (
            f"Job Title: {row.get('jobtitle', '')}. " * 2 +
            f"Description: {row.get('description', '')}. " * 2 +
            f"Required Skills: {row.get('skillsrequired', '')}. " +
            f"Experience Required: {row.get('experiencelevel', [0, 0])[0]} to {row.get('experiencelevel', [0, 0])[1]} years. " +
            f"Budget Offered: ₹{row.get('budgetrange', '')}. " +
            f"Location: {row.get('location', '')} ({int(row.get('distance_km', 0))} km away)."
        )

    jobs_df["job_text"] = jobs_df.apply(build_job_text, axis=1)

    user_skills_text = ", ".join(user_skills)
    user_text = (
        f"Skills: {user_skills_text}. "
        f"{user_exp} years of experience. "
        f"Expected budget: ₹{user_budget}. "
        f"User is located at latitude {user_lat} and longitude {user_lon}."
    )

    user_embedding = embed_text(user_text)
    job_embeddings = model.encode(jobs_df["job_text"].tolist(), convert_to_tensor=True)
    similarities = util.cos_sim(user_embedding, job_embeddings)[0].cpu().numpy()
    jobs_df["semantic_score_raw"] = similarities

    jobs_df["title_score_raw"] = jobs_df["jobTitle"].apply(lambda x: compute_title_score(x, user_skills))
    jobs_df["skill_match_raw"] = jobs_df["skillsRequired"].apply(lambda x: compute_skill_match(x, user_skills))

    jobs_df["semantic_score"] = normalize_series(jobs_df["semantic_score_raw"])
    jobs_df["title_score"] = normalize_series(jobs_df["title_score_raw"])
    jobs_df["skill_match_score"] = normalize_series(jobs_df["skill_match_raw"])

    jobs_df["final_score"] = (
        jobs_df["semantic_score"] +
        jobs_df["title_score"] +
        jobs_df["skill_match_score"]
    )

    top_jobs = jobs_df.sort_values(by="final_score", ascending=False).head(30)

    top_jobs["min_experience"] = top_jobs["experienceLevel"].apply(
        lambda x: x[0] if isinstance(x, list) and len(x) > 0 else 0
    )
    top_jobs["jobDate"] = pd.to_datetime(top_jobs["jobDate"], errors="coerce")

    matched_jobs = top_jobs[top_jobs["skillsRequired"].str.lower().apply(
    lambda x: any(skill.lower() in x for skill in user_skills)
)].copy()

# Calculate ±20% budget range
    lower_bound = user_budget * 0.8
    upper_bound = user_budget * 1.2

    # Separate jobs within ±20% budget
    priority_budget_jobs = matched_jobs[
        (matched_jobs["budgetRange"] >= lower_bound) & 
        (matched_jobs["budgetRange"] <= upper_bound)
    ].sort_values(by="distance_km")

    # The rest of the matched jobs, sorted by distance
    remaining_matched_jobs = matched_jobs[
        ~matched_jobs.index.isin(priority_budget_jobs.index)
    ].sort_values(by="distance_km")

    # Combine with budget-prioritized jobs first
    matched_jobs = pd.concat([priority_budget_jobs, remaining_matched_jobs])


    non_matched_jobs = top_jobs.drop(matched_jobs.index)

        # -----------------------------------------------
    # If user has activity, use their most viewed job
    # -----------------------------------------------
    user_activity = fetch_user_activity(user_email)
    if user_activity:
        # Take top 3 jobs the user spent most time on
        top_viewed_jobs = sorted(user_activity.items(), key=lambda x: x[1], reverse=True)[:3]
        ref_jobs = fetch_jobs()
        remaining_jobs_df = jobs_df[~jobs_df["job_id"].isin(matched_jobs["job_id"])].copy()
        remaining_jobs_df["job_text"] = remaining_jobs_df.apply(build_job_text, axis=1)

        # Initialize similarity array
        all_embeddings = model.encode(remaining_jobs_df["job_text"].tolist(), convert_to_tensor=True)
        total_similarity = np.zeros(len(remaining_jobs_df))

        for job_id, _ in top_viewed_jobs:
            base_job_row = ref_jobs[ref_jobs["job_id"] == job_id]
            if not base_job_row.empty:
                base_job_text = build_job_text(base_job_row.iloc[0])
                base_embedding = embed_text(base_job_text)
                similarity = util.cos_sim(base_embedding, all_embeddings)[0].cpu().numpy()
                total_similarity += similarity

        # Average similarity and sort
        avg_similarity = total_similarity / len(top_viewed_jobs)
        remaining_jobs_df["semantic_score"] = avg_similarity
        remaining_jobs_df = remaining_jobs_df.sort_values(by="semantic_score", ascending=False)

        # Append into non-matched jobs
        non_matched_jobs = pd.concat([remaining_jobs_df, non_matched_jobs]).drop_duplicates(subset="job_id")


    top_jobs_sorted = pd.concat([matched_jobs, non_matched_jobs])
    top_jobs_sorted = top_jobs_sorted.head(15)

    return top_jobs_sorted[[
        "job_id", "jobTitle", "categories", "location", "distance_km",
        "latitude", "longitude", "skillsRequired", "budgetRange",
        "description", "experienceLevel", "jobDate", "semantic_score", "job_text"
    ]].to_dict(orient="records")

# -----------------------------
# Routes
# -----------------------------

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        jobs_df = fetch_jobs(use_local=False)
        print("🔥 Jobs fetched:", jobs_df.shape)

        data = request.json
        user_email = data.get("email", "").strip()
        user_skills = data.get("skills", [])
        user_lat = float(data.get("latitude", 0))
        user_lon = float(data.get("longitude", 0))
        user_exp = int(data.get("experience", 0))
        user_budget = float(data.get("budget", 0))

        if not (user_email and user_skills and user_lat and user_lon):
            return jsonify({"error": "Missing required fields."}), 400

        results = hybrid_recommend_jobs(
            user_email, user_skills, user_lat, user_lon, user_exp, user_budget
        )

        if not results:
            return jsonify({"message": "No recommendations found."}), 404

        results_df = pd.DataFrame(results)
        results_df.replace({np.nan: None, np.inf: None, -np.inf: None}, inplace=True)
        results_df["jobDate"] = results_df["jobDate"].astype(str)

        return jsonify(results_df.to_dict(orient="records"))

    except Exception as e:
        logging.exception("🔥 /recommend error")
        return jsonify({"error": str(e)}), 500

# if __name__ == '__main__':                                                                                      ### CHANGED
#     app.run(host='0.0.0.0', port=5000)  

# if __name__ == '__main__':                                                                                      ### CHANGED
#     app.run(host='192.168.174.55', port=5000, ssl_context=('cert.pem', 'key.pem'))                                 ### CHANGED

# if __name__ == '__main__':
#     app.run(debug=True)

@app.route("/")
def home():
    return "Hello from Flask on Vercel!"
