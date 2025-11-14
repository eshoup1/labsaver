# Contributing to Function Health Lab Exporter

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature or bugfix
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## Development Setup

1. Load the extension in Chrome:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `function-health-exporter` directory

2. Set up OAuth credentials (see README.md)

3. Test your changes on Function Health

## Code Style

- Use clear, descriptive variable names
- Add comments for complex logic
- Follow existing code formatting
- Keep functions focused and single-purpose

## Testing

Before submitting a PR:
- Test the extension with real Function Health data
- Verify OAuth flow works correctly
- Check that data exports correctly to Google Sheets
- Test error handling scenarios

## Pull Request Process

1. Update README.md if you've changed functionality
2. Update version number in manifest.json if appropriate
3. Describe your changes clearly in the PR description
4. Link any related issues

## Reporting Bugs

When reporting bugs, please include:
- Chrome version
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)

## Feature Requests

Feature requests are welcome! Please:
- Check if the feature has already been requested
- Clearly describe the use case
- Explain how it would benefit users

## Questions?

Feel free to open an issue for questions or discussions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.