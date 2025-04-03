# Memory in a Jar - Deployment and Maintenance Documentation

## Overview

Memory in a Jar is a web application that allows two people in a relationship to privately log memories and reveal them at a predetermined time. This document provides information on how to maintain and update the application after deployment.

## Architecture

The application uses the following technologies:
- **Frontend**: React with TypeScript
- **Backend**: Supabase (PostgreSQL database, authentication, storage)
- **Hosting**: Vercel

## Environment Variables

### Frontend (Vercel)
- `REACT_APP_SUPABASE_URL`: Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `REACT_APP_WEBSITE_URL`: Your Vercel deployment URL

## Database Schema

The application uses the following tables in Supabase:
- `profiles`: User profiles extending Supabase Auth
- `relationships`: Relationship data between two users
- `memories`: Memory entries created by users
- `memory_attachments`: Files attached to memories
- `notifications`: System notifications for users
- `exports`: Export requests and results

## Authentication

The application uses Supabase Auth with the following providers:
- Google OAuth
- Email/Password (optional)

## Storage

Memory attachments are stored in Supabase Storage in the `memory_attachments` bucket with the following structure:
- `{user_id}/{relationship_id}/{memory_id}/{filename}`

## Security

The application implements Row Level Security (RLS) policies in Supabase to ensure:
- Users can only access their own data
- Memories are only visible after the relationship is completed
- Files are protected based on relationship status

## Maintenance Tasks

### Updating the Frontend

1. Make changes to the code locally
2. Test changes thoroughly
3. Commit and push to GitHub
4. Vercel will automatically deploy the changes

### Database Migrations

To update the database schema:
1. Create a new SQL migration file
2. Test the migration locally
3. Apply the migration in the Supabase dashboard SQL Editor

### Adding New Features

When adding new features:
1. Update the frontend code
2. Update the database schema if necessary
3. Update security policies if necessary
4. Test thoroughly before deployment

## Monitoring and Troubleshooting

### Vercel Logs

Access deployment and runtime logs in the Vercel dashboard:
1. Go to your project in Vercel
2. Navigate to "Deployments"
3. Select the deployment to view logs

### Supabase Logs

Access database and authentication logs in the Supabase dashboard:
1. Go to your project in Supabase
2. Navigate to "Database" → "Logs" or "Authentication" → "Logs"

## Backup and Recovery

### Database Backups

Supabase automatically creates daily backups of your database. To restore:
1. Go to your project in Supabase
2. Navigate to "Database" → "Backups"
3. Select the backup to restore

### Manual Backups

To create a manual backup:
1. Go to your project in Supabase
2. Navigate to "Database" → "SQL Editor"
3. Use pg_dump to export your data

## Common Issues and Solutions

### Authentication Issues

If users are having trouble logging in:
1. Check Supabase authentication logs
2. Verify OAuth configuration
3. Ensure redirect URLs are correctly set

### Storage Issues

If file uploads are failing:
1. Check storage bucket permissions
2. Verify RLS policies
3. Check file size limits

### Performance Issues

If the application is slow:
1. Check database query performance
2. Optimize React components
3. Consider adding indexes to frequently queried columns

## Contact and Support

For additional support or questions, please contact the development team at [your contact information].

## License

[Include license information here]
