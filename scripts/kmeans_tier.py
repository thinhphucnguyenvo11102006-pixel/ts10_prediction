import json
import os
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

import json
import os
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# Đường dẫn tương đối từ thư mục scripts/ đến data/
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'schools.json')
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'schools_tiered.json')

# Số lượng nhóm (Tier) bạn muốn chia. Thường là 3 (Top, Mid, Low) hoặc 4.
NUM_CLUSTERS = 4 

def calculate_metrics(scores_dict):
    """
    Tính trung bình và độ lệch chuẩn từ dictionary điểm chuẩn các năm.
    Giả sử scores_dict có dạng: {"2019": 21.5, "2020": 22.0, ...}
    """
    # Lấy ra danh sách điểm hợp lệ (bỏ qua các năm không có dữ liệu)
    scores = [float(v) for v in scores_dict.values() if v is not None and v != ""]
    
    if len(scores) < 3:
        # Nếu thiếu dữ liệu quá nhiều (< 3 năm), trả về None để xử lý sau
        return None, None
        
    mean_score = np.mean(scores)
    std_dev = np.std(scores) # Độ lệch chuẩn: Càng nhỏ càng ổn định
    
    return mean_score, std_dev

def process_clustering():
    print("1. Đang tải dữ liệu trường học...")
    try:
        with open(DATA_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            schools_list = data.get('schools', [])
    except FileNotFoundError:
        print(f"Lỗi: Không tìm thấy file {DATA_PATH}")
        return

    # Chuẩn bị dữ liệu cho K-Means
    features = []
    valid_indices = []

    print("2. Đang trích xuất đặc trưng (Mean & Std Dev)...")
    for idx, school in enumerate(schools_list):
        # Lưu ý: Cần thay đổi 'history' hoặc 'scores' thành key thực tế trong file JSON của bạn
        scores_dict = school.get('scores', {}) 
        mean, std = calculate_metrics(scores_dict)
        
        if mean is not None:
            features.append([mean, std])
            valid_indices.append(idx)
        else:
            # Gán tier mặc định cho các trường thiếu dữ liệu
            schools_list[idx]['tier'] = "Chưa đủ dữ liệu"
            schools_list[idx]['stability_index'] = None

    if not features:
        print("Không có dữ liệu hợp lệ để chạy thuật toán.")
        return

    # Chuyển đổi sang numpy array
    X = np.array(features)

    # Vì thang đo của Mean (vd: 15-25) khác xa Std Dev (vd: 0.5-3), 
    # cần chuẩn hóa về cùng scale (mean=0, variance=1)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    print(f"3. Đang chạy K-Means Clustering với K={NUM_CLUSTERS}...")
    # Khởi tạo và huấn luyện mô hình K-Means
    kmeans = KMeans(n_clusters=NUM_CLUSTERS, random_state=42, n_init=10)
    kmeans.fit(X_scaled)
    
    labels = kmeans.labels_
    centers = kmeans.cluster_centers_

    # K-means gán nhãn ngẫu nhiên (0, 1, 2). Chúng ta cần xếp hạng lại:
    # Nhóm có điểm trung bình cao nhất -> Tier 1 (Trường Top)
    # Chúng ta đảo ngược lại biến đổi scale cho tâm cụm để so sánh điểm gốc
    original_centers = scaler.inverse_transform(centers)
    
    # Sắp xếp index của cụm theo điểm trung bình giảm dần
    sorted_cluster_indices = np.argsort(original_centers[:, 0])[::-1]
    
    # Tạo mapping từ Nhãn cũ -> Tên Tier mới
    tier_mapping = {}
    for rank, original_cluster_idx in enumerate(sorted_cluster_indices):
        tier_mapping[original_cluster_idx] = f"Nhóm {rank + 1}"

    print("4. Đang gán nhãn Tier cho từng trường...")
    for i, label in enumerate(labels):
        school_idx = valid_indices[i]
        
        # Lấy dữ liệu gốc
        mean_val = features[i][0]
        std_val = features[i][1]
        
        # Gán thuộc tính mới
        schools_list[school_idx]['tier'] = tier_mapping[label]
        schools_list[school_idx]['avg_5_years'] = round(mean_val, 2)
        # Điểm ổn định: nghịch đảo của độ lệch chuẩn (hoặc lưu thẳng độ lệch)
        schools_list[school_idx]['volatility'] = round(std_val, 2) 
        
        # Đánh giá Text cho dễ hiển thị UI
        if std_val < 0.8:
            stability_text = "Rất ổn định"
        elif std_val < 1.5:
            stability_text = "Ổn định"
        elif std_val < 2.5:
            stability_text = "Biến động nhẹ"
        else:
            stability_text = "Biến động mạnh"
            
        schools_list[school_idx]['stability_rating'] = stability_text

    print("5. Đang xuất file JSON mới...")
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print(f"✅ Xong! Đã lưu kết quả phân nhóm vào: {OUTPUT_PATH}")
    print("Phân bố các tâm cụm (Average Score, Volatility):")
    for i in range(NUM_CLUSTERS):
        idx = sorted_cluster_indices[i]
        print(f" - Nhóm {i+1}: Điểm TB ~ {original_centers[idx][0]:.2f}, Độ lệch chuẩn ~ {original_centers[idx][1]:.2f}")

if __name__ == "__main__":
    process_clustering()