## ADDED Requirements
### Requirement: Google Analytics page tracking
The page SHALL asynchronously load the Google tag and initialize G-7ENQ4BFR7C once per document load.
#### Scenario: A1 Page load
- **WHEN** the document loads
- **THEN** the Google tag script is loaded asynchronously
- **AND** dataLayer receives js and config commands for G-7ENQ4BFR7C
