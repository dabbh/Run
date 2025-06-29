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
- **🌍 Multi-Language Support**: Supports 12+ popular programming languages
- **🔍 Smart Detection**: Automatically detects file type and shows appropriate run button
- **💻 Terminal Integration**: Executes code in VS Code's integrated terminal
- **💾 Auto-Save**: Automatically saves your file before execution
- **🛡️ Error Handling**: Gracefully handles compilation and runtime errors
- **🔄 Re-run Capability**: Easy to re-run code after fixing bugs

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
| **Python** | `.py` | `python3 "filename.py"` | Python 3.x |
| **Java** | `.java` | `javac *.java && java classname` | JDK |
| **C** | `.c` | `gcc "filename.c" -o output && ./output` | GCC |
| **C++** | `.cpp` | `g++ "filename.cpp" -o output && ./output` | G++ |
| **JavaScript** | `.js` | `node "filename.js"` | Node.js |
| **TypeScript** | `.ts` | `npx ts-node "filename.ts"` | Node.js + ts-node |
| **Go** | `.go` | `go run "filename.go"` | Go compiler |
| **Rust** | `.rs` | `rustc "filename.rs" -o output && ./output` | Rust |
| **PHP** | `.php` | `php "filename.php"` | PHP |
| **Ruby** | `.rb` | `ruby "filename.rb"` | Ruby |
| **C#** | `.cs` | `dotnet run` | .NET SDK |
| **Dart** | `.dart` | `dart run "filename.dart"` | Dart SDK |

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

### macOS
```bash
# Using Homebrew
brew install python3 openjdk node go rust php ruby
xcode-select --install

# .NET SDK
brew install --cask dotnet

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