# GitHub Pages Deployment Guide

## Quick Deploy (All Files Already Committed)

Your repository is already set up at: `https://github.com/usabbag/binero`

### Step 1: Push to GitHub

```bash
# Make sure everything is pushed
git push origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repository: https://github.com/usabbag/binero
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under **Source**, select:
   - **Branch:** `main`
   - **Folder:** `/ (root)`
5. Click **Save**

### Step 3: Wait for Deployment

GitHub will automatically build and deploy your site. This takes 1-2 minutes.

Your game will be live at:
```
https://usabbag.github.io/binero/
```

### Step 4: Verify Deployment

1. Wait ~2 minutes
2. Visit: https://usabbag.github.io/binero/
3. Test all three difficulty levels
4. Check browser console for any errors

---

## Future Updates

Whenever you make changes:

```bash
# 1. Make your changes to the code

# 2. Commit changes
git add .
git commit -m "Description of changes"

# 3. Push to GitHub
git push origin main

# 4. Wait ~1-2 minutes for automatic redeployment
# 5. Refresh https://usabbag.github.io/binero/
```

---

## Custom Domain (Optional)

If you want to use your own domain (e.g., `binero.yourdomain.com`):

1. In GitHub Settings → Pages, add your custom domain
2. In your domain registrar's DNS settings, add a CNAME record:
   ```
   CNAME binero.yourdomain.com → usabbag.github.io
   ```
3. Wait for DNS propagation (up to 24 hours)

---

## Troubleshooting

### Site not loading?
- Check GitHub Actions tab for deployment status
- Make sure `index.html` is in the root directory
- Verify branch is set to `main` in Pages settings

### Seeing old version?
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Clear browser cache
- Wait 2-3 minutes for GitHub to rebuild

### Console errors?
- All file paths are relative (✓ already correct)
- No external dependencies needed (✓ pure vanilla JS)

---

## Monitoring

Check deployment status:
- **GitHub Actions:** https://github.com/usabbag/binero/actions
- **Pages Status:** Settings → Pages → "Your site is live at..."

---

## That's It!

Your game is now published and accessible worldwide! 🎉

Share the link: **https://usabbag.github.io/binero/**
