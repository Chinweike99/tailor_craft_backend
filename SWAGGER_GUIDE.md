# TailorCraft API - Swagger Documentation Guide

##  Overview

Your TailorCraft API now includes comprehensive **Swagger/OpenAPI 3.0** documentation. This professional API documentation will be perfect for your job applications and makes it easy for developers to understand and test your API.

## Accessing the Documentation

### Development
```
http://localhost:4000/api-docs
```

### Production
```
https://your-app-name.onrender.com/api-docs
```

## ✨ Features

Your Swagger documentation includes:

### 1. **Interactive API Explorer**
- Test all endpoints directly from the browser
- No need for Postman or cURL
- Real-time request/response examples

### 2. **Complete API Reference**
- ✅ **9 Tagged Sections**: Authentication, Profile, Bookings, Payments, Designs, Guides, Reviews, Admin, Health
- ✅ **40+ Endpoints**: All fully documented with:
  - Request parameters
  - Request body schemas
  - Response schemas
  - Error responses
  - Authentication requirements

### 3. **Professional Schema Documentation**
- **Data Models**: User, Booking, Payment, Design, Guide, Review
- **Request DTOs**: CreateBookingRequest, UpdateProfileRequest, etc.
- **Response Types**: AuthResponse, PaymentStats, AdminStats
- **Error Schemas**: Detailed error responses with status codes

### 4. **Security Documentation**
- JWT Bearer token authentication
- Clear instructions on how to authenticate
- Role-based access control documentation

### 5. **Code Examples**
- JSON request/response examples for every endpoint
- Sample data values
- Multiple error scenario examples

## 🔑 Using the Swagger UI

### Step 1: Authenticate

1. Navigate to `/api-docs`
2. Click on **"POST /auth/login"** or **"POST /auth/register"**
3. Click **"Try it out"**
4. Enter your credentials
5. Click **"Execute"**
6. Copy the `accessToken` from the response

### Step 2: Authorize

1. Click the **"Authorize"** button at the top of the page
2. Enter: `Bearer <your-access-token>`
3. Click **"Authorize"**
4. Click **"Close"**

Now you can test all protected endpoints!

### Step 3: Test Endpoints

1. Select any endpoint
2. Click **"Try it out"**
3. Fill in the required parameters
4. Click **"Execute"**
5. View the response below

## 📊 Documentation Structure

### Tags & Endpoints

#### 🔐 Authentication (7 endpoints)
- `POST /auth/register` - Register new user
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/login` - User login
- `POST /auth/refresh-token` - Refresh JWT token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with OTP
- `POST /auth/logout` - User logout

#### 👤 Profile (3 endpoints)
- `GET /profile` - Get user profile
- `PATCH /profile` - Update profile
- `POST /profile/upload` - Upload profile image

#### 📅 Bookings (5 endpoints)
- `POST /booking` - Create booking
- `GET /booking` - Get user bookings
- `GET /booking/{id}` - Get booking by ID
- `PATCH /booking/{id}/status` - Update status (Admin)
- `GET /booking/admin/all` - Get all bookings (Admin)

#### 💳 Payments (7 endpoints)
- `POST /payment/{id}` - Initialize payment
- `GET /payment/verify` - Verify payment
- `POST /payment/webhook` - Paystack webhook
- `GET /payment/history` - Payment history
- `GET /payment/all-payment` - All payments (Admin)
- `GET /payment/stats` - Payment statistics (Admin)
- `GET /payment/{paymentId}` - Get payment details

#### 🎨 Designs (5 endpoints)
- `GET /design` - Get all designs
- `POST /design` - Create design (Admin)
- `GET /design/{id}` - Get design by ID
- `PATCH /design/{id}` - Update design (Admin)
- `DELETE /design/{id}` - Delete design (Admin)

#### 📖 Guides (5 endpoints)
- `GET /guide` - Get all guides
- `POST /guide` - Create guide (Admin)
- `GET /guide/{id}` - Get guide by ID
- `PATCH /guide/{id}` - Update guide (Admin)
- `DELETE /guide/{id}` - Delete guide (Admin)

#### ⭐ Reviews (3 endpoints)
- `POST /review/{id}` - Create review
- `GET /review` - Get all reviews
- `GET /review/admin` - Admin reviews (Admin)

#### 👨‍💼 Admin (4 endpoints)
- `GET /client` - Get all clients (Admin)
- `GET /client/stats` - Admin statistics (Admin)
- `GET /client/{id}` - Get client by ID (Admin)
- `DELETE /client/{id}` - Delete client (Admin)

#### 🏥 Health (1 endpoint)
- `GET /health` - Health check

## 💼 For Job Applications

### Highlight These Features

1. **Professional API Design**
   - RESTful architecture
   - Consistent naming conventions
   - Proper HTTP status codes
   - Comprehensive error handling

2. **OpenAPI 3.0 Standard**
   - Industry-standard documentation
   - Machine-readable API specification
   - Easy integration with API tools

3. **Security Best Practices**
   - JWT authentication
   - Role-based access control (RBAC)
   - Rate limiting
   - Helmet security headers

4. **Scalable Architecture**
   - Modular code structure
   - Service-oriented design
   - Separation of concerns
   - TypeScript for type safety

5. **Third-Party Integrations**
   - Paystack payment gateway
   - Cloudinary image storage
   - Email services (Resend)
   - Redis caching

6. **Automated Services**
   - Cron jobs for cleanup
   - Email notifications
   - Payment webhooks
   - Delivery reminders

## 🚀 Deployment

Your Swagger documentation is automatically available when you deploy:

### Environment Variables
No additional environment variables needed! The Swagger docs work out of the box.

### Custom Domain
If you have a custom domain, update the servers in `src/config/swagger.config.ts`:

```typescript
servers: [
  {
    url: 'https://api.yourcompany.com/api/v1',
    description: 'Production Server',
  },
],
```

## 📱 Export OpenAPI Spec

You can export the OpenAPI specification for use in other tools:

### JSON Format
Visit: `http://localhost:4000/api-docs.json` (automatically available)

### Use with Other Tools
- **Postman**: Import the OpenAPI spec
- **Insomnia**: Import the OpenAPI spec
- **API Client Generators**: Generate client SDKs
- **Testing Tools**: Automated API testing

## 🎨 Customization

### Change Theme Colors
Edit `src/app.ts`:

```typescript
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Your Custom Title',
  customfavIcon: '/your-icon.ico',
}));
```

### Add More Details
Edit `src/swagger/paths.yaml` to add more examples, descriptions, or endpoints.

### Update Schemas
Edit `src/config/swagger.config.ts` to modify data models and schemas.

## 📝 Screenshots for Portfolio

Take screenshots of:

1. **Welcome Page** - `http://localhost:4000/`
2. **Swagger UI Overview** - Full API documentation page
3. **Authentication Section** - Login/Register endpoints
4. **Schema Definitions** - Show the data models
5. **Try It Out** - Demonstrate the interactive testing
6. **Response Examples** - Show successful API calls

## 🔗 Quick Links

- **API Documentation**: `/api-docs`
- **Health Check**: `/api/v1/health`
- **Main Endpoint**: `/`

## 💡 Tips

1. **Keep Documentation Updated**: Update the YAML files when you add new endpoints
2. **Add Examples**: Real-world examples make documentation more valuable
3. **Test Everything**: Use the "Try it out" feature to verify all endpoints work
4. **Version Control**: The OpenAPI spec serves as API version documentation

## 🎓 Learning Resources

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [API Design Best Practices](https://swagger.io/resources/articles/best-practices-in-api-design/)

---

**Your API is now production-ready with professional documentation! 🎉**

Perfect for:
- Job applications
- Portfolio projects
- Client presentations
- Team collaboration
- API consumers
