import os

search_terms = ["EmployeeDetailsCard", "EmployeeEditModal", "edit"]
workspace = r"c:\Users\abhay\Desktop\OCTS"

for root, dirs, files in os.walk(os.path.join(workspace, "frontend")):
    for file in files:
        if file.endswith((".js", ".jsx", ".html")):
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                    for term in search_terms:
                        if term in content:
                            print(f"Found '{term}' in {path}")
            except Exception as e:
                pass
