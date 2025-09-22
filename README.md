# 🧁 Spooky Baby Sweets Website

A responsive single-page website for Spooky Baby Sweets - handmade treats with a cute spooky twist!

## 🚀 Quick Start

1. **Add your logo**: Place `logo-horizontal.png` in the `assets/` directory
2. **Configure email**: Update the email addresses in `script.js` and `index.html`
3. **Set up Formspree** (optional): Replace `YOUR_FORMSPREE_ID` in `script.js` with your actual Formspree ID
4. **Open in browser**: Simply open `index.html` in your web browser

## 📁 Project Structure

```
spooky_baby/
├── index.html          # Main HTML structure
├── styles.css          # Complete responsive styling
├── script.js           # Interactive functionality
├── assets/             # Logo and media files
│   ├── logo-horizontal.png  # Your logo (add this)
│   └── README.md       # Assets instructions
└── README.md          # This file
```

## 🎨 Features

- **Responsive Design**: Looks great on desktop, tablet, and mobile
- **Smooth Scrolling**: Navigation smoothly scrolls to sections
- **Active Nav Highlighting**: Shows current section in navigation
- **Order Form**: Integrated with Formspree + mailto fallback
- **Accessibility**: WCAG AA compliant with keyboard navigation
- **Performance**: Optimized with lazy loading and efficient code
- **Brand Colors**: Custom color scheme with pink, yellow, and cream accents

## 🛠️ Configuration

### Email Setup
Update these email addresses to your own:
- Line 4 in `script.js`: `EMAIL_FALLBACK: 'orders@yourdomain.com'`
- Line 140 in `index.html`: Contact section mailto link
- Line 151 in `index.html`: Footer contact info

### Formspree Integration (Optional)
1. Sign up at [formspree.io](https://formspree.io)
2. Create a new form and get your form ID
3. Replace `YOUR_FORMSPREE_ID` on line 3 of `script.js` with your actual ID

### Logo
- Add your `logo-horizontal.png` file to the `assets/` directory
- Recommended size: 200-300px wide, transparent PNG
- The logo will automatically appear in the header

## 🎯 Sections

1. **Header/Nav**: Sticky navigation with logo and links
2. **Hero**: Eye-catching intro with call-to-action buttons
3. **Menu**: Three cards showcasing cupcakes, cake pops, and seasonal items
4. **Order**: Contact form with validation and error handling
5. **Contact**: Direct contact information and email link
6. **Footer**: Copyright and branding

## 🌐 Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Graceful degradation for older browsers

## 📱 Responsive Breakpoints

- Desktop: 1200px+ (full layout)
- Tablet: 768px-1199px (adapted layout)
- Mobile: 480px-767px (stacked layout)
- Small Mobile: <480px (compact layout)

## ♿ Accessibility

- Keyboard navigation support
- Screen reader friendly
- High contrast support
- Focus indicators
- Semantic HTML structure
- ARIA labels where needed

## 🎨 Color Palette

- Background: `#1F1F1F` (dark)
- Secondary: `#262626` (dark gray)
- Primary Text: `#F3F3F3` (light)
- Secondary Text: `#CFCFCF` (gray)
- Accent Pink: `#F6B6CF`
- Accent Yellow: `#F7D56A`
- Accent Cream: `#FDEEDB`

## 🔧 Customization

The website is built with CSS custom properties (variables), making it easy to customize colors, fonts, and spacing. All variables are defined at the top of `styles.css`.

---

Made with 💖 for Spooky Baby Sweets

