import requests
import json
from datetime import datetime

class GistDatabase:
    """
    Class để tương tác với GitHub Gist như một database
    """
    
    def __init__(self, gist_id, github_token):
        """
        Khởi tạo Gist Database
        
        Args:
            gist_id: ID của Gist (lấy từ URL)
            github_token: Personal Access Token của GitHub
        """
        self.gist_id = gist_id
        self.token = github_token
        self.api_url = f"https://api.github.com/gists/{gist_id}"
        self.headers = {
            "Authorization": f"Bearer {github_token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
    
    def read_data(self, filename="housework_data.json"):
        """
        Đọc dữ liệu từ Gist
        
        Args:
            filename: Tên file trong Gist
            
        Returns:
            dict: Dữ liệu JSON từ file
        """
        try:
            response = requests.get(self.api_url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            gist_data = response.json()
            
            # Lấy nội dung file
            if filename in gist_data['files']:
                content = gist_data['files'][filename]['content']
                return json.loads(content)
            else:
                print(f"File {filename} không tồn tại trong Gist")
                return self._get_default_data()
                
        except requests.exceptions.RequestException as e:
            print(f"Lỗi khi đọc Gist: {e}")
            return self._get_default_data()
        except json.JSONDecodeError as e:
            print(f"Lỗi parse JSON: {e}")
            return self._get_default_data()
    
    def write_data(self, data, filename="housework_data.json", description=None):
        """
        Ghi dữ liệu vào Gist
        
        Args:
            data: Dictionary chứa dữ liệu cần lưu
            filename: Tên file trong Gist
            description: Mô tả cho lần update (optional)
        
        Returns:
            bool: True nếu thành công, False nếu thất bại
        """
        try:
            # Cập nhật timestamp
            data['last_updated'] = datetime.now().isoformat()
            
            payload = {
                "files": {
                    filename: {
                        "content": json.dumps(data, indent=2, ensure_ascii=False)
                    }
                }
            }
            
            if description:
                payload["description"] = description
            
            response = requests.patch(
                self.api_url,
                headers=self.headers,
                json=payload,
                timeout=10
            )
            response.raise_for_status()
            
            print(f"✅ Đã lưu dữ liệu vào Gist thành công!")
            return True
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Lỗi khi ghi Gist: {e}")
            return False
    
    def _get_default_data(self):
        """
        Trả về cấu trúc dữ liệu mặc định
        
        Returns:
            dict: Dữ liệu mặc định
        """
        return {
            "children": {
                "child1": {
                    "name": "Bin",
                    "tasks": {
                        "rua_bat": 0,
                        "quet_nha": 0,
                        "cat_ghe": 0,
                        "cat_com": 0,
                        "do_rac": 0,
                        "khac": 0
                    }
                },
                "child2": {
                    "name": "Tho",
                    "tasks": {
                        "rua_bat": 0,
                        "quet_nha": 0,
                        "cat_ghe": 0,
                        "cat_com": 0,
                        "do_rac": 0,
                        "khac": 0
                    }
                }
            },
            "task_points": {
                "rua_bat": 10,
                "quet_nha": 4,
                "cat_ghe": 1,
                "cat_com": 1,
                "do_rac": 3,
                "khac": 1
            },
            "task_labels": {
                "rua_bat": "Rửa bát",
                "quet_nha": "Quét nhà",
                "cat_ghe": "Cất ghế",
                "cat_com": "Cất cơm",
                "do_rac": "Đổ rác",
                "khac": "Khác"
            },
            "last_updated": datetime.now().isoformat()
        }
    
    def initialize_gist(self):
        """
        Khởi tạo Gist với dữ liệu mặc định nếu chưa có
        
        Returns:
            bool: True nếu thành công
        """
        default_data = self._get_default_data()
        return self.write_data(default_data, description="Housework Tracker - Initial Data")

