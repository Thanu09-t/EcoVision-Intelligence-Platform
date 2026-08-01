# Security Policy 🛡️

The EcoVision AI team takes software security and municipal infrastructure protection seriously. We appreciate the contributions of security researchers and developers in keeping our platform secure.

---

## 🎯 Supported Versions

We issue security patches and updates for the following active versions of EcoVision AI:

| Version | Supported          | Security Maintenance Level |
| ------- | ------------------ | -------------------------- |
| 2.4.x   | :white_check_mark: | Full Active Support        |
| 2.3.x   | :white_check_mark: | Critical Patches Only      |
| < 2.3.0 | :x:                | End of Life                |

---

## 🔒 Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report vulnerabilities directly to our Security Operations team:

- **Email**: [security@ecovision.ai](mailto:security@ecovision.ai)
- **PGP Key**: Available upon request for encrypted communications.

### What to Include in Your Report
To help us triage and resolve the issue quickly, please include:
1. Type of vulnerability (e.g. SQL injection, JWT token bypass, XSS, unauthorized API endpoint access).
2. Affected component (`backend`, `landing-page`, `citizen-app`, `municipal-dashboard`, or `database`).
3. Step-by-step instructions to reproduce the vulnerability (proof of concept code or HTTP request snippets).
4. Potential impact on municipal data or platform availability.

---

## ⏱️ Response Timeline

- **Initial Acknowledgment**: Within 24 hours of receiving the report.
- **Triage & Assessment**: Within 48–72 hours.
- **Fix & Patch Release**: Critical vulnerabilities are patched within 7 business days; non-critical items within 14 business days.
- **Public Disclosure**: Coordinated disclosure after patches are deployed to production systems.

---

## 🗝️ Best Security Practices for Deployments

When deploying EcoVision AI in production environments:
1. **Never use default secret keys**: Always replace default `SECRET_KEY` values in `.env`.
2. **Database Access**: Ensure PostGIS / Supabase connection strings use SSL/TLS (`sslmode=require`).
3. **API Authorization**: Keep `CORS_ORIGINS` strictly scoped to authorized domain names.
4. **Environment Variables**: Never commit `.env` or API credentials to public Git repositories.
