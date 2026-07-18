import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from backend.pdf_generator import create_pdf_from_markdown

output_dir = "pdf_tests"
os.makedirs(output_dir, exist_ok=True)

test_cases = {
    "Mathematical_Calculus": """# Calculus

## 1. Introduction
Calculus is the mathematical study of continuous change.

## Formula
The fundamental theorem of calculus:
$$ \\int_a^b f(x) dx = F(b) - F(a) $$
Where inline math $F'(x) = f(x)$ represents the derivative.

## Exam Trap
Do not forget the constant of integration $+C$ when evaluating indefinite integrals!

## Comparison
| Concept | Definition | Example |
|---|---|---|
| Derivative | Rate of change | $f'(x) = 2x$ |
| Integral | Area under curve | $\\int 2x dx = x^2 + C$ |

- Bullet 1
- Bullet 2
  - Nested Bullet 1
  - Nested Bullet 2
""",

    "Programming_Algorithms": """# Algorithms

## Core Theory
Sorting algorithms are fundamental.

## Quick Tip
Always consider time complexity (Big O notation) before choosing an algorithm.

## Complexity Table
| Algorithm | Best Case | Worst Case |
|---|---|---|
| QuickSort | $O(n \\log n)$ | $O(n^2)$ |
| MergeSort | $O(n \\log n)$ | $O(n \\log n)$ |

## Memory Trick
**Q**uickSort is **Q**uick on average, but **M**ergeSort is **M**ore consistent.
""",

    "Networking_Protocols": """# Networking

## TCP vs UDP
A comparison of transport layer protocols.

## Important Note
TCP provides reliable delivery, while UDP prioritizes speed.

| Feature | TCP | UDP |
|---|---|---|
| Reliable | Yes | No |
| Ordered | Yes | No |
| Speed | Slower | Faster |

## Quick Revision Checklist
- Understand 3-way handshake
- Know common port numbers
- Differentiate between IPv4 and IPv6
""",

    "AI_Machine_Learning": """# Machine Learning

## Neural Networks
Deep learning relies on artificial neural networks.

## Formula
The backpropagation weight update rule using gradient descent:
$$ W_{new} = W_{old} - \\eta \\frac{\\partial L}{\\partial W} $$
Where $\\eta$ is the learning rate.

## Exam Trap
Vanishing gradients occur when using Sigmoid activation functions in deep networks.
"""
}

try:
    for topic, content in test_cases.items():
        # Test PDF Notes (Normal generation)
        pdf_buf = create_pdf_from_markdown(content, topic_name=topic.replace("_", " "), document_type="PDF Notes")
        with open(os.path.join(output_dir, f"{topic}_Notes.pdf"), "wb") as f:
            f.write(pdf_buf.read())
            
        # Test Exam Cheat Sheet
        pdf_buf2 = create_pdf_from_markdown(content, topic_name=topic.replace("_", " "), document_type="Exam Cheat Sheet")
        with open(os.path.join(output_dir, f"{topic}_CheatSheet.pdf"), "wb") as f:
            f.write(pdf_buf2.read())
            
    print("ALL TESTS PASSED SUCCESSFULLY.")
except Exception as e:
    import traceback
    traceback.print_exc()
    print("TEST FAILED.")
