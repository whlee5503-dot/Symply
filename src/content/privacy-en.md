# Symply Privacy Policy

**Last updated: [DATE TO BE FILLED WHEN PUBLISHED]**

Symply ("we," "our," or "the App") is a chronic symptom tracking application developed by
PublicHealth Tech Lab, operated by Won Ho ("we," "us"). This Privacy Policy explains what
information we collect, how we use it, and the choices you have.

Symply is designed for people managing chronic conditions such as PCOS, endometriosis,
fibromyalgia, lupus, rheumatoid arthritis, Crohn's disease, IBS, and ME/CFS (chronic fatigue
syndrome). Because the App handles health-related information, we take extra care to explain
our data practices clearly.

**We do not run ads, and we do not sell your data — to anyone, ever.**

---

## 1. Information We Collect

### 1.1 Account Information
When you sign in with Google, we receive your **name, email address, and profile photo** from
Google, and Firebase Authentication assigns your account a unique identifier (UID). We use this
solely to identify your account and keep your data linked to you across devices.

### 1.2 Health and Symptom Data
This is the core data you enter into the App, including:
- Daily pain and fatigue scores
- Symptom logs and notes
- Trigger information (diet, sleep, stress, weather, etc.)
- Menstrual cycle data (if you choose to log it)
- The chronic condition(s) you select in your profile

This information is stored securely in our cloud database (Firebase Firestore) under your
account, so that it is preserved even if you lose or replace your phone, and so you can access
it from any device you sign into.

### 1.3 Usage and Analytics Data
We use Firebase Analytics to understand general usage patterns (e.g., which screens are used,
how often the App is opened). This helps us improve the App. This data is aggregated and is not
used to build an advertising profile of you.

### 1.4 Subscription and Payment Information
If you subscribe to Symply Pro, our payment processor, Polar, receives your **email address**
to process the transaction. **We do not receive or store your payment card details** — these
are handled entirely by Polar.

---

## 2. How We Use Your Information

We use the information described above to:
- Provide and maintain the core symptom-tracking functionality
- Generate AI-powered pattern analysis and insights from your symptom logs (see Section 3)
- Preserve your data across app reinstalls and devices
- Process subscription payments
- Improve the App based on aggregate usage trends
- Respond to support requests you send us

We do **not** use your health data for advertising, and we do **not** sell your data to third
parties.

---

## 3. AI-Powered Analysis

When you request a pattern analysis or insight report, the App sends your **symptom logs**
(including pain/fatigue scores, dates, notes, trigger data, and, if logged, menstrual cycle
data) to Anthropic's Claude API to generate the analysis. Your name is **not** included in this
request.

- This transmission is **transient**: the data is sent for the purpose of generating your
  report and is not used by Anthropic to train its models under Anthropic's API terms, and is
  not permanently retained by Anthropic beyond what is necessary to process the request and for
  standard short-term operational/safety logging.
- The generated analysis is returned to your device and (if you save it) stored in your account
  as described in Section 1.2.
- You can choose whether or not to request AI analysis; it is not automatic.

For more detail on how Anthropic handles data submitted through its API, see Anthropic's
Privacy Policy: https://www.anthropic.com/legal/privacy

---

## 4. Third-Party Service Providers

We rely on the following third-party services to operate Symply. Each acts as a data processor
for the specific purpose described:

| Provider | Purpose | Data Involved |
|---|---|---|
| **Google Firebase** (Authentication, Firestore, Analytics) | Sign-in, cloud storage of your logs, usage analytics | Name, email, profile photo, symptom logs, usage events |
| **Anthropic (Claude API)** | AI-generated symptom pattern analysis | Symptom logs (transient processing, see Section 3) |
| **Polar** | Subscription/payment processing | Email address (for checkout only) |

Each of these providers has its own privacy policy governing how they handle data on our
behalf:
- Google/Firebase: https://firebase.google.com/support/privacy
- Anthropic: https://www.anthropic.com/legal/privacy
- Polar: https://polar.sh/legal/privacy

---

## 5. International Data Transfers

Symply is developed in the Republic of Korea, but our service providers (Google Firebase,
Anthropic, Polar) process data on servers that may be located outside Korea, including in the
United States. By using Symply, you understand that your information may be processed in
countries other than your own, under the safeguards each provider maintains.

---

## 6. Data Retention

We retain your account and symptom data for as long as your account remains active, so that
your longitudinal symptom history remains available to you and to any doctor you choose to
share it with. If you delete your account (see Section 7), we delete your associated data from
our active systems, except where retention is required for legal, security, or fraud-prevention
purposes.

---

## 7. Your Rights and Choices

You can:
- **Access** your data at any time within the App
- **Export** your symptom logs (e.g., as a PDF report for your doctor)
- **Delete your account and data** by contacting us at the email below, or through the in-app
  account deletion option if available
- **Opt out of AI analysis** by simply not requesting it — logging symptoms does not require
  using the AI analysis feature

---

## 8. Children's Privacy

Symply is not directed at children and is not intended for use by anyone under the age of 14.
We do not knowingly collect information from children under 14. If we become aware that we have
collected such information, we will delete it.

---

## 9. Security

We rely on industry-standard security practices provided by our infrastructure partners
(Google Firebase's authentication and database security rules, encrypted connections (HTTPS)
for all data in transit). No method of transmission or storage is 100% secure, but we work to
protect your information using commercially reasonable safeguards.

---

## 10. Changes to This Policy

We may update this Privacy Policy from time to time as the App evolves (for example, if we add
new features, languages, or service providers). We will update the "Last updated" date above
when we do. Continued use of the App after changes take effect constitutes acceptance of the
updated policy.

---

## 11. Contact Us

If you have questions about this Privacy Policy or wish to exercise your rights (access,
export, deletion), please contact us at:

**Email**: contact@phtlab.org
**Developer**: PublicHealth Tech Lab (Won Ho), Daejeon, Republic of Korea

---

*This document is also available in Korean (한국어) and Spanish (Español) — see the links in the
App or on our website.*
