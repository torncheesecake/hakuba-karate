import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ImagePlus, LayoutDashboard, MessageSquare, Inbox, Radio, Trash2, Check, ArrowUpRight } from 'lucide-react'
import SEO from '../components/SEO'
import { readDrafts, saveDraft, deleteDraft } from './storage'

const sections = [
  { id: 'overview', label: 'Today', icon: LayoutDashboard },
  { id: 'photos', label: 'Photo library', icon: ImagePlus },
  { id: 'board', label: 'Noticeboard', icon: MessageSquare },
  { id: 'enquiries', label: 'Enquiries', icon: Inbox },
  { id: 'publishing', label: 'Publishing', icon: Radio },
]
const destinations = ['Website gallery', 'Facebook Page', 'Facebook group']

function PhotoPreview({ file }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const source = window.URL.createObjectURL(file)
    setUrl(source)
    return () => window.URL.revokeObjectURL(source)
  }, [file])
  return url ? <img src={url} alt={`Preview of ${file.name}`} /> : null
}

function Notice({ draft, onSave, onDelete, busy }) {
  async function reply(event) {
    event.preventDefault()
    const form = event.currentTarget
    const text = form.elements.reply.value.trim()
    if (!text) return
    const success = await onSave({ ...draft, replies: [...(draft.replies || []), { id: window.crypto.randomUUID(), text }] })
    if (success) form.reset()
  }
  return (
    <article className="club-admin__notice">
      <div className="club-admin__notice-heading"><span>{draft.dojo}</span><button type="button" disabled={busy} onClick={() => onDelete(draft.id)} aria-label={`Delete notice ${draft.title}`}><Trash2 size={16} /></button></div>
      <h3>{draft.title}</h3><p>{draft.body}</p>
      {(draft.replies || []).map((item) => <p className="club-admin__reply" key={item.id}>{item.text}</p>)}
      <form onSubmit={reply} className="club-admin__reply-form"><label htmlFor={`reply-${draft.id}`}>Local draft reply</label><input id={`reply-${draft.id}`} name="reply" maxLength="1000" required /><button disabled={busy} type="submit">Add reply</button></form>
    </article>
  )
}

export default function AdminPage() {
  const [active, setActive] = useState('overview')
  const [drafts, setDrafts] = useState([])
  const [photos, setPhotos] = useState([])
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [storageReady, setStorageReady] = useState(false)
  const [validatingPhotos, setValidatingPhotos] = useState(false)
  const selectionVersion = useRef(0)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [storageError, setStorageError] = useState('')
  const albums = drafts.filter((item) => item.kind === 'album')
  const notices = drafts.filter((item) => item.kind === 'notice')

  useEffect(() => {
    let mounted = true
    readDrafts().then((items) => { if (mounted) { setDrafts(items); setStorageReady(true) } }).catch(() => { if (mounted) setStorageError('Browser storage is unavailable. Drafts cannot be saved in this browser. Enable browser storage and reopen this preview to try again.') }).finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  async function persist(draft) {
    setBusy(true); setError(''); setMessage('')
    try {
      await saveDraft(draft)
      setDrafts((items) => [draft, ...items.filter((item) => item.id !== draft.id)])
      setMessage('Draft saved in this browser. Nothing has been published or sent.')
      return true
    } catch {
      setError('Could not save this draft. Browser storage may be full or unavailable. Your unsaved input is still here.')
      return false
    } finally { setBusy(false) }
  }

  async function remove(id) {
    setBusy(true); setError(''); setMessage('')
    try { await deleteDraft(id); setDrafts((items) => items.filter((item) => item.id !== id)); setMessage('Local draft deleted.') }
    catch { setError('Could not delete the draft. Try again when browser storage is available.') }
    finally { setBusy(false) }
  }

  async function choosePhotos(event) {
    const input = event.currentTarget
    const version = ++selectionVersion.current
    const files = Array.from(event.target.files || [])
    setPhotos([])
    setValidatingPhotos(false)
    setError('')
    if (files.length > 12 || files.some((file) => file.size > 10 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) {
      setError('Choose up to 12 JPEG, PNG or WebP images, each no larger than 10 MB.')
      input.value = ''
      return
    }
    try {
      setValidatingPhotos(true)
      // Decode sequentially rather than retaining several large images at once.
      for (const file of files) {
        await new Promise((resolve, reject) => {
        const url = window.URL.createObjectURL(file)
        const image = new window.Image()
        image.onload = () => {
          window.URL.revokeObjectURL(url)
          if (image.naturalWidth * image.naturalHeight > 20000000) reject(new Error('Image dimensions too large'))
          else resolve()
        }
        image.onerror = () => { window.URL.revokeObjectURL(url); reject(new Error('Invalid image')) }
        image.src = url
        })
        if (version !== selectionVersion.current) return
      }
      if (version === selectionVersion.current) setPhotos(files)
    } catch {
      if (version === selectionVersion.current) {
        setError('An image could not be read or exceeds 20 megapixels. Choose a smaller, valid image.')
        input.value = ''
      }
    } finally { if (version === selectionVersion.current) setValidatingPhotos(false) }
  }

  async function createAlbum(event) {
    event.preventDefault()
    const form = event.currentTarget
    if (validatingPhotos || !photos.length) { setError('Select valid photographs before saving an album.'); return }
    const title = form.elements.title.value.trim()
    const selected = destinations.filter((_, index) => form.elements[`destination-${index}`].checked)
    if (!title || !selected.length || !form.elements.permission.checked) { setError('Enter an album title, select a destination and confirm image permission.'); return }
    const success = await persist({ id: window.crypto.randomUUID(), kind: 'album', title, dojo: form.elements.dojo.value, caption: form.elements.caption.value.trim(), photos, destinations: selected, permissionConfirmed: form.elements.permission.checked, createdAt: new Date().toISOString() })
    if (success) { form.reset(); setPhotos([]) }
  }

  async function createNotice(event) {
    event.preventDefault()
    const form = event.currentTarget
    const title = form.elements.title.value.trim()
    const body = form.elements.body.value.trim()
    if (!title || !body) { setError('Enter a notice title and message.'); return }
    const success = await persist({ id: window.crypto.randomUUID(), kind: 'notice', title, body, dojo: form.elements.dojo.value, replies: [], createdAt: new Date().toISOString() })
    if (success) form.reset()
  }

  const disabled = busy || loading || !storageReady
  return (
    <div className="club-admin">
      <SEO title="Club admin preview | Hakuba Karate" description="Local preview of Hakuba club administration." noIndex />
      <aside className="club-admin__sidebar">
        <Link className="club-admin__brand" to="/"><img src="/hakuba-logo.png" alt="" /><span>Hakuba<span>Club administration</span></span></Link>
        <nav aria-label="Admin sections">{sections.map(({ id, label, icon: Icon }) => <button type="button" key={id} aria-pressed={active === id} onClick={() => { setActive(id); setMessage(''); setError('') }}><Icon size={19} />{label}</button>)}</nav>
        <Link className="club-admin__back" to="/"><ArrowLeft size={16} /> Back to website</Link>
      </aside>
      <main className="club-admin__main">
        <div className="club-admin__top"><span>CLUB WORKSPACE</span><span className="club-admin__badge">Local prototype</span></div>
        <div className="club-admin__disclaimer">This preview has no sign-in or shared database. Use sample content only. Drafts stay in this browser; Facebook and website publishing are not connected.</div>
        <header className="club-admin__heading"><p className="kicker">A little less admin. More time in the dojo.</p><h1>{sections.find((item) => item.id === active).label}</h1></header>
        {storageError && <p className="club-admin__error" role="alert">{storageError}</p>}
        {error && <p className="club-admin__error" role="alert">{error}</p>}{message && <p className="club-admin__success" role="status"><Check size={16} />{message}</p>}
        {loading && <p role="status">Loading local drafts...</p>}
        {active === 'overview' && <>
          <div className="club-admin__overview"><article><span>Photo album drafts</span><strong>{albums.length}</strong><button onClick={() => setActive('photos')}>Manage photographs <ArrowUpRight size={16} /></button></article><article><span>Noticeboard drafts</span><strong>{notices.length}</strong><button onClick={() => setActive('board')}>Open noticeboard <ArrowUpRight size={16} /></button></article></div>
          <section className="club-admin__intro"><h2>Upload once. Prepare every destination.</h2><p>Organise an album, add a caption and choose where it belongs. Each destination keeps its own publishing status, so you can see exactly what still needs attention.</p><button className="club-admin__primary" onClick={() => setActive('photos')}><ImagePlus size={18} /> Create a photo album</button></section>
          <section className="club-admin__connections"><h2>Connection status</h2>{destinations.map((item) => <div key={item}><strong>{item}</strong><span>Not connected</span></div>)}</section>
        </>}
        {active === 'photos' && <>
          <form onSubmit={createAlbum} className="club-admin__form">
            <div><h2>A new club moment</h2><p>JPEG, PNG or WebP. Up to 12 photos, 10 MB and 20 megapixels each.</p></div>
            <label className="club-admin__upload"><ImagePlus size={28} /><span>Choose photographs</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={choosePhotos} disabled={disabled} /></label>
            <div className="club-admin__photo-grid">{photos.map((file, index) => <figure key={`${file.name}-${index}`}><PhotoPreview file={file} /><figcaption>{file.name}</figcaption></figure>)}</div>
            <label>Album title<input name="title" maxLength="120" required /></label><label>Dojo<select name="dojo"><option>Wroughton</option><option>Mevagissey</option><option>Both dojos</option></select></label><label>Caption<textarea name="caption" rows="3" maxLength="3000" /></label>
            <fieldset><legend>Prepare for</legend>{destinations.map((item, index) => <label className="club-admin__check" key={item}><input name={`destination-${index}`} type="checkbox" defaultChecked={index === 0} /><span>{item}</span></label>)}</fieldset>
            <label className="club-admin__check"><input name="permission" type="checkbox" required /><span>I have permission to use these images for the selected destinations.</span></label><button type="submit" className="club-admin__primary" disabled={disabled || validatingPhotos}>{validatingPhotos ? 'Checking photographs...' : busy ? 'Saving...' : 'Save album draft'}</button>
          </form>
          <section><h2>Your album drafts</h2>{!albums.length && <p>No albums yet. Choose your first photographs above.</p>}{albums.map((album) => <article className="club-admin__album" key={album.id}><div><p className="kicker">{album.dojo}</p><h3>{album.title}</h3><p>{album.caption}</p></div><div className="club-admin__photo-grid">{album.photos.map((file, index) => <PhotoPreview file={file} key={index} />)}</div><p>{album.destinations.join(' / ')} · Draft only</p><button disabled={disabled} onClick={() => remove(album.id)}><Trash2 size={16} /> Delete draft</button></article>)}</section>
        </>}
        {active === 'board' && <>
          <form onSubmit={createNotice} className="club-admin__form"><h2>Write a club notice</h2><label>Title<input name="title" maxLength="120" required /></label><label>Audience<select name="dojo"><option>Both dojos</option><option>Wroughton</option><option>Mevagissey</option></select></label><label>Message<textarea name="body" maxLength="4000" rows="4" required /></label><button className="club-admin__primary" disabled={disabled}>Save notice draft</button></form>
          <section><h2>Noticeboard preview</h2><p>Notices and replies here are local drafts. They are not visible to members.</p>{!notices.length && <p>No notices yet.</p>}{notices.map((draft) => <Notice key={draft.id} draft={draft} onSave={persist} onDelete={remove} busy={disabled} />)}</section>
        </>}
        {active === 'enquiries' && <section className="club-admin__intro"><Inbox size={32} /><h2>A clearer path from enquiry to first class</h2><p>The live enquiry inbox is not connected yet. It will organise new enquiries by dojo, student age and preferred session, with an owner and next action.</p><p>No visitor submissions are being collected by this prototype.</p><Link to="/contact">View the current contact page</Link></section>}
        {active === 'publishing' && <section className="club-admin__connections"><h2>Three destinations. Separate outcomes.</h2><p>Albums are drafts only. Connecting publishing requires a server and authorised Facebook access.</p>{destinations.map((item) => <div key={item}><strong>{item}</strong><span>Not connected</span></div>)}<p>Facebook group automation must be checked against Meta's supported integrations. A manual sharing handoff can be used where automatic posting is unavailable.</p><h3>Prepared albums</h3>{!albums.length && <p>Save an album in the photo library to prepare it here.</p>}{albums.map((album) => <div key={album.id}><strong>{album.title}</strong><span>{album.destinations.join(', ')} · Draft</span></div>)}</section>}
      </main>
    </div>
  )
}
