# Hakuba Club Content

## Delivery Brief

Outcome: a small native WordPress content foundation for a parent-owned PHP
theme. Scope: only this plugin, three private content types, classic-admin
fields and the four query functions below. Native Posts and Media remain the
news system. No member/account code, bridge inclusion, activation import,
mail, Facebook, credentials, external calls, theme, runtime or seed export.

Acceptance evidence for this builder slice: source inspection, exact schema
and API hand-off, and actual PHP syntax lint. Stop after implementation and
lint; do not imply WordPress runtime acceptance, independent review or release.
No test suites or assertion-based checks are authorised for this slice.

Password-protection correction scope: exclude password-protected records from
all three club collections and reject password-protected venue/session
relationships, preserving existing publication and active-state exclusions.
Acceptance evidence is source inspection and PHP lint; stop before runtime
checks or release. Core Post/Page protection remains parent-owned.

## Setup

Install this directory as `wp-content/plugins/hakuba-club` and activate
`hakuba-club.php` in the parent-owned isolated WordPress runtime. Nothing is
created on activation. Add venues, then sessions, then dated cancellations.
No dependency on the separate approved-member bridge; it is neither loaded
nor activated by this plugin. Do not duplicate its capability/account code.

The content types are `hakuba_venue`, `hakuba_session`, `hakuba_exception`.
They have admin UIs but no public single/archive routes, navigation entries,
search inclusion, REST controllers or core sitemap entries. Standard WordPress
post capabilities apply; the primitive `read` capability is `edit_posts` and
form writes check `edit_post` for the actual object. Core Posts and Media are
unmodified. No roles or capabilities are granted on activation.

## Metadata Contract

All custom keys below are literal database keys. Store booleans as `'1'` or
`'0'`, IDs as positive integer values, dates as `YYYY-MM-DD`, times as `HH:MM`.
Location values are exactly `Wroughton`, `Mevagissey`, `Winterbourne`.
No aliases, postcode inference or location slugs are accepted.

### `hakuba_venue`

| Source | Meaning | Required |
| --- | --- | --- |
| `post_title` | Venue name | Yes |
| `_hakuba_address` | Postal/address text | No, defaults empty |
| `_hakuba_location` | Location enum above | Yes |
| `_hakuba_area` | Local area label | No, defaults empty |
| `_hakuba_primary` | Primary venue flag | No, defaults `'0'` |
| `_hakuba_note` | Visitor-facing plain-text note | No, defaults empty |
| `_hakuba_active` | Active flag | Must be `'1'` for API inclusion |
| `_thumbnail_id` | Native featured image attachment ID | No, API defaults `0` |

Supports native title and featured image. No editor body: the explicit visitor
note field is authoritative. More than one primary venue is allowed; the flag
is presentation data, not a global uniqueness constraint.

### `hakuba_session`

| Source | Meaning | Required |
| --- | --- | --- |
| `post_title` | Human-readable admin label | Yes |
| `_hakuba_key` | Unique slug matching `[a-z0-9]+(?:-[a-z0-9]+)*` | Yes |
| `_hakuba_venue_id` | Published active, valid `hakuba_venue` ID | Yes |
| `_hakuba_audience` | Plain-text attendance description | Yes |
| `_hakuba_type` | `Kids`, `Adults`, `Mixed` or `Family` | Yes |
| `_hakuba_day` | `Monday` through `Sunday`, exact English spelling | Yes |
| `_hakuba_start` | Valid 24-hour start time | Yes |
| `_hakuba_end` | Valid 24-hour end, strictly after start on same day | Yes |
| `_hakuba_active` | Active flag | Must be `'1'` for API inclusion |

Supports native title only. No overnight sessions in this slice.

### `hakuba_exception`

| Source | Meaning | Required |
| --- | --- | --- |
| `post_title` | Human-readable admin label | Yes |
| `_hakuba_session_id` | Published active, valid `hakuba_session` ID | Yes |
| `_hakuba_date` | Real calendar date matching the session weekday | Yes |
| `_hakuba_notice` | Plain-text visitor notice | Yes |
| `_hakuba_source` | Plain-text evidence/organiser reference | Yes |
| `_hakuba_checked_on` | Real verification date, no later than today in London | Yes |

Supports native title only. Every exception is a cancellation of one session
on one date. No recurring exceptions, assumed holidays, replacement venue,
replacement times or speculative notices. The source is entered by an editor;
the plugin does not fetch it or independently authenticate its truth.
Session/date pairs and session keys are checked for uniqueness against
published, scheduled, draft, pending and private records, excluding the current
record and trash. These are application checks, not database unique indexes.

## CLI Seeding

Use native PHP WordPress functions in the parent-owned runtime, not the admin
form. Create each record as a **draft**, write its complete metadata, then
publish with `wp_update_post`. Publish venues before dependent sessions and
sessions before cancellations. Check each returned status: a successful
`wp_update_post` ID alone does not mean publication succeeded. Publication
validation reads stored metadata; creating a published record with `meta_input`
in the same first insertion is intentionally not the seed contract.

```php
$id = wp_insert_post(array(
    'post_type' => 'hakuba_venue',
    'post_status' => 'draft',
    'post_title' => 'Example venue',
), true);
// The caller must handle WP_Error before writing metadata.
update_post_meta($id, '_hakuba_location', 'Wroughton');
update_post_meta($id, '_hakuba_active', '1');
update_post_meta($id, '_hakuba_primary', '0');
wp_update_post(array('ID' => $id, 'post_status' => 'publish'), true);
```

CLI code is trusted and bypasses the form nonce/capability guard by design.
`hakuba_club_validate($type, $unprefixed_fields, $id)` is available to the seed
owner and returns either cleaned fields or `WP_Error`. Do not suppress errors
or assume a draft is valid. Direct post-meta writes are not intercepted; API
readers validate persisted data so invalid imports do not become valid output.

## Theme API

All four functions are global PHP functions available after plugin loading.
Collection functions return numerically indexed arrays, never `WP_Error`.
Theme templates must escape returned strings for their output context.
`$location` is `'all'` or an exact location enum; unknown locations return `[]`.

```text
hakuba_club_get_venues($location = 'all')
  id:int, name:string, address:string, location:string, area:string,
  primary:bool, note:string, image_id:int

hakuba_club_get_sessions($location = 'all', $types = [])
  id:int, key:string, venue_id:int, venue:string, location:string,
  audience:string, type:string, day:string, start:string, end:string

hakuba_club_get_exceptions($location = 'all')
  id:int, session_id:int, date:string, notice:string, source:string,
  checked_on:string

hakuba_club_next_occurrence($session, $now = null)
  YYYY-MM-DD string or null
```

`venue` is the venue name, not a nested object. Sessions sort Monday to Sunday,
then start time, then ID. `$types` is an array of exact type strings; `[]`
means all types. Exceptions sort date, session ID, ID. Venues sort by ID.
Only published active valid venues/sessions without password protection are
included. Exceptions must be published without password protection and refer
to a currently valid active session and venue, both without password protection.
These public-data collections exclude protected records even when a visitor
has supplied a password or an editor is logged in. Relationship validation
also rejects protected references, including through a session's venue.
Private/draft records and inactive venues/sessions remain excluded. This plugin
does not change core Post/Page protection or the parent's theme handling.
Duplicate imported session keys fail closed. Duplicate imported valid cancellations
are deduplicated by session/date, keeping the lowest ID, so duplicates cannot
erase a cancellation and incorrectly advertise the session as running.

Pass a session API row to `next_occurrence`. Its `id` is resolved again against
the current valid active schedule: caller-provided schedule fields are not
trusted. `$now` accepts `DateTimeImmutable` (or another `DateTimeInterface`),
defaults to current time and is converted immutably to `Europe/London`.
The function searches today through the instant 35 calendar days later,
including that endpoint, skips starts before `$now`, and skips verified dated
cancellations. Nonexistent London wall times at the spring clock change are
skipped rather than moved to a different start time. It returns a date only,
not a replacement session or availability promise beyond that horizon.

## Admin Validation And Limits

The complete allowlisted submission is validated before any custom metadata
is saved. Unknown fields, invalid dates/times/options, unavailable references,
duplicate keys/pairs and missing verification details reject the whole field
set. A nonce tied to the object, per-object edit capability, autosave and
revision checks guard the classic admin form. Validation failures retain
previous custom metadata and the existing record's pre-edit publication status.
The status is read from the stored post inside `wp_insert_post_data`, before
WordPress updates the database, not from submitted status fields. Invalid new
records (including the editor's auto-drafts) remain drafts. An invalid edit
therefore does not silently withdraw an existing published cancellation.
Withdrawal requires the explicit native Trash action or a valid submission
changing publication status or active state. A user-specific expiring admin
notice explains a rejected field set. Native titles and featured images remain
WordPress-managed and are not rolled back with the custom field set.

No database transaction or concurrent-editor lock is added. A database write
failure or racing trusted import is not covered by a claim of transactional
atomicity. Atomic rejection here means validation never partially saves a
submitted custom field set. Native quick edits without the details form
validate the existing metadata before publication. REST editing for these
types is disabled, not partially implemented.

PHP lint proves syntax only. Native admin rendering, object capability
behaviour, SQLite persistence, save flows and runtime query/date behaviour
need parent-owned runtime evidence and focused independent code/security
review before wider use. This slice does not claim those checks or release.
