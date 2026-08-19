# Trigger ↔ Condition Evidence Log

This document records the literature basis for every entry in `TRIGGER_CONDITION_RELEVANCE`
(`src/types/index.ts`). It exists so that (1) evidence-strength claims made in the app and in
grant materials are traceable to a source, and (2) future re-review is possible when new
research changes the picture — see the "재검토 조건 / Re-review trigger" column.

Source verification round: K-Startup grant literature review (Claude Research), completed in a
session before 2026-08-19. Full source report lives as an artifact in the K-Startup project
thread ("Symply 증상-트리거 ↔ 만성질환 관련성 매핑: 문헌 검증 리포트").

Do not treat `strength` values here as static — this table is the audit trail for why a value
is what it is, and should be updated whenever a value in code changes.

| Trigger | Condition | Strength | Key Source | Re-review trigger |
|---|---|---|---|---|
| gluten | ibs | moderate | Front Nutr 2023 (10.3389/fnut.2023.1273629) | — |
| gluten | crohns | **weak** (downgraded from moderate, 2026-08-19) | Passali et al., *Nutrients* 2020 (10.3390/nu12082316) | Re-upgrade if a large RCT shows disease-activity improvement (fecal calprotectin / endoscopic) from gluten restriction, independent of celiac disease |
| dairy | ibs | moderate | Varjú 2019 systematic review & meta-analysis | — |
| dairy | crohns | **weak** (downgraded from moderate, 2026-08-19) | Szilagyi et al., *Nutr J* 2016 (10.1186/s12937-016-0183-8) — meta-analysis of 17 studies, n=1,935 IBD patients; dairy intake associated with **reduced** Crohn's risk (RR 0.69, 95% CI 0.56–0.86) | Same as above; note the evidence direction is opposite to the "trigger" framing |
| caffeine | ibs | weak | BDA (British Dietetic Association) guideline 2016 | — |
| caffeine | fibromyalgia | weak | Evidence direction unclear / conflicting | — |
| alcohol | crohns | moderate | Rocha et al. 2021 (PMC8667378) | — |
| alcohol | fibromyalgia | weak (reverse direction noted) | Kim 2013 *Arthritis Res Ther*; Scott 2018 *Pain Medicine* — low-to-moderate alcohol intake associated with symptom relief / improved quality of life in some studies | Evidence direction may be opposite to "trigger" framing; see Section 2 proposal for a direction/context flag |
| high_fodmap | ibs | strong | ACG / NICE dietary guidelines | — |
| high_fodmap | crohns | moderate (functional symptoms only, not disease activity) | Peng 2022; Ville 2025 | — |
| sugar | PCOS | moderate | Prior verification (see original trigger catalog work) | — |
| high_glycemic | PCOS | moderate | Prior verification (see original trigger catalog work) | — |
| stress | PCOS | moderate | Case-control study 2023 | — |
| stress | endometriosis | moderate | *Diagnostics* 2024 (PMC11122144) | — |
| stress | fibromyalgia | strong | Crofford 2004 (10.1186/ar1176) | — |
| stress | lupus | moderate | Pawlak 2003; CLUES cohort 2023 | — |
| stress | rheumatoid_arthritis | moderate | Vervloesem 2022 (10.1016/j.semarthrit.2022.152014) | — |
| stress | crohns | moderate | Black 2022 (10.1111/apt.17202) | — |
| stress | ibs | moderate (upgrade candidate) | AGA guideline; EMA 2026 study | Upgrade to strong if AGA/ACG formally elevates stress to a first-line management target |
| stress | chronic_fatigue | strong | Australian longitudinal study 2021 | — |
| poor_sleep | fibromyalgia | strong | Prior verification | — |
| poor_sleep | chronic_fatigue | strong | Prior verification | — |
| poor_sleep | PCOS | moderate | Kahal 2019; Vgontzas 2001 | — |
| overexertion | chronic_fatigue | strong | IOM 2015 (PEM diagnostic criteria) | — |
| overexertion | fibromyalgia | strong | Prior verification | — |
| overexertion | lupus | moderate (tension in evidence) | *Acta Clin Belg* 2023 | — |
| overexertion | rheumatoid_arthritis | **weak** (downgraded from moderate, 2026-08-19) | Cochrane CD006853 (8 RCTs); EULAR 2018 physical activity recommendation — structured moderate exercise is safe and does not increase disease activity. ActConnect cohort (*RMD Open* 2017) observed reverse causation: flares reduce activity, not the other way around | Re-upgrade if a prospective cohort demonstrates "overactivity → flare" causation |
| pressure_change | fibromyalgia | moderate | PLOS ONE 2019 | — |
| temperature_change | fibromyalgia | moderate | Systematic review, ScienceDirect 2021 | — |
| sun_exposure | lupus | strong | SLICC/ACR classification criteria | — |
| (all diet triggers) | endometriosis | intentionally unmapped | Latest systematic/umbrella reviews and 2025 clinical position statements found no diet-specific trigger strong enough to map | Add mapping if a large RCT demonstrates a specific dietary effect |

## Candidate direction/context flags (not yet implemented in code)

These pairs have evidence that isn't fully captured by a single strength label — the finding
is either in the *opposite* direction from what "trigger" implies, or is limited to functional
symptoms rather than disease activity. Flagged here for future implementation (see grant work
order, Section 2) but not yet built into `TRIGGER_CONDITION_RELEVANCE`'s type:

| Trigger | Condition | Note |
|---|---|---|
| alcohol | fibromyalgia | `reverse_direction` — low-moderate intake associated with symptom relief in some studies |
| overexertion | lupus | `self_report_only` — structured moderate exercise improves fatigue without triggering flares in systematic review; "overexertion as trigger" reflects patient self-report only |
| high_fodmap | crohns | `functional_only` — affects functional GI symptoms, not measured disease activity/inflammation |
