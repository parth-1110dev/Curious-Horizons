const fs = require('fs');

let code = fs.readFileSync('backend/main.py', 'utf8');

// Instrument backend
code = code.replace(
    'async def generate_content(request: Request, data: dict):',
    'async def generate_content(request: Request, data: dict):\n    print("[Backend][ENTRY] /generate route hit")'
);

code = code.replace(
    'try:\n            response = client.chat.completions.create(',
    'try:\n            print("[Backend][SUCCESS] Prompt constructed")\n            print("[Backend][SUCCESS] OpenAI request sent")\n            response = client.chat.completions.create('
);

code = code.replace(
    'if getattr(response, "choices", None):',
    'print("[Backend][SUCCESS] OpenAI response received")\n            if getattr(response, "choices", None):'
);

code = code.replace(
    'return {"content": response.choices[0].message.content}',
    'print("[Backend][EXIT] Returning payload")\n            return {"content": response.choices[0].message.content}'
);

code = code.replace(
    'except Exception as e:\n            print(f"[OpenAI][Generate] ERROR OCCURRED: {e}")',
    'except Exception as e:\n            print(f"[Backend][FAILURE] Exception: {e}")'
);

code = code.replace(
    'except Exception as e:\n        print("UNEXPECTED ERROR:", str(e))',
    'except Exception as e:\n        print(f"[Backend][FAILURE] UNEXPECTED ERROR: {e}")'
);

fs.writeFileSync('backend/main.py', code);
console.log("Instrumented backend");
