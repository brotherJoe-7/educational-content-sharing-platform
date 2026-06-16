# Contributing to Open Content Sierra Leone

Thank you for your interest in contributing to the Educational Content Sharing Platform! This document provides guidelines for contributors.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, browser)
   - Screenshots if applicable

### Suggesting Enhancements

1. Check existing feature requests
2. Create a new issue with:
   - Clear description of the enhancement
   - Use case and benefits
   - Possible implementation approach
   - Examples or mockups

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following coding standards
4. Write tests for new functionality
5. Commit with clear messages:
   - Use present tense ("Add feature" not "Added feature")
   - Be specific ("Add user authentication" not "Add stuff")
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request with:
   - Clear title and description
   - Reference related issues
   - Screenshots for UI changes
   - Testing instructions

### Coding Standards

#### Backend (Node.js/Express)

- Use camelCase for variables and functions
- Use PascalCase for classes and models
- Add JSDoc comments for functions
- Follow existing code style
- Handle errors properly
- Validate input data
- Use async/await for asynchronous operations

#### Frontend (React/Next.js)

- Use functional components with hooks
- Use PascalCase for components
- Use camelCase for variables and functions
- Follow existing code style
- Add comments for complex logic
- Use TailwindCSS for styling
- Keep components small and focused

### Testing

- Write unit tests for utility functions
- Write integration tests for API endpoints
- Test UI components
- Ensure all tests pass before submitting PR

### Documentation

- Update README for new features
- Add inline comments for complex code
- Update API documentation
- Document environment variables
- Add examples for new functionality

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd frontend
   npm install
   ```
3. Set up environment variables (see .env.example files)
4. Start development servers:
   ```bash
   # Backend
   cd backend
   npm run dev
   
   # Frontend (new terminal)
   cd frontend
   npm run dev
   ```

## Project Structure

```
.
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── pages/           # Next.js pages
│   ├── components/      # Reusable components
│   ├── context/         # React context
│   ├── styles/          # Global styles
│   └── package.json
├── README.md
├── LICENSE
└── CONTRIBUTING.md
```

## Areas for Contribution

### High Priority
- Add unit tests
- Improve error handling
- Add more file type support
- Implement offline access (PWA)
- Add email notifications

### Medium Priority
- Improve UI/UX
- Add advanced search filters
- Implement resource categories
- Add user profiles
- Add resource favorites/bookmarks

### Low Priority
- Add dark mode
- Implement chat/discussion
- Add resource recommendations
- Add analytics dashboard
- Multi-language support

## Getting Help

- Read existing documentation
- Check GitHub Issues
- Ask questions in issues (tag with "question")
- Join community discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be acknowledged in:
- README.md
- Release notes
- Project documentation

Thank you for contributing to Open Content Sierra Leone! 🎓
