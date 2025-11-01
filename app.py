from flask import Flask, render_template, jsonify, request
from gist_database import GistDatabase
from alert_database import AlertDatabase
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Lấy credentials từ environment variables
GIST_ID = os.environ.get('GIST_ID')
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')

# Kiểm tra credentials
if not GIST_ID or not GITHUB_TOKEN:
    print("⚠️ CẢNH BÁO: Chưa cấu hình GIST_ID hoặc GITHUB_TOKEN!")
    print("Vui lòng tạo file .env với nội dung:")
    print("GIST_ID=your_gist_id_here")
    print("GITHUB_TOKEN=your_github_token_here")

# Khởi tạo database
db = GistDatabase(GIST_ID, GITHUB_TOKEN) if GIST_ID and GITHUB_TOKEN else None

# Alert database - sử dụng cùng Gist nhưng file khác
ALERT_GIST_ID = os.environ.get('ALERT_GIST_ID', GIST_ID)
alert_db = AlertDatabase(ALERT_GIST_ID, GITHUB_TOKEN) if ALERT_GIST_ID and GITHUB_TOKEN else None

# Định nghĩa task labels
TASK_LABELS = {
    "rua_bat": "Rửa bát",
    "quet_nha": "Quét nhà",
    "cat_ghe": "Cất ghế",
    "cat_com": "Cất cơm",
    "do_rac": "Đổ rác",
    "khac": "Khác"
}

@app.route('/')
def index():
    """
    Trang chủ hiển thị dashboard
    """
    return render_template('index.html')


@app.route('/alert')
def addalert():
    """
    Trang quản lý alert
    """
    return render_template('addalert.html')

@app.route('/api/data')
def get_data():
    """
    API endpoint để lấy tất cả dữ liệu

    Returns:
        JSON: Dữ liệu housework của 2 con
    """
    if not db:
        return jsonify({"error": "Database chưa được cấu hình"}), 500

    try:
        data = db.read_data()

        # Migrate: Nếu không có task_labels, thêm vào
        if 'task_labels' not in data:
            data['task_labels'] = TASK_LABELS
            db.write_data(data, description="Auto-migrate: Added task_labels")

        # Tính tổng điểm cho mỗi con
        for child_id, child_data in data['children'].items():
            total_points = 0
            for task_id, count in child_data['tasks'].items():
                points = data['task_points'].get(task_id, 0)
                total_points += count * points
            child_data['total_points'] = total_points

        # Sử dụng task_labels từ data (hoặc fallback)
        task_labels = data.get('task_labels', TASK_LABELS)
        data['task_labels'] = task_labels

        return jsonify({
            "status": "success",
            "data": data,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        print(f"Error in get_data: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/update', methods=['POST'])
def update_task():
    """
    API endpoint để cập nhật số lượng công việc
    
    Request body:
        {
            "child_id": "child1" hoặc "child2",
            "task_id": "rua_bat", "quet_nha", etc.,
            "action": "increment" hoặc "decrement"
        }
    
    Returns:
        JSON: Kết quả cập nhật
    """
    if not db:
        return jsonify({"error": "Database chưa được cấu hình"}), 500
    
    try:
        # Lấy parameters từ request
        child_id = request.json.get('child_id')
        task_id = request.json.get('task_id')
        action = request.json.get('action')
        
        # Validate input
        if not child_id or not task_id or not action:
            return jsonify({
                "status": "error",
                "message": "Thiếu tham số bắt buộc"
            }), 400
        
        if child_id not in ['child1', 'child2']:
            return jsonify({
                "status": "error",
                "message": "child_id không hợp lệ"
            }), 400
        
        if action not in ['increment', 'decrement']:
            return jsonify({
                "status": "error",
                "message": "action không hợp lệ"
            }), 400
        
        # Đọc dữ liệu hiện tại
        data = db.read_data()
        
        # Kiểm tra task_id có tồn tại
        if task_id not in data['children'][child_id]['tasks']:
            return jsonify({
                "status": "error",
                "message": "task_id không hợp lệ"
            }), 400
        
        # Cập nhật số lượng
        current_count = data['children'][child_id]['tasks'][task_id]
        
        if action == 'increment':
            data['children'][child_id]['tasks'][task_id] = current_count + 1
        else:  # decrement
            # Không cho phép giảm xuống dưới 0
            data['children'][child_id]['tasks'][task_id] = max(0, current_count - 1)
        
        # Lưu vào Gist
        if db.write_data(data):
            # Tính lại tổng điểm
            total_points = 0
            for tid, count in data['children'][child_id]['tasks'].items():
                points = data['task_points'].get(tid, 0)
                total_points += count * points
            
            return jsonify({
                "status": "success",
                "message": "Đã cập nhật thành công",
                "new_count": data['children'][child_id]['tasks'][task_id],
                "total_points": total_points
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Không thể lưu dữ liệu vào Gist"
            }), 500
            
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/reset', methods=['POST'])
def reset_data():
    """
    API endpoint để reset tất cả dữ liệu về 0
    Giữ lại các task tự thêm, chỉ reset số lần làm về 0

    Returns:
        JSON: Kết quả reset
    """
    if not db:
        return jsonify({"error": "Database chưa được cấu hình"}), 500

    try:
        # Đọc dữ liệu hiện tại
        data = db.read_data()

        # Reset số lần làm về 0 cho tất cả task (giữ lại task_points và task_labels)
        for child_id in data['children']:
            for task_id in data['children'][child_id]['tasks']:
                data['children'][child_id]['tasks'][task_id] = 0

        # Lưu dữ liệu
        if db.write_data(data, description="Reset: Đặt lại số lần làm về 0"):
            return jsonify({
                "status": "success",
                "message": "Đã reset dữ liệu thành công (giữ lại các task tự thêm)"
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Không thể reset dữ liệu"
            }), 500

    except Exception as e:
        print(f"Error in reset_data: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/update-names', methods=['POST'])
def update_names():
    """
    API endpoint để cập nhật tên của 2 con

    Request body:
        {
            "child1_name": "Tên con 1",
            "child2_name": "Tên con 2"
        }

    Returns:
        JSON: Kết quả cập nhật
    """
    if not db:
        return jsonify({"error": "Database chưa được cấu hình"}), 500

    try:
        child1_name = request.json.get('child1_name')
        child2_name = request.json.get('child2_name')

        if not child1_name or not child2_name:
            return jsonify({
                "status": "error",
                "message": "Thiếu tên con"
            }), 400

        # Đọc dữ liệu hiện tại
        data = db.read_data()

        # Cập nhật tên
        data['children']['child1']['name'] = child1_name
        data['children']['child2']['name'] = child2_name

        # Lưu vào Gist
        if db.write_data(data):
            return jsonify({
                "status": "success",
                "message": "Đã cập nhật tên thành công"
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Không thể lưu dữ liệu"
            }), 500

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/add-task', methods=['POST'])
def add_task():
    """
    API endpoint để thêm công việc mới

    Request body:
        {
            "task_id": "lau_ban",
            "task_name": "Lau bàn",
            "points": 5
        }

    Returns:
        JSON: Kết quả thêm công việc
    """
    if not db:
        return jsonify({"error": "Database chưa được cấu hình"}), 500

    try:
        task_id = request.json.get('task_id')
        task_name = request.json.get('task_name')
        points = request.json.get('points', 1)

        if not task_id or not task_name:
            return jsonify({
                "status": "error",
                "message": "Thiếu task_id hoặc task_name"
            }), 400

        # Đọc dữ liệu hiện tại
        data = db.read_data()

        # Kiểm tra task đã tồn tại chưa
        if task_id in data.get('task_points', {}):
            return jsonify({
                "status": "error",
                "message": "Công việc này đã tồn tại"
            }), 400

        # Đảm bảo task_labels tồn tại
        if 'task_labels' not in data:
            data['task_labels'] = {}

        # Thêm công việc mới
        data['task_points'][task_id] = points
        data['task_labels'][task_id] = task_name

        # Thêm vào task list của cả 2 con
        data['children']['child1']['tasks'][task_id] = 0
        data['children']['child2']['tasks'][task_id] = 0

        # Lưu vào Gist
        if db.write_data(data):
            return jsonify({
                "status": "success",
                "message": "Đã thêm công việc thành công"
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Không thể lưu dữ liệu"
            }), 500

    except Exception as e:
        print(f"Error in add_task: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Lỗi: {str(e)}"
        }), 500

@app.route('/api/delete-task', methods=['POST'])
def delete_task():
    """
    API endpoint để xóa công việc

    Request body:
        {
            "task_id": "lau_ban"
        }

    Returns:
        JSON: Kết quả xóa công việc
    """
    if not db:
        return jsonify({"error": "Database chưa được cấu hình"}), 500

    try:
        task_id = request.json.get('task_id')

        if not task_id:
            return jsonify({
                "status": "error",
                "message": "Thiếu task_id"
            }), 400

        # Đọc dữ liệu hiện tại
        data = db.read_data()

        # Kiểm tra task có tồn tại không
        if task_id not in data.get('task_points', {}):
            return jsonify({
                "status": "error",
                "message": "Công việc không tồn tại"
            }), 400

        # Xóa công việc
        del data['task_points'][task_id]
        if 'task_labels' in data and task_id in data['task_labels']:
            del data['task_labels'][task_id]

        # Xóa khỏi task list của cả 2 con
        if task_id in data['children']['child1']['tasks']:
            del data['children']['child1']['tasks'][task_id]
        if task_id in data['children']['child2']['tasks']:
            del data['children']['child2']['tasks'][task_id]

        # Lưu vào Gist
        if db.write_data(data):
            return jsonify({
                "status": "success",
                "message": "Đã xóa công việc thành công"
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Không thể lưu dữ liệu"
            }), 500

    except Exception as e:
        print(f"Error in delete_task: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Lỗi: {str(e)}"
        }), 500


@app.route('/api/save-all', methods=['POST'])
def save_all():
    """
    API endpoint để lưu tất cả dữ liệu

    Request body: Toàn bộ data object

    Returns:
        JSON: Kết quả lưu
    """
    if not db:
        return jsonify({"error": "Database chưa được cấu hình"}), 500

    try:
        data = request.json

        if not data:
            return jsonify({
                "status": "error",
                "message": "Không có dữ liệu để lưu"
            }), 400

        # Lưu vào Gist
        if db.write_data(data, description="Save: Cập nhật dữ liệu từ webapp"):
            return jsonify({
                "status": "success",
                "message": "Đã lưu dữ liệu thành công"
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Không thể lưu dữ liệu"
            }), 500

    except Exception as e:
        print(f"Error in save_all: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Lỗi: {str(e)}"
        }), 500


# ============ ALERT MANAGEMENT ENDPOINTS ============

@app.route('/api/alert/data')
def get_alert_data():
    """
    API endpoint để lấy tất cả alert data
    """
    if not alert_db:
        return jsonify({"error": "Alert database chưa được cấu hình"}), 500

    try:
        data = alert_db.read_data()
        return jsonify({
            "status": "success",
            "data": data,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        print(f"Error in get_alert_data: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/alert/json')
def get_alert_json():
    """
    API endpoint để lấy alert data dưới dạng JSON thuần (cho bot MQL5)
    URL cố định, dữ liệu luôn mới nhất

    Returns:
        JSON: Dữ liệu alert (không có wrapper status)
    """
    if not alert_db:
        return jsonify({}), 500

    try:
        data = alert_db.read_data()
        return jsonify(data)
    except Exception as e:
        print(f"Error in get_alert_json: {str(e)}")
        return jsonify({}), 500


@app.route('/api/alert/add', methods=['POST'])
def add_alert():
    """
    API endpoint để thêm alert mới
    """
    if not alert_db:
        return jsonify({"error": "Alert database chưa được cấu hình"}), 500

    try:
        symbol = request.json.get('symbol', '').upper()
        alert_price = request.json.get('alert_price')
        direction = request.json.get('direction', 'above')

        if not symbol or alert_price is None:
            return jsonify({
                "status": "error",
                "message": "Thiếu symbol hoặc alert_price"
            }), 400

        if direction not in ['above', 'below']:
            return jsonify({
                "status": "error",
                "message": "Direction phải là 'above' hoặc 'below'"
            }), 400

        data = alert_db.read_data()

        data[symbol] = {
            "alert_price": float(alert_price),
            "direction": direction
        }

        if alert_db.write_data(data, description=f"Add alert: {symbol}"):
            return jsonify({
                "status": "success",
                "message": f"Đã thêm alert cho {symbol}"
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Không thể lưu dữ liệu"
            }), 500

    except Exception as e:
        print(f"Error in add_alert: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/alert/update-price', methods=['POST'])
def update_alert_price():
    """
    API endpoint để cập nhật giá alert
    """
    if not alert_db:
        return jsonify({"error": "Alert database chưa được cấu hình"}), 500

    try:
        symbol = request.json.get('symbol', '').upper()
        alert_price = request.json.get('alert_price')

        if not symbol or alert_price is None:
            return jsonify({
                "status": "error",
                "message": "Thiếu symbol hoặc alert_price"
            }), 400

        data = alert_db.read_data()

        if symbol not in data:
            return jsonify({
                "status": "error",
                "message": f"Symbol {symbol} không tồn tại"
            }), 404

        data[symbol]["alert_price"] = float(alert_price)

        if alert_db.write_data(data, description=f"Update price: {symbol}"):
            return jsonify({
                "status": "success",
                "message": f"Đã cập nhật giá cho {symbol}"
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Không thể lưu dữ liệu"
            }), 500

    except Exception as e:
        print(f"Error in update_alert_price: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/alert/update-direction', methods=['POST'])
def update_alert_direction():
    """
    API endpoint để cập nhật direction alert
    """
    if not alert_db:
        return jsonify({"error": "Alert database chưa được cấu hình"}), 500

    try:
        symbol = request.json.get('symbol', '').upper()
        direction = request.json.get('direction')

        if not symbol or not direction:
            return jsonify({
                "status": "error",
                "message": "Thiếu symbol hoặc direction"
            }), 400

        if direction not in ['above', 'below']:
            return jsonify({
                "status": "error",
                "message": "Direction phải là 'above' hoặc 'below'"
            }), 400

        data = alert_db.read_data()

        if symbol not in data:
            return jsonify({
                "status": "error",
                "message": f"Symbol {symbol} không tồn tại"
            }), 404

        data[symbol]["direction"] = direction

        if alert_db.write_data(data, description=f"Update direction: {symbol}"):
            return jsonify({
                "status": "success",
                "message": f"Đã cập nhật direction cho {symbol}"
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Không thể lưu dữ liệu"
            }), 500

    except Exception as e:
        print(f"Error in update_alert_direction: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/alert/delete', methods=['POST'])
def delete_alert():
    """
    API endpoint để xóa alert
    """
    if not alert_db:
        return jsonify({"error": "Alert database chưa được cấu hình"}), 500

    try:
        symbol = request.json.get('symbol', '').upper()

        if not symbol:
            return jsonify({
                "status": "error",
                "message": "Thiếu symbol"
            }), 400

        data = alert_db.read_data()

        if symbol not in data:
            return jsonify({
                "status": "error",
                "message": f"Symbol {symbol} không tồn tại"
            }), 404

        del data[symbol]

        if alert_db.write_data(data, description=f"Delete alert: {symbol}"):
            return jsonify({
                "status": "success",
                "message": f"Đã xóa alert cho {symbol}"
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Không thể lưu dữ liệu"
            }), 500

    except Exception as e:
        print(f"Error in delete_alert: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

