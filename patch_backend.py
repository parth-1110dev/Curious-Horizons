import sys
import re

with open('backend/main_old.py', 'r') as f:
    old_content = f.read()

with open('backend/main.py', 'r') as f:
    current_content = f.read()

# Extract old generate_content function
old_match = re.search(r'(@app\.post\("/generate"\)\nasync def generate_content\(request: Request, data: dict\):.*?)(?=\n@app\.post\("/generate-knowledge-pack"\))', old_content, re.DOTALL)
if not old_match:
    print("Failed to find old generate_content")
    sys.exit(1)
old_func = old_match.group(1)

# Modify old function to include Phase 6 debugging improvements
# The old function returns {"content": ...} or {"error": ...}
# We need to add better logging around `client.chat.completions.create` and return 500 status code for unexpected errors.

# 1. Improve logging in the try/except block around OpenAI call
old_func = old_func.replace(
    'print("ERROR OCCURRED:", str(e))',
    'print(f"[OpenAI][Generate] ERROR OCCURRED: {e}")\n            import traceback\n            traceback.print_exc()'
)

# 2. Return proper 500 for unexpected errors at the end
old_func = old_func.replace(
    'return {"error": "Internal error", "details": str(e)}',
    'import traceback\n        traceback.print_exc()\n        from fastapi.responses import JSONResponse\n        return JSONResponse(status_code=500, content={"error": "Internal error", "details": str(e)})'
)

# Extract current generate_content function block to replace
current_match = re.search(r'(@app\.post\("/generate"\)\nasync def generate_content\(request: Request, data: dict\):.*?)(?=\n@app\.post\("/generate-knowledge-pack"\))', current_content, re.DOTALL)
if not current_match:
    print("Failed to find current generate_content")
    sys.exit(1)

# Replace the block
new_content = current_content[:current_match.start()] + old_func + current_content[current_match.end():]

with open('backend/main.py', 'w') as f:
    f.write(new_content)

print("backend/main.py patched successfully")
