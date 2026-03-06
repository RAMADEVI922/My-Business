import re

with open(r'c:\Users\hp\Desktop\project\adminpage\src\App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Clean up unused imports from lucide-react, react-router-dom, etc.
def cleanup_imports(code):
    import_blocks = re.findall(r'import\s+\{([^}]+)\}\s+from\s+[\'"]([^\'"]+)[\'"];', code)
    for block, module in import_blocks:
        items = [i.strip() for i in block.split(',')]
        used_items = []
        for item in items:
            # Handle aliases like "Image as ImageIcon"
            if ' as ' in item:
                check_item = item.split(' as ')[1].strip()
            else:
                check_item = item
            
            # Count occurrences of check_item (as full word)
            matches = re.findall(r'\b' + re.escape(check_item) + r'\b', code)
            
            # 1 match means it's only in the import itself
            if len(matches) > 1:
                used_items.append(item)
                
        old_import = f"import {{{block}}} from '{module}';"
        if not used_items:
            code = code.replace(old_import, "")
        else:
            new_import = f"import {{ {', '.join(used_items)} }} from '{module}';"
            code = code.replace(old_import, new_import)
            
    # Clean up default imports components (AdminNavbar, DeliveryCalendar, etc)
    default_imports = re.findall(r'import\s+(\w+)\s+from\s+[\'"]([^\'"]+)[\'"];', code)
    for item, module in default_imports:
        if item in ['React']: continue
        matches = re.findall(r'\b' + re.escape(item) + r'\b', code)
        if len(matches) <= 1:
            old_import = f"import {item} from '{module}';"
            code = code.replace(old_import, "")
            
    return code

new_code = cleanup_imports(code)

# Remove empty lines resulting from deleted imports
new_code = re.sub(r'\n\s*\n\s*\n', '\n\n', new_code)

with open(r'c:\Users\hp\Desktop\project\adminpage\src\App.jsx', 'w', encoding='utf-8') as f:
    f.write(new_code)
print("Cleaned up unused imports.")
