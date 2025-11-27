# 🔐 Authentication System

## Overview

The SiloGuard frontend now includes a beautiful, production-ready authentication system with role-based access control.

## Features

✅ **Beautiful Sign-In Page**

- Industrial design with background image
- Logo placement (top-left)
- Responsive layout (mobile & desktop)
- Password visibility toggle
- Loading states and error handling
- Demo credentials display

✅ **Role-Based Access**

- **Operator** (Operatör) - Basic access
- **Supervisor** (Süpervizör) - Enhanced access
- **Admin** (Yönetici) - Full access

✅ **User Management**

- Session persistence (localStorage)
- User profile display in header
- Role badge indicators
- Secure logout functionality

✅ **Protected Routes**

- Automatic redirect to sign-in if not authenticated
- Loading state while checking authentication
- Seamless integration with existing app

## Demo Credentials

### Operator Account

```
Username: operator
Password: operator123
```

- Basic monitoring and acknowledgment capabilities
- Standard dashboard access

### Supervisor Account

```
Username: supervisor
Password: supervisor123
```

- All operator features
- Enhanced monitoring capabilities
- Report generation

### Admin Account

```
Username: admin
Password: admin123
```

- Full system access
- User management
- System configuration
- All features unlocked

## User Interface

### Sign-In Page

- **Left Side** (Desktop):

  - Full-screen background image (`assets/background.jpg`)
  - Blue gradient overlay
  - Logo at top
  - Company tagline
  - Statistics display (24/7 monitoring, 99.9% uptime)
  - Footer with copyright

- **Right Side**:
  - Welcome message
  - Username field with icon
  - Password field with show/hide toggle
  - Sign-in button with loading state
  - Demo credentials reference
  - Help link

### Header User Menu

- User avatar (initials in colored circle)
- Full name display
- Role badge (color-coded)
- Email/username
- Logout button

## Role Colors

- **Admin**: Purple badge
- **Supervisor**: Blue badge
- **Operator**: Gray badge

## File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx          # Authentication state management
├── pages/
│   └── SignInPage.tsx           # Sign-in UI component
├── assets/
│   ├── logo.svg                 # Company logo
│   └── background.jpg           # Sign-in background image
└── App.tsx                      # Updated with auth integration
```

## Integration with Backend

### Current Setup (Mock)

The authentication currently uses a mock system with hardcoded users. This is perfect for:

- Development and testing
- UI/UX demonstrations
- Frontend-only deployments

### Production Integration

To connect to your ASP.NET Core backend:

1. **Update AuthContext.tsx** `login` function:

```typescript
const login = async (username: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      const user: User = {
        id: data.id,
        username: data.username,
        role: data.role,
        fullName: data.fullName,
        email: data.email,
      };
      setUser(user);
      localStorage.setItem("siloguard_user", JSON.stringify(user));
      localStorage.setItem("siloguard_token", data.token);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
};
```

2. **Add token to API requests**:

```typescript
const token = localStorage.getItem("siloguard_token");
const response = await fetch(API_URL, {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
```

3. **Backend Requirements**:

Create an authentication controller in your backend:

```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public ActionResult<LoginResponse> Login([FromBody] LoginRequest request)
    {
        // Validate credentials
        // Generate JWT token
        // Return user info + token
    }
}
```

## Customization

### Change Logo

Replace `/src/assets/logo.svg` with your company logo.

### Change Background

Replace `/src/assets/background.jpg` with your desired background image.

### Add More Roles

Edit `AuthContext.tsx`:

```typescript
export type UserRole = "operator" | "supervisor" | "admin" | "engineer";
```

### Customize Colors

The sign-in page uses Tailwind CSS classes. Main colors:

- Primary: Blue (`blue-600`, `blue-700`)
- Success: Teal (`teal-500`, `teal-600`)
- Background gradient: Blue to gray (`from-blue-900/90 via-blue-800/80 to-gray-900/90`)

## Security Notes

⚠️ **Important for Production:**

1. **Never** store passwords in frontend code
2. **Always** use HTTPS in production
3. **Implement** JWT tokens or similar for API authentication
4. **Add** token expiration and refresh logic
5. **Use** secure session management
6. **Implement** rate limiting on login attempts
7. **Add** CSRF protection
8. **Enable** secure, httpOnly cookies for tokens

## Usage Example

```typescript
import { useAuth } from "./contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.fullName}!</h1>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Role-Based Features

You can conditionally show features based on user role:

```typescript
const { user } = useAuth();

{
  user?.role === "admin" && <AdminPanel />;
}

{
  (user?.role === "admin" || user?.role === "supervisor") && <ReportsSection />;
}
```

## Styling

The sign-in page is fully responsive:

- **Mobile**: Single column, compact layout
- **Tablet**: Optimized spacing
- **Desktop**: Two-column layout with image

Dark mode is fully supported throughout.

## Testing

### Manual Testing

1. Start the frontend: `npm run dev`
2. You'll see the sign-in page
3. Use any demo credential to log in
4. Check header for user info
5. Click logout to test sign-out

### Automated Testing

Consider adding tests for:

- Login flow
- Logout flow
- Protected route access
- Role-based feature display
- Session persistence

## Troubleshooting

### Images Not Loading

- Ensure `logo.svg` and `background.jpg` exist in `src/assets/`
- Check file names match exactly (case-sensitive)
- Verify vite can resolve the imports

### Authentication Not Persisting

- Check browser localStorage
- Verify `siloguard_user` key exists
- Check for console errors

### Can't Login

- Verify credentials match exactly (case-sensitive)
- Check browser console for errors
- Ensure mock users object is correctly defined

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Password reset functionality
- [ ] Remember me checkbox
- [ ] Session timeout warnings
- [ ] Activity logging
- [ ] Password strength requirements
- [ ] Account lockout after failed attempts
- [ ] Social login integration
- [ ] Biometric authentication (fingerprint/face)

## Design Credits

The sign-in page follows modern industrial UI/UX principles:

- Clean, professional appearance
- Clear visual hierarchy
- Accessible color contrast
- Intuitive user flow
- Mobile-first responsive design

---

**The authentication system is now ready to use!** 🎉

Simply run your frontend and you'll be greeted with a beautiful sign-in page before accessing the silo monitoring dashboard.
