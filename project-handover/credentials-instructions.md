# Credentials & Access Management

## Shopify Store Access

### Adding Collaborators
1. Go to Shopify Admin → Settings → Users and permissions
2. Click "Add staff"
3. Enter email address and select appropriate permissions:
   - **Store owner**: Full access (for transfer)
   - **Staff**: Limited access for developers/designers
   - **Collaborator**: Theme-only access

### Recommended Permissions for Developers
- **Themes**: Full access
- **Online Store**: Full access  
- **Products**: View and edit
- **Orders**: View only
- **Apps**: Install and configure

### Store Ownership Transfer
1. Go to Settings → Account
2. Click "Transfer ownership"
3. Enter new owner's email
4. New owner must accept transfer via email
5. **Note**: Only one store owner allowed per store

## GitHub Repository Access

### Adding Collaborators
1. Go to repository Settings → Manage access
2. Click "Invite a collaborator"
3. Enter GitHub username or email
4. Select permission level:
   - **Admin**: Full repository access
   - **Write**: Push/pull access
   - **Read**: View-only access

## Development Environment

### Required Access
- Shopify Partner account (for theme development)
- GitHub account (for version control)
- Shopify CLI access (for local development)

### Security Best Practices
- Use strong, unique passwords
- Enable 2FA on all accounts
- Regularly review access permissions
- Remove access for inactive users
- Use environment variables for sensitive data

## Handover Checklist
- [ ] Shopify store access granted
- [ ] GitHub repository access granted  
- [ ] Theme files transferred
- [ ] App configurations documented
- [ ] Domain/DNS settings documented
- [ ] Payment gateway settings verified
- [ ] Shipping settings verified
