# Changelog

All notable changes to the "Run!" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.0] - 2025-07-20

### Added
- **Automatic Directory Navigation**: Every command now automatically includes a `cd` to the file's directory before execution for security and reliability
- Enhanced cross-platform command building with proper PowerShell and Bash syntax
- Comprehensive documentation website with 8 detailed guides
- Smart autocompletion for .Run configuration files
- Cookie-based progress tracking for documentation guides
- Global .Run file support in user's home directory
- Safe mode with temporary executable cleanup
- Support for placeholder variables: `{filename}` and `{filenameWithExt}`
- Enhanced terminal integration with colored output and icons

### Changed
- Improved error handling and user feedback messages
- Better file path handling with escaped directory paths
- Updated documentation with comprehensive examples and troubleshooting
- Enhanced status bar with language-specific display names

### Fixed
- Directory navigation issues when running code from different locations
- Cross-platform compatibility for Windows PowerShell and Unix shells
- File permission issues with automatic executable cleanup
- Path handling for files with spaces and special characters

### Security
- Mandatory `cd` command cannot be disabled or overridden by custom configurations
- Improved path escaping and sanitization
- Safe mode enabled by default for compiled languages

## [0.5.0] - 2025-07-20

### Added
- Multi-language support for 13+ programming languages
- .Run configuration file system
- Global configuration support
- Interactive walkthrough and tutorials

### Changed
- Improved compilation and execution workflow
- Enhanced terminal integration

### Fixed
- Various compilation and execution bugs

## [0.4.0] - 2025-07-20

### Added
- Enhanced language support
- Custom compilation flags
- Safe mode for temporary executables

### Fixed
- Cross-platform compatibility issues
- File handling improvements

## [0.3.2] - 2025-07-13

### Added
- Initial multi-language support
- Basic .Run file configuration
- Status bar integration

### Fixed
- Initial bugs and stability issues

## [0.1.0] - 2025-06-27

### Added
- Initial release
- Basic code execution functionality
- Support for C, Python, and Java