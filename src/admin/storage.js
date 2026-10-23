const DATABASE = 'hakuba-admin-preview'
const STORE = 'drafts'

function openDatabase() {
  return new Promise((resolve, reject) => {
    let blocked = false
    const request = window.indexedDB.open(DATABASE, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' })
    request.onsuccess = () => {
      if (blocked) { request.result.close(); return }
      request.result.onversionchange = () => request.result.close()
      resolve(request.result)
    }
    request.onerror = () => reject(request.error)
    request.onblocked = () => { blocked = true; reject(new Error('Close other admin preview tabs and try again.')) }
  })
}

async function transact(mode, operation) {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE, mode)
    const request = operation(transaction.objectStore(STORE))
    transaction.oncomplete = () => { database.close(); resolve(request.result) }
    transaction.onerror = () => { database.close(); reject(transaction.error) }
    transaction.onabort = () => { database.close(); reject(transaction.error || new Error('Storage operation cancelled.')) }
  })
}

export const readDrafts = () => transact('readonly', (store) => store.getAll())
export const saveDraft = (draft) => transact('readwrite', (store) => store.put(draft))
export const deleteDraft = (id) => transact('readwrite', (store) => store.delete(id))
