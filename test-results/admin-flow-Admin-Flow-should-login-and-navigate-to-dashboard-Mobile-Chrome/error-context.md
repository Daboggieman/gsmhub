# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e7]: admin_panel_settings
        - heading "GSMHub Admin Login" [level=2] [ref=e8]
      - generic [ref=e9]:
        - generic [ref=e10]: Invalid credentials
        - generic [ref=e11]:
          - generic [ref=e12]:
            - generic [ref=e13]: Email address
            - textbox "Email address" [ref=e14]:
              - /placeholder: you@example.com
              - text: admin@gsmhub.com
          - generic [ref=e15]:
            - generic [ref=e16]: Password
            - textbox "Password" [ref=e17]:
              - /placeholder: ••••••••
              - text: x
        - button "Sign in" [ref=e19]
  - button "Open Next.js Dev Tools" [ref=e25] [cursor=pointer]:
    - img [ref=e26]
  - alert [ref=e29]
```