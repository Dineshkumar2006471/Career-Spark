# Lessons

- When building form wrappers, pass through the native `type` prop and set submit CTAs to `type="submit"`; otherwise registration/login forms can look clickable while never firing `onSubmit`.
- Supabase email signup may return no active session when email confirmation is enabled. Registration screens must show a confirmation notice instead of blindly navigating into protected onboarding.
- Onboarding uploads should match the user's mental model. If a resume upload is part of profile creation, show upload states only and keep ATS scoring/analysis output for the dashboard resume experience.
- Profile completion redirects must verify the saved row used by the route guard, not just call `navigate`. Reload by authenticated `user_id` deterministically and use `replace` after successful completion.
- Authenticated apps need one shared user menu component across nav surfaces so initials, Profile, and Logout behavior stay consistent.
- Do not let secondary onboarding writes such as skill-progress seeding block the primary profile-complete redirect. Save the profile first, mark completion, navigate, and run secondary persistence best-effort.
- Browser-side RLS writes must never return `null` as a success path when no authenticated user is available. Throw a visible error, because otherwise onboarding can appear finished while no profile row exists.
- First-login routes should redirect completed users away before rendering blank setup forms. Use an explicit edit route/query for profile updates.
