# Run! - VS Code Extension 🚀
![GitHub License](https://img.shields.io/github/license/dabbh/Run)
![GitHub Stars](https://img.shields.io/github/stars/dabbh/Run?style=social)
![GitHub Issues](https://img.shields.io/github/issues/dabbh/Run)
![Downloads](https://img.shields.io/visual-studio-marketplace/i/Danbh.run-a-code)
![Version](https://img.shields.io/visual-studio-marketplace/v/Danbh.run-a-code)

A powerful and intuitive VS Code extension that adds a convenient run button to the status bar for multiple programming languages. Execute your code instantly with one click or a simple keyboard shortcut!

## ✨ Key Features

- **🎯 One-Click Execution**: Run your code instantly from the status bar
- **⌨️ Keyboard Shortcut**: Quick execution with `Ctrl+Cmd+R`
- **🌍 Multi-Language Support**: Supports 13+ popular programming languages including LaTeX
- **🔍 Smart Detection**: Automatically detects file type and shows appropriate run button
- **💻 Terminal Integration**: Executes code in VS Code's integrated terminal
- **💾 Auto-Save**: Automatically saves your file before execution
- **🛡️ Error Handling**: Gracefully handles compilation and runtime errors
- **🔄 Re-run Capability**: Easy to re-run code after fixing bugs
- **⚙️ Custom Configuration**: Support for `.Run` files with language-specific settings
- **🎛️ Variable Substitution**: Use `{filename}` and `{filenameWithExt}` placeholders
- **📝 Default Commands**: Smart defaults for C files without user prompts

## 📦 Installation

### From VSIX (Recommended)
1. Download the latest `.vsix` file
2. Open VS Code
3. Press `Ctrl+Shift+P`
4. Type "Extensions: Install from VSIX"
5. Select the downloaded file

### From Marketplace
Search for "Run!" by Danbh in the VS Code Extensions Marketplace

## 🎯 Usage

### Method 1: Status Bar Button
1. Open a file with supported extension (see table below)
2. Look for the "▶ Run [Language]" button in the status bar
3. Click the button to execute your code

### Method 2: Keyboard Shortcut
- Press `Ctrl+Cmd+R` (Linux/Windows) or `Ctrl+Cmd+R` (Mac)
- Works only when a supported file is active

### Output
- View execution results in the integrated terminal
- Each run creates a new terminal instance named "Run [Language]"
- Terminal automatically opens and shows output

## 🛠️ Supported Languages

| Language | File Extension | Command Used | Requirements |
|----------|----------------|--------------|--------------|
| **Python** | `.py` | `python3 "filename.py"` (Linux/macOS)<br>`python "filename.py"` (Windows) | Python 3.x |
| **Java** | `.java` | `javac *.java && java classname` | JDK |
| **C** | `.c` | `gcc "filename.c" -o output && ./output` (Linux/macOS)<br>`gcc "filename.c" -o output.exe && output.exe` (Windows) | GCC |
| **C++** | `.cpp` | `g++ "filename.cpp" -o output && ./output` | G++ |
| **JavaScript** | `.js` | `node "filename.js"` | Node.js |
| **TypeScript** | `.ts` | `npx ts-node "filename.ts"` | Node.js + ts-node |
| **Go** | `.go` | `go run "filename.go"` | Go compiler |
| **Rust** | `.rs` | `rustc "filename.rs" -o output && ./output` | Rust |
| **PHP** | `.php` | `php "filename.php"` | PHP |
| **Ruby** | `.rb` | `ruby "filename.rb"` | Ruby |
| **C#** | `.cs` | `dotnet run` | .NET SDK |
| **Dart** | `.dart` | `dart run "filename.dart"` | Dart SDK |
| **LaTeX** | `.tex` | `pdflatex "filename.tex" && xdg-open output.pdf` (Linux)<br>`pdflatex "filename.tex" && open output.pdf` (macOS)<br>`pdflatex "filename.tex" && start output.pdf` (Windows) | LaTeX distribution |

## 🌟 Cross-Platform Support

**Run!** automatically detects your operating system and uses the appropriate commands:

- **🐧 Linux**: Uses `python3`, `xdg-open`, no `.exe` files for compiled languages
- **🍎 macOS**: Uses `python3`, `open`, no `.exe` files for compiled languages  
- **🪟 Windows**: Uses `python`, `start`, creates `.exe` files for compiled languages

## 📋 Requirements

Make sure you have the required tools installed for the languages you want to use:

### Essential Tools
- **Python**: Python 3.x interpreter
- **Java**: JDK (Java Development Kit)
- **C/C++**: GCC/G++ compiler
- **Node.js**: For JavaScript and TypeScript
- **Go**: Go programming language
- **Rust**: Rust programming language
- **PHP**: PHP interpreter
- **Ruby**: Ruby interpreter
- **C#**: .NET SDK
- **Dart**: Dart SDK
- **LaTeX**: LaTeX distribution (TeX Live, MiKTeX, etc.)

### TypeScript Additional Setup
For TypeScript support, install ts-node globally:
```bash
npm install -g ts-node
```

## 🔧 Quick Setup

### Ubuntu/Debian
```bash
# Essential tools
sudo apt update
sudo apt install python3 default-jdk build-essential nodejs npm php ruby-full

# Additional languages
curl -OL https://golang.org/dl/go1.21.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# .NET SDK
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt update && sudo apt install -y dotnet-sdk-8.0

# TypeScript support
npm install -g ts-node

# LaTeX (Ubuntu/Debian)
sudo apt install texlive-full
```

### Windows
- **Python**: Download from [python.org](https://python.org)
- **Java**: Download JDK from [Oracle](https://oracle.com/java) or [OpenJDK](https://openjdk.org)
- **C/C++**: Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) or [MinGW](https://mingw-w64.org)
- **Node.js**: Download from [nodejs.org](https://nodejs.org)
- **Go**: Download from [golang.org](https://golang.org)
- **Rust**: Download from [rustup.rs](https://rustup.rs)
- **PHP**: Download from [php.net](https://php.net)
- **Ruby**: Download from [rubyinstaller.org](https://rubyinstaller.org)
- **.NET**: Download from [dotnet.microsoft.com](https://dotnet.microsoft.com)
- **LaTeX**: Download [MiKTeX](https://miktex.org) or [TeX Live](https://tug.org/texlive/)

### macOS
```bash
# Using Homebrew
brew install python3 openjdk node go rust php ruby
xcode-select --install

# .NET SDK
brew install --cask dotnet

# LaTeX
brew install --cask mactex

# TypeScript support
npm install -g ts-node
```

## 📝 Examples

### Python Example
```python
print("Hello World!")
name = input("What's your name? ")
print(f"Hello {name}!")
```

### Java Example
```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}
```

### C Example
```c
#include <stdio.h>

int main() {
    printf("Hello World!\n");
    return 0;
}
```

### LaTeX Example
```latex
\documentclass{article}
\begin{document}
Hello World!
\end{document}
```

## ⚙️ Custom Configuration with .Run Files

Create a `.Run` file in your project directory to customize execution commands for different languages:

### Format
```ini
# Custom run configurations
[c]
compileFlags: -Wall -Wextra -g -std=c99  # Optional: add debugging and warnings
runCommand: ./{filename}
# safeMode: true by default (creates temporary executables)
# For simple compilation without extra flags, omit compileFlags or use: compileFlags:

[cpp]
compileFlags: -Wall -Wextra -std=c++17 -O2
runCommand: ./{filename}
# safeMode: true by default

[python]
fullCommand: python3 {filenameWithExt} --verbose

[rust]
compileFlags: --release
runCommand: ./{filename}
safeMode: false  # Explicitly disable safe mode for this project

[latex]
fullCommand: pdflatex {filenameWithExt} && bibtex {filename} && pdflatex {filenameWithExt} && xdg-open {filename}.pdf
```

### Available Variables
- `{filename}` - File name without extension (e.g., "main" for "main.c")
- `{filenameWithExt}` - Full file name (e.g., "main.c")

### Configuration Options
- **`compileFlags`** - Custom compilation flags (for compiled languages)
- **`runCommand`** - Custom run command (used with compileFlags)
- **`fullCommand`** - Complete custom command (overrides default behavior)
- **`safeMode`** - For compiled languages (C, C++, Rust): Creates temporary executable files to avoid overwriting existing files
  - **Default: `true`** - Creates executable with timestamp suffix and deletes it after running (recommended)
  - `safeMode: false` - Uses standard executable names (may overwrite existing files)
  - If not specified in `.Run` file, defaults to `true` for safety

### Safe Mode Examples
```ini
[c]
# Simple compilation (default behavior)
runCommand: ./{filename}
# safeMode: true by default (no need to specify)

[c]
# Advanced compilation with debugging and warnings
compileFlags: -Wall -Wextra -g -std=c99
runCommand: ./{filename}

[cpp]
compileFlags: -std=c++17 -O2
runCommand: ./{filename}
safeMode: false  # Explicitly disable safe mode

[rust]
compileFlags: --release
runCommand: ./{filename}
# Uses safe mode by default
```

### Supported in .Run files
All supported languages can be customized: `[c]`, `[cpp]`, `[python]`, `[java]`, `[javascript]`, `[typescript]`, `[go]`, `[rust]`, `[php]`, `[ruby]`, `[csharp]`, `[dart]`, `[latex]`
__run__

![demo Gif](https://i.ibb.co/pBL8LW3Y/ezgif-5fbc17b12bbc7b.gif)
## 🐛 Troubleshooting

### Button Not Showing
- Ensure you have a supported file open
- Check that the file extension is correct
- Try reloading VS Code: `Ctrl+Shift+P` → "Developer: Reload Window"

### Code Not Running
- Verify the required compiler/interpreter is installed
- Check for syntax errors in your code
- Ensure you're in the correct directory

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**DanBH**
- GitHub: [@danbh](https://github.com/danbh)

## 🙏 Acknowledgments

- Thanks to the VS Code team for the excellent extension API
- If your love this extension, please give me ⭐⭐⭐⭐⭐
---

**Enjoy coding with Run! 🎉**