# Bugfix - Login & Register Critical Issues

## Tanggal: 13 Januari 2026 (Hotfix)

### 🐛 Issues Fixed

#### 1. **✅ FIXED: Duplicate Toaster**
**Problem:**
- Toast notifications muncul 2x (kanan atas DAN kanan bawah)
- Duplicate Toaster di `layout.tsx` dan di setiap page

**Solution:**
- Hapus Toaster dari `layout.tsx`
- Setiap page (login, register, home) manage Toaster sendiri
- Toaster position: **bottom-right only**

**Files Changed:**
- `/frontend/src/app/layout.tsx` - Removed Toaster component

#### 2. **✅ FIXED: reCAPTCHA Theme Requires Refresh**
**Problem:**
- reCAPTCHA tidak otomatis update saat ganti tema
- User harus refresh page untuk melihat tema captcha berubah
- Theme prop tidak cukup untuk force re-render

**Solution:**
- Menggunakan `useRef` untuk reCAPTCHA component
- Menggunakan `key={theme}` untuk force re-render saat theme changes
- Reset captcha saat theme berubah dengan `recaptchaRef.current.reset()`

**Code Implementation:**
```tsx
const recaptchaRef = useRef<ReCAPTCHA>(null);

// Reset captcha when theme changes
useEffect(() => {
    localStorage.setItem('theme', theme);
    if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setCaptchaValue(null);
    }
}, [theme]);

// Force re-render with key prop
<ReCAPTCHA
    ref={recaptchaRef}
    key={theme} // ← This forces re-render
    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
    onChange={(value) => setCaptchaValue(value)}
    theme={isDark ? 'dark' : 'light'}
/>
```

**Result:**
- ✅ Theme toggle → reCAPTCHA instantly updates
- ✅ No refresh needed
- ✅ Captcha value reset on theme change (for security)

#### 3. **✅ FIXED: Page Not Scrollable**
**Problem:**
- Form konten kebesaran (terutama register dengan banyak field)
- Tidak bisa scroll untuk lihat tombol submit
- User tidak bisa complete proses login/register

**Solution:**
- Proper flex layout dengan height constraints
- Top bar: `flex-shrink-0` (fixed)
- Main content: `flex-1 overflow-y-auto` (scrollable)
- Footer: `flex-shrink-0` (fixed)
- Content alignment: `items-start` (mobile), `sm:items-center` (desktop)

**Layout Structure:**
```tsx
<div className="min-h-screen flex flex-col">
    {/* Top Bar - FIXED */}
    <div className="flex-shrink-0 ...">
        ...navbar...
    </div>

    {/* Main Content - SCROLLABLE */}
    <div className="flex-1 overflow-y-auto p-4 flex items-start justify-center sm:items-center">
        <div className="w-full max-w-md my-4">
            ...form...
        </div>
    </div>

    {/* Footer - FIXED */}
    <div className="flex-shrink-0 ...">
        ...copyright...
    </div>
</div>
```

**Key CSS:**
- `min-h-screen flex flex-col` - Full viewport height with flex column
- `flex-shrink-0` - Prevent shrinking (navbar & footer)
- `flex-1 overflow-y-auto` - Take remaining space & enable scroll
- `items-start sm:items-center` - Top align mobile, center desktop
- `my-4` on card - Spacing for scroll area

**Result:**
- ✅ Smooth scrolling on all devices
- ✅ All form fields accessible
- ✅ Submit button always reachable
- ✅ Better UX especially on mobile

### 📊 Before vs After

**Before:**
| Issue | Status |
|-------|--------|
| Duplicate toasts | ❌ 2 toaster instances |
| reCAPTCHA theme | ❌ Needs refresh |
| Page scrolling | ❌ Content cut off |

**After:**
| Issue | Status |
|-------|--------|
| Duplicate toasts | ✅ Single toaster (bottom-right) |
| reCAPTCHA theme | ✅ Auto-update on toggle |
| Page scrolling | ✅ Fully scrollable |

### 🎯 User Impact

**Toaster Fix:**
- Cleaner UI
- No confusion with duplicate notifications
- Consistent toast position across all pages

**reCAPTCHA Fix:**
- Seamless theme switching
- Better UX - no refresh needed
- Security maintained (captcha resets on theme change)

**Scroll Fix:**
- **Critical:** Users can now complete registration/login
- Better mobile experience
- No more "can't see submit button" issues

### 🔧 Technical Details

**1. Toaster Management:**
```tsx
// OLD (layout.tsx + pages)
<Toaster position="top-right" />  // layout.tsx
<Toaster position="bottom-right" />  // login.tsx

// NEW (pages only)
<Toaster position="bottom-right" />  // login.tsx only
```

**2. reCAPTCHA Refs:**
```tsx
// useRef for programmatic control
const recaptchaRef = useRef<ReCAPTCHA>(null);

// Reset on theme change
if (recaptchaRef.current) {
    recaptchaRef.current.reset();
}

// Force re-render with key
<ReCAPTCHA key={theme} ... />
```

**3. Flex Layout:**
```css
/* Container */
display: flex;
flex-direction: column;
min-height: 100vh;

/* Fixed sections */
flex-shrink: 0;

/* Scrollable content */
flex: 1;
overflow-y: auto;
```

### 📸 Testing Scenarios

**Test 1: Toaster**
- [x] Login page shows toast bottom-right only
- [x] Register page shows toast bottom-right only
- [x] Home page shows toast bottom-right only
- [x] No duplicate toasts appear

**Test 2: reCAPTCHA Theme**
- [x] Start in dark mode → captcha is dark
- [x] Toggle to light mode → captcha instantly becomes light
- [x] Toggle back to dark → captcha instantly becomes dark
- [x] No page refresh needed
- [x] Captcha value resets on toggle (user must re-verify)

**Test 3: Scrolling**
- [x] Login page scrolls on small viewport
- [x] Register page scrolls (6 fields + captcha + OAuth)
- [x] Submit button always accessible
- [x] Mobile (375px width) - scrolls properly
- [x] Desktop (1920px) - centered properly

### 🚀 Deployment

```bash
# Stop containers
docker compose down

# Rebuild & restart
docker compose up -d --build
```

**Build Status:** ✅ SUCCESS  
**All Containers:** ✅ RUNNING

### 🎓 Lessons Learned

1. **Global vs Local State:**
   - Toaster should be managed per-page when pages have different themes
   - Global layout.tsx Toaster caused duplicate with page-specific ones

2. **React Re-rendering:**
   - Changing props alone may not force re-render for external components
   - Use `key` prop to force complete component re-mount
   - Refs provide programmatic control (reset, execute methods)

3. **Flexbox Scrolling:**
   - `overflow-y-auto` only works with explicit height constraint
   - Use `flex-1` to make element take remaining space
   - `flex-shrink-0` prevents unwanted shrinking of fixed elements

### ⚡ Performance Notes

- reCAPTCHA re-render on theme change is intentional
- Minimal performance impact (only happens on manual theme toggle)
- Security benefit: captcha value reset prevents potential exploits
- Scrolling performance: native browser scroll (no custom scrollbar)

---

**Status:** ✅ **ALL ISSUES FIXED**  
**Ready for:** ✅ **PRODUCTION**  
**Tested on:** ✅ **Desktop & Mobile**
