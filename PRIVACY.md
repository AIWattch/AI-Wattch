# Privacy Policy

AI Wattch is built with a **privacy-first** philosophy. We believe that tracking your environmental impact should not come at the cost of your personal privacy. This document outlines how we handle your data.

## 1. No Collection of Personal Data

AI Wattch **does not collect** your:

- Name, address, or contact details (unless you explicitly provide them via the feedback form).
- Browsing history outside of supported AI platforms.
- Search queries or any other sensitive personal information.

## 2. No Conversation Content Access

We value the confidentiality of your interactions with AI:

- **We do not read, store, or transmit your chat text, prompts, or AI responses.**
- The extension only parses the page for lightweight metadata required for emissions calculation (token counts, timestamps, and model identifiers).

## 3. Data Handling and Storage

### Local Storage

All session data and user settings are stored **locally** on your device using your browser's internal storage (`chrome.storage.local`). This data never leaves your device unless triggered by the specific actions mentioned below.

### Local Processing

Emissions calculations are performed either locally or through a stateless API call that uses non-identifiable session metrics.

## 4. Operational Data Transmission

To provide emissions estimates, AI Wattch transmits limited, non-identifiable technical data:

### Emissions Calculation API

When calculating your footprint, the extension sends a request to Antarctica's One Token Model (OTM) API (`otm-api.antarctica.io`). This request includes:

- **Model Metadata**: Identifiers for the AI model being used.
- **Session Metrics**: Token counts and computation timestamps.
- **Regional Factors**: Non-precise location parameters (e.g., country-level emission factors).
- **NO conversation text** is ever sent as part of this process.

### Optional Location Detection

You can choose to use IP-based location detection to automatically set your regional carbon intensity. This is optional, and you can manually set your location at any time in the settings.

### Feedback Submission

If you choose to use the "Share Feedback" feature, the information you provide (name, email, and comments) is sent via **EmailJS** to the project maintainers. This is the only part of the extension that handles personal contact information.

## 5. Third-Party Services

We use the following services for core functionality:

- **Antarctica OTM API**: For performing stateless environmental impact calculations.
- **EmailJS**: Only for processing user-initiated feedback submissions.

## 6. User Control

You have full control over your data:

- **Reset Data**: You can clear all session history at any time from the dashboard.
- **Manual Configuration**: You can override automatic detection for any parameter (model, location, calculation method).
- **Uninstall**: Uninstalling the extension automatically removes all locally stored data.

## 7. Contact Us

If you have any questions about this Privacy Policy or our data practices, please contact us at:

- **Email**: [contact@antarcticaglobal.com](mailto:contact@antarcticaglobal.com) or [security@itclimateed.com](mailto:security@itclimateed.com)

**Last Updated:** January 2026
