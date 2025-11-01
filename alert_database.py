import requests
import json
from datetime import datetime

class AlertDatabase:
    """
    Class để tương tác với GitHub Gist cho alert data
    """
    
    def __init__(self, gist_id, github_token):
        """
        Khởi tạo Alert Database
        
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
    
    def read_data(self, filename="alert_data.json"):
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
    
    def write_data(self, data, filename="alert_data.json", description=None):
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
        return {}

