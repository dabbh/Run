# Test Files for Run! Extension

This directory contains test files to verify the functionality of the Run! VS Code extension.

## Test Files

### 🔴 C Language
- **File:** `test_hello.c`
- **Purpose:** Test C compilation and execution
- **Expected:** Compiles with GCC and runs successfully
- **Safe Mode:** Creates temporary executable (default)

### 🐍 Python
- **File:** `test_hello.py`
- **Purpose:** Test Python script execution
- **Expected:** Runs with python3 (Linux/macOS) or python (Windows)
- **Features:** Functions, lists, string formatting

### 📄 LaTeX
- **File:** `test_document.tex`
- **Purpose:** Test LaTeX compilation to PDF
- **Expected:** Compiles with pdflatex and opens PDF viewer
- **Features:** Math equations, lists, sections

### 🔵 C++
- **File:** `test_hello.cpp`
- **Purpose:** Test C++ compilation and execution
- **Expected:** Compiles with G++ and runs successfully
- **Features:** STL vectors, strings, loops

### 🟡 JavaScript
- **File:** `test_hello.js`
- **Purpose:** Test Node.js execution
- **Expected:** Runs with Node.js
- **Features:** Arrow functions, objects, array methods

## How to Test

1. Open any test file in VS Code
2. Click the **"Run [Language]"** button in the status bar
3. Or use the keyboard shortcut: `Ctrl+Cmd+R`
4. Verify the output in the integrated terminal

## Expected Behavior

### Cross-Platform Commands

#### Linux/macOS:
- **C:** `gcc "test_hello.c" -o test_hello_temp_123 && ./test_hello_temp_123 && rm test_hello_temp_123`
- **Python:** `python3 "test_hello.py"`
- **LaTeX:** `pdflatex "test_document.tex" && xdg-open test_document.pdf`

#### Windows:
- **C:** `gcc "test_hello.c" -o test_hello_temp_123.exe; if ($?) { test_hello_temp_123.exe; del test_hello_temp_123.exe }`
- **Python:** `python "test_hello.py"`
- **LaTeX:** `pdflatex "test_document.tex"; if ($?) { start test_document.pdf }`

## Safe Mode Testing

The extension uses **Safe Mode** by default for compiled languages (C, C++, Rust), creating temporary executables to avoid overwriting existing files.

To test different modes, create a `.Run` file with:

```ini
[c]
safeMode: false  # Disable safe mode
```

## Troubleshooting

If tests fail, ensure you have the required tools installed:
- **GCC** for C/C++
- **Python 3.x** for Python
- **Node.js** for JavaScript  
- **LaTeX distribution** for LaTeX (TeX Live, MiKTeX)
