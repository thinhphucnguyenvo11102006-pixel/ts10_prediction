import json
import os
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# Đường dẫn: Sử dụng trực tiếp file gốc để làm master data
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'schools.json')
OUTPUT_PATH = DATA_PATH # Ghi đè vào file gốc

# Chia thành 8 nhóm để khớp với bản gốc
NUM_CLUSTERS = 8 

def calculate_metrics(scores_dict):
    """
    Tính trung bình và độ lệch chuẩn từ dictionary điểm chuẩn các năm.
    """
    # Lấy ra danh sách điểm hợp lệ
    scores = [float(v) for v in scores_dict.values() if v is not None and v != ""]
    
    if len(scores) < 2: # Hạ xuống 2 năm để bao phủ nhiều trường hơn
        return None, None
        
    mean_score = np.mean(scores)
    std_dev = np.std(scores)
    
    return mean_score, std_dev

def process_clustering():
    print("1. Loading school data...")
    try:
        with open(DATA_PATH, 'r', encoding='utf-8') as f:
            full_data = json.load(f)
            schools = full_data['schools']
    except FileNotFoundError:
        print(f"Lỗi: Không tìm thấy file {DATA_PATH}")
        return

    # Chuẩn bị dữ liệu cho K-Means
    features = []
    valid_indices = []

    print("2. Extracting features (Mean & Std Dev)...")
    for idx, school in enumerate(schools):
        scores_dict = school.get('scores', {}) 
        mean, std = calculate_metrics(scores_dict)
        
        if mean is not None:
            features.append([mean, std])
            valid_indices.append(idx)
        else:
            schools[idx]['tier'] = "C" # Mặc định
            schools[idx]['stability_rating'] = "Chưa đủ dữ liệu"

    if not features:
        print("Không có dữ liệu hợp lệ để chạy thuật toán.")
        return

    X = np.array(features)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    print(f"3. Running K-Means Clustering with K={NUM_CLUSTERS}...")
    kmeans = KMeans(n_clusters=NUM_CLUSTERS, random_state=42, n_init=10)
    kmeans.fit(X_scaled)
    
    labels = kmeans.labels_
    centers = kmeans.cluster_centers_
    original_centers = scaler.inverse_transform(centers)
    
    # Sắp xếp index của cụm theo điểm trung bình giảm dần
    sorted_cluster_indices = np.argsort(original_centers[:, 0])[::-1]
    
    # Mapping sang 8 nhãn cũ
    tier_labels = ["S", "A+", "A", "A-", "B+", "B", "B-", "C"]
    tier_mapping = {}
    for rank, original_cluster_idx in enumerate(sorted_cluster_indices):
        label = tier_labels[rank] if rank < len(tier_labels) else "C"
        tier_mapping[original_cluster_idx] = label

    print("4. Assigning Tiers and stability ratings...")
    for i, label in enumerate(labels):
        school_idx = valid_indices[i]
        std_val = features[i][1]
        
        schools[school_idx]['tier'] = tier_mapping[label]
        schools[school_idx]['volatility'] = round(float(std_val), 2)
        
        if std_val < 0.6:
            stability_text = "Rất ổn định"
        elif std_val < 1.2:
            stability_text = "Ổn định"
        elif std_val < 2.0:
            stability_text = "Biến động"
        else:
            stability_text = "Rất biến động"
            
        schools[school_idx]['stability_rating'] = stability_text

    print(f"5. Overwriting data to: {OUTPUT_PATH}...")
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(full_data, f, ensure_ascii=False, indent=2)
        
    print(f"DONE! Updated 8 Tiers in master data file.")

if __name__ == "__main__":
    process_clustering()
