# Knowledge Base

Place any `.md` files in this directory (or subdirectories) and GuardRail will automatically include them as context in every response.

## How it works

- All `.md` files are loaded once at server startup
- They are injected into Claude's system prompt as "System Knowledge Base"
- Claude answers questions as if it has direct knowledge of the described system
- Restart the backend after adding or editing files

## Usage

Create one or more `.md` files describing your system architecture, e.g.:

- `openssl_architecture.md` — component breakdown and data flow
- `deployment_topology.md` — server layout, network zones, dependencies
- `known_issues.md` — legacy quirks, known vulnerabilities, upgrade blockers

## Example file structure

```markdown
# OpenSSL Deployment

## Version
OpenSSL 1.0.2k (legacy, pre-EOL patching window closed)

## Where it runs
- All TLS termination on nginx 1.14 (CentOS 7 hosts)
- Linked by: curl 7.29, OpenSSH 7.4, Python 2.7 ssl module

## Known issues
- Vulnerable to CVE-2022-0778 (infinite loop in BN_mod_sqrt) — patch not applied
- FIPS mode disabled; default provider only
- No OCSP stapling configured
```
