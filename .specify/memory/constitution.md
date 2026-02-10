<!-- 
SYNC IMPACT REPORT
Version: Initial -> 1.0.0
Modified Principles:
- Defined I. Layered Architecture
- Defined II. Database Per Service
- Defined III. RESTful API Standards
- Defined IV. Resilience & Caching
- Defined V. Technology Compliance
Added Sections:
- Additional Standards (DTOs, Normalization)
- Development Workflow (API First)
Templates Updated:
- None (Templates reference constitution generically)
TODOs:
- None
-->

# Siloam SDD EMR Constitution
<!-- Specification for Siloam SDD EMR Node.js Backend -->

## Core Principles

### I. Layered Architecture (NON-NEGOTIABLE)
<!-- Source: Siloam Development Guide Ch.3 -->
Strict separation of concerns is enforced: Middleware → Controller → Service → Repository. Dependencies flow downwards only (never upwards). Controllers MUST handle HTTP req/res only and contain NO business logic or direct DB access. Services orchestrate business logic. Repositories handle data access.
**Rationale**: Ensures maintainability, testability, and clear separation of responsibilities as per Siloam Microservice Architecture.

### II. Database Per Service
<!-- Source: Siloam Development Guide Ch.2 -->
Each microservice MUST own its dedicated database. Direct database access across service boundaries is PROHIBITED. Data sharing MUST be performed via API calls. Shared data needs its own service (e.g., Customer Service owns customer data).
**Rationale**: Enables independent scaling, schema evolution, and fault isolation ("The Golden Rule").

### III. RESTful API Standards
<!-- Source: Siloam Development Guide Ch.5, Ch.6, Ch.7 -->
URIs MUST use nouns for resources (e.g., `/customers`, not `/getCustomers`) and be plural. Filtering, sorting, and pagination MUST use query parameters (e.g., `?sort=-created_at`). Versioning MUST be done via URI path (e.g., `/v1/...`). OpenAPI/Swagger documentation is MANDATORY for all APIs.
**Rationale**: Ensures consistent, intuitive, and discoverable interfaces across the ecosystem.

### IV. Resilience & Caching
<!-- Source: Siloam Development Guide Ch.3 -->
External service calls MUST implement Circuit Breaker and Retry patterns (with exponential backoff). Caching (Redis/Valkey) using the Cache-Aside pattern is REQUIRED for frequently accessed, read-heavy data. Aggressive timeouts MUST be set for all external dependencies.
**Rationale**: Prevents cascading failures and ensures system stability under load.

### V. Technology Compliance
<!-- Source: Siloam Development Guide Ch.1 -->
Backend services MUST use Node.js (Latest LTS), TypeScript, and PostgreSQL. MongoDB usage requires explicit Architecture Board approval. 
**Rationale**: Standardizes the technology stack to ensure consistent tooling, knowledge sharing, and operational efficiency.

## Additional Standards
<!-- Detailed technical constraints from Siloam Guide -->

### Data & Code Patterns
*   **DTO Pattern**: Request and Response DTOs are MANDATORY to decouple API contracts from domain entities.
*   **Normalization**: Database schemas MUST follow at least 2NF (Second Normal Form) to reduce redundancy.
*   **Logging**: Middleware MUST handle cross-cutting concerns like logging and authentication.
*   **Async Communication**: Prefer asynchronous messaging (AWS SQS/SNS) for non-critical inter-service notifications.

## Development Workflow
<!-- Process requirements -->

### API-First Design
*   **Contract Definition**: API contracts (following Principle III) and OpenAPI specifications should be defined before implementation logic.
*   **Reviews**: Code reviews MUST verify adherence to Layered Architecture (Principle I) - specifically checking that Controllers are thin and Repositories contain no business logic.

## Governance
<!-- Constitution maintenance -->

This Constitution supersedes local READMEs where conflicts exist.
Amendments must follow semantic versioning.
*   **Major**: Breaking changes to architectural patterns (e.g., changing Layered Architecture).
*   **Minor**: Adding new standard technologies or resilience patterns.
*   **Patch**: Clarifications or typo fixes.

**Version**: 1.0.0 | **Ratified**: 2026-02-09 | **Last Amended**: 2026-02-09
