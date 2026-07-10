**# Curious Horizons — Project Architecture**



**Version: 1.0**

**Status: FINAL**

**Last Updated: July 2026**



\---



\# IMPORTANT



This document explains how the project is currently structured.



Its purpose is to help coding agents understand the existing architecture before making changes.



The architecture is already working.



Do NOT redesign it.



Understand it first.



Then implement visual changes only.



\---



\# PROJECT OVERVIEW



Curious Horizons is an AI-powered intellectual exploration platform.



The implementation phase focuses ONLY on the visual rebranding from LockedIn AI to Curious Horizons.



The application is already production-ready.



Core functionality already exists.



Only UI implementation remains.



\---



\# HIGH LEVEL ARCHITECTURE



Frontend



↓



FastAPI Backend



↓



Supabase



↓



OpenAI APIs



↓



Knowledge Pack Generation



↓



User



The architecture should remain unchanged.



\---



\# TECH STACK



Frontend



\- HTML

\- CSS

\- Vanilla JavaScript



Backend



\- FastAPI



Authentication



\- Supabase Auth



Database



\- Supabase



Deployment



Frontend



\- Vercel



Backend



\- Render



Payments



\- Razorpay



Testing



\- Playwright



AI



\- OpenAI Models



\---



\# CORE PRINCIPLE



Frontend changes should never require backend modifications unless explicitly requested.



Whenever possible:



Modify CSS.



Modify copy.



Modify icons.



Modify assets.



Avoid changing JavaScript.



Avoid changing backend logic.



\---



\# CURRENT IMPLEMENTATION STATUS



Backend



Stable



Authentication



Working



Session Generation



Working



Knowledge Packs



Working



Payments



Working



Responsive Layout



Working



UI



Approved for visual implementation



\---



\# APPLICATION FLOW



Landing Page



↓



Authentication



↓



Pricing (optional)



↓



Session Configuration



↓



Learning Session



↓



Session Complete



↓



Knowledge Pack Generation



↓



Knowledge Archive



↓



Return



This flow should never change.



\---



\# PAGE RESPONSIBILITIES



Landing Page



Responsible for:



Brand



Introduction



Topic Selection



Search



Navigation



Nothing else.



\---



Authentication



Responsible for:



Login



Signup



Session Recovery



Nothing else.



\---



Pricing



Responsible for:



Subscription selection



Plan comparison



Upgrade



Nothing else.



\---



Session Configuration



Responsible for:



Topic confirmation



Duration



Explanation style



Session settings



Nothing else.



\---



Learning Session



Responsible for:



Reading



Learning



Scrolling



Timer



Exit



This page should remain distraction free.



\---



Session Complete



Responsible for:



Reflection



Feedback



Next action



Knowledge Pack entry



\---



Knowledge Generation



Responsible for:



Transition



Loading



Knowledge preservation



\---



Knowledge Archive



Responsible for:



Viewing generated archive



Export



Copy



Download



Nothing else.



\---



Profile



Responsible for:



Account information



Logout



Nothing more.



\---



\# FILE MODIFICATION RULES



Before editing any file:



Understand why it exists.



Do not refactor files unnecessarily.



Do not move files.



Do not rename files.



Do not split components unless requested.



Preserve project organization.



\---



\# FRONTEND RULES



Prefer modifying:



CSS



Text



Icons



Images



Assets



Avoid changing:



DOM structure



IDs



JavaScript selectors



Data attributes



These may be referenced elsewhere.



\---



\# BACKEND RULES



Do not modify:



FastAPI routes



Business logic



Prompt generation



Authentication



Payments



Database queries



Session logic



OpenAI integration



Unless specifically instructed.



\---



\# SUPABASE



Authentication already exists.



Database already exists.



Respect existing schema.



Do not redesign authentication.



Do not introduce new user flows.



\---



\# PAYMENTS



Razorpay integration already exists.



Preserve existing payment flow.



Visual changes only.



Never modify payment logic without explicit approval.



\---



\# KNOWLEDGE PACKS



Generation logic already exists.



Only terminology and visual presentation should change.



Backend generation remains untouched.



\---



\# EXPORTS



Existing export functionality must remain operational.



Supported exports include:



PDF



Markdown



Notion



Exam Mode



Do not remove formats.



Do not redesign export logic.



\---



\# RESPONSIVENESS



The existing responsive implementation should be preserved.



Visual updates must work across:



Desktop



Laptop



Tablet



Mobile



Always verify after implementation.



\---



\# COMPONENT PHILOSOPHY



Marketing Pages



Homepage



Login



Pricing



Brand presence is strongest.



\---



Preparation Pages



Session Setup



Topic Selection



Brand begins to fade.



\---



Immersion Pages



Learning Session



Session Complete



Knowledge Generation



Knowledge Archive



Profile



The interface disappears.



Knowledge becomes the focus.



This progression is intentional.



Do not reverse it.



\---



\# DESIGN DOCUMENTATION



Always consult:



1\.



DESIGN.md



↓



2\.



IMPLEMENTATION.md



↓



3\.



Approved Mockups



↓



4\.



Existing Code



Only then begin implementation.



\---



\# CODING STYLE



Prefer:



Small changes



Incremental commits



Minimal diffs



Simple CSS



Existing architecture



Avoid:



Large rewrites



Massive refactors



Replacing working code



Changing frameworks



\---



\# ERROR HANDLING



If a requested visual change risks breaking functionality:



Preserve functionality.



Implement the closest safe visual alternative.



Never sacrifice stability for aesthetics.



\---



\# TESTING



After every page implementation verify:



Visual match



Functionality



Responsive behavior



Authentication



Buttons



Forms



Navigation



Console



Performance



Playwright compatibility



\---



\# GIT WORKFLOW



Recommended commit order



Landing



↓



Login



↓



Pricing



↓



Session Setup



↓



Learning Session



↓



Completion



↓



Knowledge Generation



↓



Knowledge Archive



↓



Profile



One page.



One commit.



One verification.



Repeat.



\---



\# FUTURE FEATURES



These are outside the current implementation scope.



Do not implement unless explicitly instructed.



Examples:



Google Calendar integration



Learning schedules



Additional personalization



New AI features



New payment plans



Major UI redesigns



The current objective is implementation only.



\---



\# DECISION HIERARCHY



When making implementation decisions always follow:



1\.



Existing Functionality



↓



2\.



DESIGN.md



↓



3\.



IMPLEMENTATION.md



↓



4\.



Approved Mockups



↓



5\.



Existing Architecture



↓



6\.



Minimal Code Changes



If two options exist,



choose the one requiring fewer structural modifications.



\---



\# FINAL GOAL



The finished application should appear as though Curious Horizons was the original product.



Users should never feel that the application was re-skinned.



Instead, every page should feel intentionally designed as one cohesive experience.



Implementation should preserve architecture while elevating presentation.



\---



END OF ARCHITECTURE DOCUMENT

