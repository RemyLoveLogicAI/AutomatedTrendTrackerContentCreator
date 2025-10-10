# Contributing to Automated Trend Tracker & Content Creator

First off, thank you for considering contributing to this project! It's people like you that make this platform better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior**
- **Actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** - why would this be useful?
- **Proposed solution** or approach
- **Alternative solutions** you've considered

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:
- `good first issue` - simpler issues for beginners
- `help wanted` - issues where we need community help

### Pull Requests

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Add or update tests as needed
5. Ensure all tests pass
6. Update documentation
7. Submit a pull request

## Development Setup

### Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0
- Docker (optional but recommended)
- Git

### Setup Steps

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/AutomatedTrendTrackerContentCreator.git
   cd AutomatedTrendTrackerContentCreator
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

5. **Run tests**
   ```bash
   npm test
   ```

### Project Structure

```
├── src/                    # Backend source code
│   ├── api/               # API routes
│   ├── services/          # Business logic
│   ├── config/            # Configuration
│   ├── middleware/        # Express middleware
│   └── utils/             # Utility functions
├── frontend/              # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── services/      # API services
│   └── public/            # Static files
├── k8s/                   # Kubernetes configurations
└── tests/                 # Test files
```

## Pull Request Process

### Before Submitting

1. **Update documentation** - README, API docs, code comments
2. **Add tests** - ensure new features are tested
3. **Run linter** - `npm run lint`
4. **Run tests** - `npm test`
5. **Update CHANGELOG** - if applicable
6. **Rebase on main** - ensure your branch is up to date

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed the code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] Added tests
- [ ] All tests pass
- [ ] No new warnings
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be included in the next release!

## Coding Standards

### JavaScript/Node.js

- Use **ES6+** features
- Follow **ESLint** configuration
- Use **async/await** for asynchronous code
- Add **JSDoc comments** for functions
- Keep functions **small and focused**

### React/Frontend

- Use **functional components** with hooks
- Follow **React best practices**
- Use **TailwindCSS** for styling
- Keep components **reusable**

### Git Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(api): add endpoint for video generation
fix(trends): resolve Twitter API rate limiting issue
docs(readme): update installation instructions
```

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Line length**: Maximum 100 characters
- **Naming**:
  - Variables/functions: `camelCase`
  - Classes: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Files: `camelCase.js` or `PascalCase.jsx`

### Testing

- Write **unit tests** for services and utilities
- Write **integration tests** for API endpoints
- Aim for **80%+ code coverage**
- Use **meaningful test descriptions**

Example:
```javascript
describe('trendDetection API', () => {
  it('should return trends from Twitter', async () => {
    const response = await request(app)
      .get('/api/trends?source=twitter')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
  });
});
```

## Documentation

### Code Documentation

- Add JSDoc comments for all public functions
- Include parameter types and return types
- Provide usage examples for complex functions

```javascript
/**
 * Generate text content using AI
 * @param {Object} options - Generation options
 * @param {string} options.topic - Content topic
 * @param {string} options.type - Content type (blog, tweet, etc.)
 * @param {string} options.tone - Content tone
 * @returns {Promise<Object>} Generated content
 */
async function generateText(options) {
  // Implementation
}
```

### API Documentation

- Update API documentation for new endpoints
- Include request/response examples
- Document all parameters and responses

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Pull Requests**: Code contributions

### Getting Help

- Check existing **documentation** first
- Search **GitHub Issues** for similar problems
- Ask in **GitHub Discussions**
- Be patient and respectful

### Recognition

Contributors will be:
- Listed in the README
- Mentioned in release notes
- Acknowledged in the project

## License

By contributing, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers the project.

---

## Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!

**Happy Coding! 🚀**
