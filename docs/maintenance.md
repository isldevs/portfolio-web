# Website owner's maintenance guide

Start here if you do not have web development experience. You can manage normal website content through the admin screen. You do not need to change code for that.

This guide describes the current repository. It does not mean a production server, domain, automatic backup, or monitoring service has already been configured.

## 1. Understand the three parts

| Part                         | Plain meaning                                          | What it holds                                                 |
| ---------------------------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| `portfolio-web`              | The website visitors see and the admin screens you use | Page layouts, colors, animations, forms                       |
| `portfolio-backend`          | The service that reads and saves your changes          | Login rules, publishing rules, file validation, API           |
| PostgreSQL and media storage | The permanent content storage                          | Text, accounts, messages, revisions, uploaded images and PDFs |

**All three must work for the complete website to work.** Restarting a service is different from deleting its stored data.

GitHub stores the application code. Pushing code to GitHub does **not** back up the live database or uploaded files, and does **not** automatically deploy the website unless someone has configured that separately.

## 2. Choose the correct kind of change

| You want to change…                                  | Where to do it                                 | Rebuild needed?                                     |
| ---------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| Name, biography, portrait, contact links, résumé     | Admin → Profile                                | No                                                  |
| Projects, articles, experience, skills, case studies | Matching admin menu                            | No; publish the item                                |
| Services and tools on the homepage                   | Admin → Settings                               | No                                                  |
| Your administrator password                          | Admin → Security                               | No                                                  |
| Colors, spacing, navigation, animation, page layout  | Frontend code; ask a developer if unsure       | Yes; build and release frontend                     |
| Login behavior, storage rules, database structure    | Backend code; ask a developer                  | Yes; backend release, possibly a database migration |
| Domain name, HTTPS certificate, hosting, backups     | Hosting configuration; ask the server operator | Depends on the change                               |

If you are changing content, use the admin screen first. Editing files in GitHub will not edit the content saved in the database.

## 3. Sign in and work safely

1. Open your website and append `/admin/login` to its address. The footer also has **Admin login**.
2. Enter your existing username and password. There is no universal/default account.
3. Use one browser tab per record while editing. Multiple people or tabs can otherwise overwrite an older version.
4. Save changes before navigating away. Wait for the success message.
5. Open the public page in a separate tab to confirm the result. Refresh an already-open public page after saving.
6. Sign out when finished, especially on a shared computer.

A first administrator account must be created during backend setup by the person configuring the server. If you lose access, ask that person to help; changing bootstrap environment variables does not reset an existing account. Never send passwords in chat, screenshots, or GitHub commits.

## 4. Update your profile, portrait, and résumé

1. Open **Profile**.
2. Update the name, professional title, headline, biography, location, availability, and social links as needed.
3. Use the portrait/résumé upload controls when replacing files. A résumé should be a PDF.
4. Check that the uploaded URL appears in the corresponding field.
5. Click the save button. **Uploading alone does not save the profile change.**
6. Check the homepage, About page, Contact page, and Résumé page. Open the résumé download to verify it is the correct file.

Profile changes are applied directly; Profile does not use the draft/publish workflow of projects and articles. Information you place here can become public. Use only contact details you want visitors to see.

## 5. Add or update a project or article

1. Choose **Projects** or **Blog posts**, then **Add project** or **Add article**.
2. Enter a clear title and short summary.
3. Check the **slug**. This is the last part of the page address, such as `payment-api` in `/projects/payment-api`. Use lowercase words separated by hyphens.
4. Write the main content in the editor. Add headings, lists, links, images, or code blocks as appropriate.
5. Fill in the relevant details, such as technologies, category, tags, links, or cover image. See the [feature reference](features.md).
6. Use **Save draft** while preparing the content. Drafts are hidden from visitors.
7. Review the preview and links, then click **Publish project** or **Publish article** when ready.
8. Open the public page and check the title, text, image, and links.

Keep existing slugs unchanged when possible. Changing a published slug changes its URL; this application does not automatically create a redirect from the old URL. Ask a developer to arrange a redirect if an old URL has already been shared.

### Publishing words explained

| Action/field        | Meaning                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------ |
| Draft / Save draft  | Keep the item private while editing                                                        |
| Published / Publish | Make the item available to visitors immediately                                            |
| Unpublish           | Return it to draft; its public detail page becomes unavailable                             |
| Archive             | Keep the record but remove it from public published content                                |
| Featured            | Mark selected content for featured placement; the homepage projects section uses this flag |
| Display order       | Smaller numbers appear first for lists using the default order                             |
| Duplicate as draft  | Create a separate private copy to use as a starting point                                  |
| Delete              | Permanently remove the record; this is not an archive or recycle bin                       |

Publication is immediate. There is no scheduled publishing feature. Profile and Settings have their own save controls and are not managed like article drafts. The list screen supports selecting several content items and using **Publish**, **Unpublish**, or **Archive** together; check your selection before applying a bulk action.

### Correct an article using revision history

For an existing article, open its editor and find its revision-history control. Select the required revision and choose **Restore**. Save any current changes you want to keep first. A restored article becomes a **draft**: review it, then publish it again. Revision history is for articles; do not assume every other content type has the same recovery feature.

## 6. Maintain the other admin features

The [feature reference](features.md) covers every menu and public page. Common tasks:

- **Experience, Skills, Case studies:** add truthful details, save, and publish. Empty sections stay empty until content is added.
- **Categories and Tags:** maintain labels used to organize content. The backend can block renaming or deleting a label while content still references it. Update the affected records first.
- **Settings:** enter homepage services and tools, one entry per line, then save. It is not the place to configure hosting, the domain, passwords, or animation speed.
- **Security:** enter current password, new password, and confirmation. The new password must have at least 14 characters and no more than 72 UTF-8 bytes. After success, sign in again with the new password.

## 7. Upload and maintain files

1. Open **Media library** and choose the intended visibility before uploading.
2. Choose PNG, JPEG, GIF, WebP, or PDF. SVG and other formats are not supported. Keep files below the 10 MB limit; smaller images usually load faster.
3. Copy the returned URL and place it in the appropriate content or profile field, then save that record.
4. Check the file from the public page if visitors should be able to open it.

**Public** files can be accessed by visitors through their public URL, even if you only linked them in a draft. **Private** files require administrator access; they will not work as a public portrait, article image, or résumé. Public is the normal choice for visitor-facing website assets.

Unused media can be deleted through Media library. Referenced media is protected from deletion, including references in article revision history. If deletion is blocked, replace/remove the relevant references first or ask a developer to investigate. Do not delete media files directly from server folders.

## 8. Read and process contact messages

1. Open **Messages**.
2. Search or filter the inbox to find the message.
3. Read it and set the appropriate status: **UNREAD**, **READ**, **RESOLVED**, or **ARCHIVED**.
4. Reply using your normal email application if a response is required.

The website saves messages to this private inbox. It does not currently send automatic notification emails or provide an email reply service. Check the inbox regularly. Delete messages only when you no longer need them; there is no message recycle bin.

## 9. A simple maintenance routine

| When                                     | What to check                                                                       | A good result                                                        |
| ---------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| After every content edit                 | Open the affected public page, image, or download                                   | Correct content; no broken link                                      |
| Every working day if accepting enquiries | Admin → Messages                                                                    | New enquiries are reviewed                                           |
| Weekly                                   | Homepage, navigation, one article, mobile layout, contact form                      | Everything opens and the test message reaches the inbox              |
| Weekly                                   | Ask the operator to check backups, disk space, and service errors                   | Recent usable backup; no unresolved failures                         |
| Before any software/server update        | Confirm a database + media backup and rollback plan                                 | A tested recovery path exists                                        |
| Monthly                                  | Review old content, public contact links, résumé, certificate renewal, dependencies | Information is current; technical updates reviewed by the maintainer |

This table is a suggested routine, not an automatic scheduler. Ask the operator to confirm how often backups actually run and where they are stored.

## 10. When something goes wrong

| What you see                                     | First step                                                          | Next step if it continues                                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| “Compiling” or slow first visit while developing | You may be using `npm run dev`; it compiles routes as you open them | Use production preview as described below; have a developer investigate slow production pages            |
| “Reconnecting to the backend”                    | Refresh once; check whether other pages work                        | Ask the operator to check backend and PostgreSQL                                                         |
| “Session expired” / 401                          | Sign in again                                                       | Check cookies and the HTTPS site address with the operator                                               |
| 403 / secure-session or CSRF error               | Reload the page and sign in again through the same website address  | Ask the operator to check HTTPS, cookies, and proxy configuration; do not disable security               |
| “Record changed”, “reload before saving”, or 409 | Copy any unsaved text somewhere private, then reload                | Review the latest record and reapply your intended changes                                               |
| Saved item not visible publicly                  | Check it is Published, not Draft/Archived; refresh the public page  | For homepage projects also check Featured and Display order; lists show only a limited number of entries |
| Missing image or résumé                          | Check URL, file visibility, and that the profile/content was saved  | Ask the operator to check media storage and backup status                                                |
| Upload rejected                                  | Check file type, size, and that the file opens normally             | Use a smaller valid file; ask the maintainer about permitted formats                                     |
| Message submitted but no email received          | Open Admin → Messages                                               | Email notification is not currently implemented                                                          |
| Cannot delete a file/category/tag                | Check whether it is still referenced                                | Ask the maintainer to identify references; do not force-delete database rows                             |
| Entire site down / 502 / 503                     | Note the time, page address, and visible message                    | Contact the server operator; see the technical guide                                                     |

When asking for help, provide: page address, approximate time, the steps you tried, expected result, actual result, and a screenshot without private information. Do not include passwords, session cookies, `.env` files, or private contact messages.

## 11. Run the website on your computer

This is a technical task. Follow these steps only after Node.js, the backend, and PostgreSQL have been set up. Node.js 22 LTS or newer is required. The backend README explains its prerequisites. Commands are typed in a terminal opened inside the `portfolio-web` repository folder.

For the first installation, copy `.env.example` to `.env.local` using your file manager and have the maintainer check the values. Do not overwrite an existing `.env.local`. Then run:

```bash
npm ci
```

Choose **one** mode:

| Purpose                                     | Commands                          | What to expect                                                                                  |
| ------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------- |
| Changing the website code                   | `npm run dev`                     | Turbopack development server; first visits can compile; edits appear automatically              |
| Testing the website as visitors will use it | `npm run build`, then `npm start` | Builds first; no route compilation during browsing; restart with a new build after code changes |

Run the two production commands separately and start only if the build succeeds. Keep the backend and PostgreSQL running. Open `http://127.0.0.1:3000` on that same computer. Stop the frontend with **Ctrl+C** in its terminal. Do not run development and production preview on the same port at the same time.

`npm start` includes the static files needed by the standalone production server. It starts only the frontend. It does not start Java or PostgreSQL, install dependencies, deploy a live site, or create an administrator account.

## 12. Backups and software updates

Ask your server operator to back up **both the PostgreSQL database and the uploaded media**. Code in GitHub alone is insufficient. Store an encrypted copy away from the server and periodically prove that it can be restored. The [technical guide](technical-maintenance.md) links to the actual backup procedure.

Content changes normally need only the admin save/publish steps. Software changes need validation, a Git commit/push, and a separate release/deployment. A successful GitHub push does not prove the live website changed.

Before approving a technical change, ask the maintainer: What changes? Has it been tested? Is there a recent backup? How do we undo it if it fails? Database restoration and migrations should be handled by someone familiar with PostgreSQL.

## Plain-language glossary

| Word                 | Meaning                                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Browser              | The application you use to open a website, such as Chrome or Safari.                                                    |
| URL                  | A page or file address.                                                                                                 |
| Server               | The computer that keeps your live website running.                                                                      |
| Database             | The organized storage for text, accounts, messages, and other records.                                                  |
| API                  | The connection through which the website asks the backend to read or save information.                                  |
| Environment variable | A setting supplied to the application, such as the backend address. Some settings contain private passwords.            |
| Build                | Preparing website code so it can run efficiently for visitors.                                                          |
| Deploy/release       | Putting a tested version onto the live server.                                                                          |
| Backup               | A separate copy of data that can be used for recovery.                                                                  |
| Restore              | Recovering data from a backup; it can replace newer data, so ask the operator for help.                                 |
| Rollback             | Returning to an earlier application version after a faulty release.                                                     |
| HTTPS                | An encrypted connection between a browser and the website, normally shown with a security indicator beside the address. |

## 13. Keep your own site record

Fill this in privately with your operator. Store secret values in a password manager, not in this repository.

| Item                                              | Your record                           |
| ------------------------------------------------- | ------------------------------------- |
| Public website address                            | To be recorded                        |
| Admin sign-in address                             | Your website address + `/admin/login` |
| Hosting provider and renewal contact              | To be recorded                        |
| Server operator / developer contact               | To be recorded                        |
| Domain renewal date                               | To be recorded                        |
| Backup frequency and last successful restore test | To be recorded                        |
| Location of protected backups                     | To be recorded                        |
| Current live frontend/backend release identifiers | To be recorded                        |

Next: [feature-by-feature reference](features.md) · [technical maintenance](technical-maintenance.md) · [launch checklist](launch-checklist.md)
