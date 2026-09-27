# Clerk production DNS for dll-studio.com

Add these five CNAME records in the existing Squarespace DNS settings. Preserve all existing website and email records. Host names below are relative to `dll-studio.com`.

| Type | Host | Value |
| --- | --- | --- |
| CNAME | clerk | frontend-api.clerk.services |
| CNAME | accounts | accounts.clerk.services |
| CNAME | clkmail | mail.rbk5no2gv412.clerk.services |
| CNAME | clk._domainkey | dkim1.rbk5no2gv412.clerk.services |
| CNAME | clk2._domainkey | dkim2.rbk5no2gv412.clerk.services |

Production instance: `ins_3JurfcIuYSti6E1xxYUQVvUsGfG`. Email/password authentication is enabled; phone/SMS and Google login are disabled. No paid Clerk upgrade was purchased.

After saving, run `npx clerk deploy status` from `website` to verify DNS and SSL. Do not publish production authentication until verification succeeds. Development and production accounts are separate: Vinny and Diana must register/verify their addresses in production as well; the server grants administrator access automatically to their exact verified primary addresses.
